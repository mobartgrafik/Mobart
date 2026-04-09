import { supabase } from "@/supabase";
import { deleteFileFromGoogleDrive, isGoogleDriveConfigured, uploadFileToGoogleDrive } from "@/lib/googleDriveStorage";

const STORAGE_PROVIDER_GOOGLE_DRIVE = "google-drive";
let nextOrderFileSequenceNumber = null;

export function getStorageProviderLabel() {
  return "Google Drive";
}

export function getStoredFilePreviewUrl(file) {
  return file?.viewUrl || file?.url || "";
}

export function getStoredFileDownloadUrl(file) {
  return file?.downloadUrl || file?.url || "";
}

export function formatOrderFileSequenceNumber(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return "";
  }

  return String(Math.trunc(numericValue)).padStart(5, "0");
}

export function getStoredFileSequenceLabel(file) {
  if (file?.sequenceLabel) {
    return file.sequenceLabel;
  }

  if (file?.sequenceNumber) {
    return formatOrderFileSequenceNumber(file.sequenceNumber);
  }

  const matchedPrefix = String(file?.name || "").match(/^(\d{5})/);
  return matchedPrefix?.[1] || "";
}

export function isGoogleDriveStoredFile(file) {
  return file?.provider === STORAGE_PROVIDER_GOOGLE_DRIVE || Boolean(file?.id);
}

function ensureGoogleDriveConfigured() {
  if (!isGoogleDriveConfigured()) {
    throw new Error("Upload plików jest włączony tylko przez Google Drive. Ustaw `VITE_GOOGLE_DRIVE_CLIENT_ID` i skonfiguruj OAuth Google.");
  }
}

function getFileExtension(fileName) {
  const matchedExtension = String(fileName || "").match(/(\.[^.]+)$/);
  return matchedExtension?.[1] || "";
}

function extractSequenceNumberFromFile(file) {
  if (file?.sequenceNumber) {
    return Number(file.sequenceNumber);
  }

  const matchedPrefix = String(file?.name || "").match(/^(\d{5})/);
  return matchedPrefix ? Number(matchedPrefix[1]) : 0;
}

async function fetchNextOrderFileSequenceNumber() {
  const { data, error } = await supabase
    .from("orders")
    .select("files");

  if (error) {
    throw new Error(`Nie udało się ustalić kolejnego numeru pliku. ${error.message}`);
  }

  const maxSequenceNumber = (data || []).reduce((highestNumber, order) => {
    const orderFiles = Array.isArray(order?.files) ? order.files : [];
    const orderHighestNumber = orderFiles.reduce((fileHighestNumber, file) => {
      return Math.max(fileHighestNumber, extractSequenceNumberFromFile(file));
    }, 0);

    return Math.max(highestNumber, orderHighestNumber);
  }, 0);

  nextOrderFileSequenceNumber = maxSequenceNumber + 1;
  return nextOrderFileSequenceNumber;
}

async function reserveNextOrderFileSequenceNumber() {
  if (nextOrderFileSequenceNumber == null) {
    await fetchNextOrderFileSequenceNumber();
  }

  const reservedNumber = nextOrderFileSequenceNumber;
  nextOrderFileSequenceNumber += 1;
  return reservedNumber;
}

async function uploadOrderFile(file) {
  ensureGoogleDriveConfigured();
  const folderId = import.meta.env.VITE_GOOGLE_DRIVE_ORDER_FILES_FOLDER_ID?.trim();
  const sequenceNumber = await reserveNextOrderFileSequenceNumber();
  const sequenceLabel = formatOrderFileSequenceNumber(sequenceNumber);
  const extension = getFileExtension(file.name);

  return uploadFileToGoogleDrive(file, {
    folderId,
    fileName: `${sequenceLabel}${extension}`,
    metadata: {
      sequenceNumber,
      sequenceLabel,
      originalName: file.name,
    },
  });
}

export async function uploadOrderFiles(fileList) {
  const uploadedFiles = [];

  for (const file of fileList) {
    uploadedFiles.push(await uploadOrderFile(file));
  }

  return uploadedFiles;
}

export async function uploadAvatarFile(file, userId) {
  const extension = file.name?.split(".").pop() || "png";
  const fileName = `${Date.now()}.${extension}`;

  ensureGoogleDriveConfigured();
  const folderId = import.meta.env.VITE_GOOGLE_DRIVE_AVATARS_FOLDER_ID?.trim();
  return uploadFileToGoogleDrive(file, {
    folderId,
    fileName: `${userId || "avatar"}-${fileName}`,
  });
}

export async function deleteStoredFile(file) {
  ensureGoogleDriveConfigured();

  if (!isGoogleDriveStoredFile(file)) {
    return;
  }

  if (!file?.id) {
    throw new Error("Tego pliku nie da się automatycznie usunąć z Google Drive, bo brakuje jego identyfikatora.");
  }

  await deleteFileFromGoogleDrive(file.id);
}

export async function deleteStoredFiles(files) {
  for (const file of files || []) {
    await deleteStoredFile(file);
  }
}
