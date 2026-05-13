interface ImportMetaEnv {
  readonly VITE_BASE44_APP_ID?: string
  readonly VITE_BASE44_APP_BASE_URL?: string
  readonly VITE_GOOGLE_DRIVE_CLIENT_ID?: string
  readonly VITE_GOOGLE_DRIVE_ORDER_FILES_FOLDER_ID?: string
  readonly VITE_GOOGLE_DRIVE_AVATARS_FOLDER_ID?: string
  readonly VITE_SUPABASE_REQUEST_TIMEOUT_MS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  google?: {
    accounts?: {
      oauth2?: {
        initTokenClient: (config: any) => {
          requestAccessToken: (options?: any) => void
        }
      }
    }
  }
}
