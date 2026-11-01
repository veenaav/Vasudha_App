/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_PORT?: string
  readonly VITE_PROXY_TARGET?: string
  readonly VITE_MAPBOX_TOKEN?: string
  readonly VITE_MAPBOX_ACCESS_TOKEN?: string
  readonly VITE_DEFAULT_LATITUDE?: string
  readonly VITE_DEFAULT_LONGITUDE?: string
  readonly VITE_DEFAULT_ZOOM?: string
  readonly VITE_APP_TITLE?: string
  readonly VITE_APP_SHORT_NAME?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

