import { NextResponse, type NextRequest } from "next/server"

import { BACKEND_API_BASE_URL } from "@/lib/config"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type RouteContext = {
  params: {
    path?: string[]
  }
}

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
])

const BACKEND_URL = new URL(BACKEND_API_BASE_URL)

const filterRequestHeaders = (request: NextRequest) => {
  const headers = new Headers()

  request.headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase()
    if (HOP_BY_HOP_HEADERS.has(lowerKey)) {
      return
    }

    if (lowerKey === "host") {
      headers.set("host", BACKEND_URL.host)
      return
    }

    if (lowerKey === "origin") {
      headers.set("origin", BACKEND_URL.origin)
      return
    }

    headers.set(key, value)
  })

  const forwardedHost = request.headers.get("host")
  if (forwardedHost) {
    headers.set("x-forwarded-host", forwardedHost)
  }

  const forwardedProto = request.headers.get("x-forwarded-proto") ?? (request.nextUrl.protocol.replace(":", "") || "https")
  headers.set("x-forwarded-proto", forwardedProto)

  return headers
}

const filterResponseHeaders = (response: Response) => {
  const headers = new Headers()

  response.headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase()
    if (HOP_BY_HOP_HEADERS.has(lowerKey)) {
      return
    }
    if (lowerKey === "content-length") {
      return
    }

    if (lowerKey === "location") {
      const targetUrl = new URL(value, BACKEND_URL.origin)
      headers.set(key, targetUrl.toString())
      return
    }

    headers.set(key, value)
  })

  const setCookieValues = (response.headers as unknown as { raw?: () => Record<string, string[]> }).raw?.()?.["set-cookie"]
  if (setCookieValues && Array.isArray(setCookieValues)) {
    setCookieValues.forEach((cookie) => headers.append("set-cookie", cookie))
  }

  return headers
}

const buildBackendUrl = (segments: string[] = [], searchParams: string) => {
  const path = segments.join("/")
  const url = new URL(path ? `${path}` : "", BACKEND_URL)
  url.search = searchParams
  return url
}

const proxyAuthCallback = async (request: NextRequest, path: string[]) => {
  const targetUrl = buildBackendUrl(path, request.nextUrl.search)
  const headers = filterRequestHeaders(request)

  const backendResponse = await fetch(targetUrl, {
    method: request.method,
    headers,
    redirect: "manual",
  })

  const responseHeaders = filterResponseHeaders(backendResponse)
  const contentType = backendResponse.headers.get("content-type") ?? ""
  const rawBody = await backendResponse.arrayBuffer()

  let responseData: unknown = null
  if (contentType.includes("application/json")) {
    try {
      responseData = JSON.parse(Buffer.from(rawBody).toString("utf-8"))
    } catch (error) {
      console.warn("Failed to parse auth callback JSON", error)
    }
  }

  const sessionId =
    typeof responseData === "object" && responseData !== null && "session_id" in responseData
      ? (responseData as Record<string, unknown>).session_id
      : undefined

  if (!backendResponse.ok) {
    return new NextResponse(rawBody, {
      status: backendResponse.status,
      headers: responseHeaders,
    })
  }

  const targetOrigin = request.nextUrl.origin

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Authentication Complete</title>
  </head>
  <body>
    <p>Authentication successful. You can close this window.</p>
    <script>
      (function () {
        var payload = ${JSON.stringify(responseData ?? null)};
        var sessionId = ${sessionId ? JSON.stringify(sessionId) : "null"};
        try {
          if (sessionId) {
            localStorage.setItem("hyper-talent-session-id", sessionId);
          } else {
            localStorage.removeItem("hyper-talent-session-id");
          }
        } catch (error) {
          console.warn("Unable to persist session ID", error);
        }
        try {
          if (window.opener) {
            window.opener.postMessage(
              {
                type: "hypertalent-auth",
                payload: payload,
                sessionId: sessionId,
              },
              ${JSON.stringify(targetOrigin)}
            );
          }
        } catch (error) {
          console.warn("Unable to notify opener window", error);
        }
        try {
          if (typeof BroadcastChannel !== "undefined") {
            var authChannel = new BroadcastChannel("hypertalent-auth");
            authChannel.postMessage({
              type: "hypertalent-auth",
              payload: payload,
              sessionId: sessionId,
              timestamp: Date.now()
            });
            authChannel.close();
          }
        } catch (error) {
          console.warn("Unable to broadcast auth state", error);
        }
        try {
          window.close();
        } catch (error) {
          console.warn("Unable to close auth window", error);
        }
      })();
    </script>
  </body>
</html>`

  const htmlResponse = new NextResponse(html, {
    status: 200,
    headers: responseHeaders,
  })
  htmlResponse.headers.set("content-type", "text/html; charset=utf-8")

  return htmlResponse
}

const proxyRequest = async (request: NextRequest, context: RouteContext) => {
  const pathSegments = context.params.path ?? []
  const targetUrl = buildBackendUrl(pathSegments, request.nextUrl.search)

  if (pathSegments.length >= 2 && pathSegments[0] === "auth" && pathSegments[1] === "callback") {
    return proxyAuthCallback(request, pathSegments)
  }

  const headers = filterRequestHeaders(request)

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "manual",
  }

  if (!["GET", "HEAD"].includes(request.method)) {
    const body = await request.arrayBuffer()
    if (body.byteLength > 0) {
      init.body = body
    }
  }

  const backendResponse = await fetch(targetUrl, init)
  const responseHeaders = filterResponseHeaders(backendResponse)

  if (request.method === "HEAD") {
    return new NextResponse(null, {
      status: backendResponse.status,
      headers: responseHeaders,
    })
  }

  const responseBuffer = await backendResponse.arrayBuffer()

  return new NextResponse(responseBuffer, {
    status: backendResponse.status,
    headers: responseHeaders,
  })
}

export async function GET(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context)
}

export async function POST(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context)
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context)
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context)
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context)
}

export async function OPTIONS(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context)
}
