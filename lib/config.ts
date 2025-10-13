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

export const API_BASE_URL =
  envPublicBaseUrl && envPublicBaseUrl.trim().length > 0 ? normalizeUrl(envPublicBaseUrl) : defaultClientBaseUrl

export const API_REQUEST_TIMEOUT_MS = 30_000
export const DEAL_STATUS_POLL_INTERVAL_MS = 2_500
export const DEAL_STATUS_POLL_TIMEOUT_MS = 120_000

export const isDevelopment = process.env.NODE_ENV !== "production"
