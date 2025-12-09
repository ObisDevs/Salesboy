import { NextRequest, NextResponse } from 'next/server'

// Middleware to handle auth redirects and cookie preservation
// Individual route handlers will enforce auth via requireAuth() helper
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow all requests to pass through
  // Route handlers will check auth via requireAuth() which uses createRouteHandlerClient
  // This ensures proper cookie handling and Supabase session verification
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*']
}
