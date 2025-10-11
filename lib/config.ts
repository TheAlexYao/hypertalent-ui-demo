const DEFAULT_API_BASE_URL = "http://hypertalent-backend-alb-508528901.us-east-1.elb.amazonaws.com"

const normalizeUrl = (url: string) => url.replace(/\/+$/, "")

const envBaseUrl = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_API_BASE_URL : undefined

export const API_BASE_URL = envBaseUrl && envBaseUrl.trim().length > 0 ? normalizeUrl(envBaseUrl) : DEFAULT_API_BASE_URL

export const API_REQUEST_TIMEOUT_MS = 30_000
export const DEAL_STATUS_POLL_INTERVAL_MS = 2_500
export const DEAL_STATUS_POLL_TIMEOUT_MS = 120_000

export const isDevelopment = process.env.NODE_ENV !== "production"
