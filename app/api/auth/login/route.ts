import { NextResponse } from "next/server"

import { API_BASE_URL } from "@/lib/config"

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      const fallback = await response.text()
      return new NextResponse(fallback, { status: response.status })
    }

    const data = await response.json()
    const redirectUrl = data?.authorization_url

    if (redirectUrl) {
      return NextResponse.redirect(redirectUrl)
    }

    return NextResponse.json(data)
  } catch (error: unknown) {
    console.error("Failed to proxy Google OAuth login", error)
    return NextResponse.json({ error: "Failed to initiate Google OAuth." }, { status: 500 })
  }
}
