import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Admin login sayfasını koruma sisteminden hariç tut
  if (request.nextUrl.pathname === "/admin/login") {
    return NextResponse.next()
  }

  // Admin sayfalarını kontrol et
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const authToken = request.cookies.get("admin_auth_token")?.value

    // Kimlik doğrulama token'ı yoksa login sayfasına yönlendir
    if (!authToken) {
      const loginUrl = new URL("/admin/login", request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

// Middleware'in çalışacağı yolları belirt
export const config = {
  matcher: ["/admin/:path*"],
}
