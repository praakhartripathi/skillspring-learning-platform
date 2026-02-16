import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Paths that don't require authentication
const PUBLIC_PATHS = ["/", "/login", "/signup", "/courses"];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Allow public paths
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Get auth token from cookies (Supabase sets this automatically)
  const token = request.cookies.get("sb-nxkhckppdbvbfpebibgg-auth-token");

  // If no token and accessing protected route, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Role-based access control
  if (pathname.startsWith("/admin")) {
    // This will be enforced on the client side with proper auth check
    // Server-side validation would require decoding JWT
  }

  if (pathname.startsWith("/instructor")) {
    // This will be enforced on the client side
  }

  if (pathname.startsWith("/student")) {
    // This will be enforced on the client side
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/student/:path*",
    "/instructor/:path*",
    "/courses/:path*",
  ],
};
