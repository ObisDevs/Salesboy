import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

/**
 * Extract authenticated user from request via Supabase auth-helpers
 */
export async function getAuthenticatedUser(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.id) return null

    return {
      userId: user.id,
      email: user.email || '',
      user
    }
  } catch (error) {
    console.error('Error getting authenticated user:', error)
    return null
  }
}

/**
 * Require authentication - return error if not authenticated
 */
export async function requireAuth(request: NextRequest) {
  const auth = await getAuthenticatedUser(request)

  if (!auth) {
    return {
      error: NextResponse.json(
        { error: 'Unauthorized: Please log in' },
        { status: 401 }
      ),
      auth: null,
    }
  }

  return { error: null, auth }
}

/**
 * Create server client for middleware and server components
 */
export function createServerClient() {
  return createServerComponentClient({ cookies })
}
