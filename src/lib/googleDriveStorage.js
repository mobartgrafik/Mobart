const GOOGLE_IDENTITY_SCRIPT_SRC = "https://accounts.google.com/gsi/client";
const GOOGLE_DRIVE_UPLOAD_URL = "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,webContentLink";
const GOOGLE_DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";

let googleIdentityScriptPromise;
let googleDriveAccessToken = null;

function getGoogleDriveClientId() {
  return import.meta.env.VITE_GOOGLE_DRIVE_CLIENT_ID?.trim() || "";
}

export function isGoogleDriveConfigured() {
  return Boolean(getGoogleDriveClientId());
}

function loadGoogleIdentityScript() {
  if (window.google?.accounts?.oauth2) {
    return Promise.resolve();
  }

  if (googleIdentityScriptPromise) {
    return googleIdentityScriptPromise;
  }

  googleIdentityScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${GOOGLE_IDENTITY_SCRIPT_SRC}"]`);
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Nie udało się załadować Google Identity Services.")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = GOOGLE_IDENTITY_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Nie udało się załadować Google Identity Services."));
    document.head.appendChild(script);
  });

  return googleIdentityScriptPromise;
}

async function getGoogleDriveAccessToken() {
  const clientId = getGoogleDriveClientId();
  if (!clientId) {
    throw new Error("Brakuje `VITE_GOOGLE_DRIVE_CLIENT_ID` do uploadu plików na Google Drive.");
  }

  if (googleDriveAccessToken) {
    return googleDriveAccessToken;
  }

  await loadGoogleIdentityScript();

  return new Promise((resolve, reject) => {
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: GOOGLE_DRIVE_SCOPE,
      callback: (response) => {
        if (response?.error) {
          reject(new Error(response.error_description || response.error || "Autoryzacja Google Drive nie powiodła się."));
          return;
        }

        googleDriveAccessToken = response?.access_token || null;
        resolve(googleDriveAccessToken);
      },
      error_callback: () => reject(new Error("Autoryzacja Google Drive została przerwana.")),
    });

    tokenClient.requestAccessToken({ prompt: "consent" });
  });
}

function getDrivePreviewUrl(fileId) {
  return `https://drive.google.com/file/d/${fileId}/view`;
}

function getDriveDownloadUrl(fileId) {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

async function createPublicPermission(fileId, accessToken) {
  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      role: "reader",
      type: "anyone",
    }),
  });

  if (!response.ok && response.status !== 409) {
    const errorText = await response.text();
    throw new Error(`Nie udało się udostępnić pliku na Google Drive. ${errorText}`);
  }
}

export async function uploadFileToGoogleDrive(file, { folderId, fileName = file.name, metadata: customMetadata = {} } = {}) {
  const accessToken = await getGoogleDriveAccessToken();
  const metadata = {
    name: fileName,
  };

  if (file.type) {
    metadata.mimeType = file.type;
  }

  if (folderId) {
    metadata.parents = [folderId];
  }

  const boundary = `mobart-${Date.now()}`;
  const requestBody = new Blob([
    `--${boundary}\r\n`,
    "Content-Type: application/json; charset=UTF-8\r\n\r\n",
    `${JSON.stringify(metadata)}\r\n`,
    `--${boundary}\r\n`,
    `Content-Type: ${file.type || "application/octet-stream"}\r\n\r\n`,
    file,
    "\r\n",
    `--${boundary}--`,
  ]);

  const uploadResponse = await fetch(GOOGLE_DRIVE_UPLOAD_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": `multipart/related; boundary=${boundary}`,
    },
    body: requestBody,
  });

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    throw new Error(`Upload do Google Drive nie powiódł się. ${errorText}`);
  }

  const uploadedFile = await uploadResponse.json();
  let permissionErrorMessage = "";

  try {
    await createPublicPermission(uploadedFile.id, accessToken);
  } catch (error) {
    permissionErrorMessage = error instanceof Error ? error.message : "Nie udało się nadać dostępu do pliku na Google Drive.";
    console.error("Google Drive permission error:", error);
  }

  return {
    id: uploadedFile.id,
    name: fileName,
    originalName: customMetadata.originalName || file.name,
    type: file.type || uploadedFile.mimeType || "",
    provider: "google-drive",
    url: uploadedFile.webViewLink || getDrivePreviewUrl(uploadedFile.id),
    viewUrl: uploadedFile.webViewLink || getDrivePreviewUrl(uploadedFile.id),
    downloadUrl: uploadedFile.webContentLink || getDriveDownloadUrl(uploadedFile.id),
    permissionError: permissionErrorMessage,
    ...customMetadata,
  };
}

export async function deleteFileFromGoogleDrive(fileId) {
  if (!fileId) {
    throw new Error("Brakuje identyfikatora pliku Google Drive do usunięcia.");
  }

  const accessToken = await getGoogleDriveAccessToken();
  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok && response.status !== 404) {
    const errorText = await response.text();
    throw new Error(`Nie udało się usunąć pliku z Google Drive. ${errorText}`);
  }
}
