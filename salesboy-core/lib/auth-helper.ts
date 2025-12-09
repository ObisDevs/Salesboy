import { NextRequest } from 'next/server'

/**
 * Extract user ID from request headers (set by middleware)
 */
export function getUserIdFromRequest(request: NextRequest): string | null {
  return request.headers.get('x-user-id')
}

/**
 * Extract user email from request headers (set by middleware)
 */
export function getUserEmailFromRequest(request: NextRequest): string | null {
  return request.headers.get('x-user-email')
}

/**
 * Validate that user is authenticated
 */
export function requireAuth(request: NextRequest): { userId: string; email: string } | null {
  const userId = request.headers.get('x-user-id')
  const email = request.headers.get('x-user-email')

  if (!userId) {
    return null
  }

  return { userId, email: email || '' }
}
