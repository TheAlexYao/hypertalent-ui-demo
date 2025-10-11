import { API_BASE_URL, API_REQUEST_TIMEOUT_MS, isDevelopment } from "@/lib/config"

type ApiFetchOptions = RequestInit & {
  timeoutMs?: number
}

const buildUrl = (path: string) => {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path
  }
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return `${API_BASE_URL}${normalizedPath}`
}

const mergeHeaders = (init?: HeadersInit): Headers => {
  const headers = new Headers(init)
  return headers
}

export class ApiError<T = unknown> extends Error {
  status: number
  data: T
  url: string

  constructor(message: string, status: number, data: T, url: string) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.data = data
    this.url = url
  }
}

export async function apiFetch<TResponse = unknown>(
  path: string,
  { timeoutMs = API_REQUEST_TIMEOUT_MS, ...options }: ApiFetchOptions = {},
): Promise<TResponse> {
  const url = buildUrl(path)
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const headers = mergeHeaders(options.headers)

    const isJsonBody = options.body && !(options.body instanceof FormData)
    if (isJsonBody && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json")
    }

    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
      credentials: "include",
    })

    const contentType = response.headers.get("content-type") || ""

    if (!response.ok) {
      let errorPayload: unknown = null
      try {
        errorPayload = contentType.includes("application/json") ? await response.json() : await response.text()
      } catch (parseError) {
        if (isDevelopment) {
          console.warn("Failed to parse error response", parseError)
        }
      }
      throw new ApiError(response.statusText || "Request failed", response.status, errorPayload, url)
    }

    if (response.status === 204) {
      return undefined as TResponse
    }

    if (contentType.includes("application/json")) {
      return (await response.json()) as TResponse
    }

    const text = await response.text()
    return text as unknown as TResponse
  } finally {
    clearTimeout(timer)
  }
}

export const apiGet = <TResponse = unknown>(path: string, options?: ApiFetchOptions) =>
  apiFetch<TResponse>(path, { method: "GET", ...options })

export const apiPost = <TResponse = unknown, TBody = unknown>(path: string, body?: TBody, options?: ApiFetchOptions) =>
  apiFetch<TResponse>(path, {
    method: "POST",
    body: body && !(body instanceof FormData) ? JSON.stringify(body) : (body as BodyInit | null | undefined),
    ...options,
  })
