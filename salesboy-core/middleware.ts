import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/server-auth'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Skip middleware for API routes and static files
  if (pathname.startsWith('/api/') || pathname.startsWith('/_next/') || pathname.includes('.')) {
    return NextResponse.next()
  }

  // Check if accessing dashboard or sessions
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/sessions')) {
    try {
      const supabase = createServerClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      // Redirect to login if not authenticated
      if (authError || !user) {
        return NextResponse.redirect(new URL('/login', req.url))
      }

      // Check user plan status
      const { data: userPlan, error: planError } = await supabase
        .from('user_plans')
        .select('*')
        .eq('user_id', user.id)
        .single()

      // If error is not "no rows found", log it but allow access
      if (planError && planError.code !== 'PGRST116') {
        console.error('Middleware plan fetch error:', planError)
        // Allow access on error to prevent infinite loop
        return NextResponse.next()
      }

      const hasActivePlan = userPlan && 
        userPlan.status === 'active' && 
        new Date(userPlan.expires_at) > new Date()

      // Redirect to payment if no active plan
      if (!hasActivePlan) {
        return NextResponse.redirect(new URL('/payment', req.url))
      }
    } catch (error) {
      console.error('Middleware error:', error)
      // Allow access on error to prevent infinite loop
      return NextResponse.next()
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/sessions/:path*'],
}