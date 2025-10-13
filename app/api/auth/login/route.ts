import { NextResponse, type NextRequest } from "next/server"

import { BACKEND_API_BASE_URL } from "@/lib/config"

export const dynamic = "force-dynamic"

const LOGIN_ENDPOINT = "/auth/login"

const collectCookies = (response: Response) =>
  (response.headers as unknown as { raw?: () => Record<string, string[]> }).raw?.()?.["set-cookie"]

export async function GET(request: NextRequest) {
  try {
    const targetUrl = new URL(LOGIN_ENDPOINT, BACKEND_API_BASE_URL)
    targetUrl.search = request.nextUrl.search

    const headers = new Headers({ Accept: "application/json" })
    const cookieHeader = request.headers.get("cookie")
    if (cookieHeader) {
      headers.set("cookie", cookieHeader)
    }

    const response = await fetch(targetUrl, {
      method: "GET",
      headers,
      redirect: "manual",
      cache: "no-store",
    })

    if (!response.ok) {
      const fallback = await response.text()
      return new NextResponse(fallback, { status: response.status })
    }

    const data = await response.json()
    const redirectUrl = data?.authorization_url

    if (redirectUrl) {
      const proxyResponse = NextResponse.redirect(redirectUrl, { status: 302 })
      const setCookieHeaders = collectCookies(response)

      if (setCookieHeaders && Array.isArray(setCookieHeaders)) {
        setCookieHeaders.forEach((cookie) => proxyResponse.headers.append("set-cookie", cookie))
      }

      return proxyResponse
    }

    const jsonResponse = NextResponse.json(data, { status: response.status })
    const setCookieHeaders = collectCookies(response)

    if (setCookieHeaders && Array.isArray(setCookieHeaders)) {
      setCookieHeaders.forEach((cookie) => jsonResponse.headers.append("set-cookie", cookie))
    }

    return jsonResponse
  } catch (error: unknown) {
    console.error("Failed to proxy Google OAuth login", error)
    return NextResponse.json({ error: "Failed to initiate Google OAuth." }, { status: 500 })
  }
}
