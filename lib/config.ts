const DEFAULT_BACKEND_BASE_URL = "http://hypertalent-backend-alb-508528901.us-east-1.elb.amazonaws.com"

const normalizeUrl = (url: string) => url.replace(/\/+$/, "")

const envPublicBaseUrl = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_API_BASE_URL : undefined
const envBackendBaseUrl = typeof process !== "undefined" ? process.env.BACKEND_API_BASE_URL : undefined

export const BACKEND_API_BASE_URL =
  envBackendBaseUrl && envBackendBaseUrl.trim().length > 0 ? normalizeUrl(envBackendBaseUrl) : DEFAULT_BACKEND_BASE_URL

const resolveDefaultClientBaseUrl = () => {
  if (typeof window !== "undefined") {
    return "/api/backend"
  }
  return BACKEND_API_BASE_URL
}

const defaultClientBaseUrl = resolveDefaultClientBaseUrl()

const computeClientBaseUrl = (): string => {
  const trimmedEnv = envPublicBaseUrl?.trim()
  if (trimmedEnv && trimmedEnv.length > 0) {
    const normalized = normalizeUrl(trimmedEnv)

    if (typeof window !== "undefined") {
      const pageIsHttps = window.location?.protocol === "https:"
      const targetsDefaultBackend = normalized.includes("hypertalent-backend-alb-508528901.us-east-1.elb.amazonaws.com")

      if (pageIsHttps && targetsDefaultBackend) {
        return "/api/backend"
      }

      if (pageIsHttps && normalized.startsWith("http://")) {
        return "/api/backend"
      }
    }

    return normalized
  }

  return defaultClientBaseUrl
}

export const API_BASE_URL = computeClientBaseUrl()

export const API_REQUEST_TIMEOUT_MS = 30_000
export const DEAL_STATUS_POLL_INTERVAL_MS = 2_500
export const DEAL_STATUS_POLL_TIMEOUT_MS = 1_200_000

export const isDevelopment = process.env.NODE_ENV !== "production"
