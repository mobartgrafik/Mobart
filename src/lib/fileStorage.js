import { deleteFileFromGoogleDrive, isGoogleDriveConfigured, uploadFileToGoogleDrive } from "@/lib/googleDriveStorage";

const STORAGE_PROVIDER_GOOGLE_DRIVE = "google-drive";

export function getStorageProviderLabel() {
  return "Google Drive";
}

export function getStoredFilePreviewUrl(file) {
  return file?.viewUrl || file?.url || "";
}

export function getStoredFileDownloadUrl(file) {
  return file?.downloadUrl || file?.url || "";
}

export function isGoogleDriveStoredFile(file) {
  return file?.provider === STORAGE_PROVIDER_GOOGLE_DRIVE || Boolean(file?.id);
}

function ensureGoogleDriveConfigured() {
  if (!isGoogleDriveConfigured()) {
    throw new Error("Upload plików jest włączony tylko przez Google Drive. Ustaw `VITE_GOOGLE_DRIVE_CLIENT_ID` i skonfiguruj OAuth Google.");
  }
}

async function uploadOrderFile(file) {
  ensureGoogleDriveConfigured();
  const folderId = import.meta.env.VITE_GOOGLE_DRIVE_ORDER_FILES_FOLDER_ID?.trim();
  return uploadFileToGoogleDrive(file, {
    folderId,
    fileName: `${Date.now()}-${file.name}`,
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
