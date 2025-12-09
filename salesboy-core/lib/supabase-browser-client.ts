import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'

let supabaseInstance: any = null

/**
 * Get or create a singleton Supabase client for the browser
 * This prevents multiple GoTrueClient instances from being created
 */
export function getSupabaseBrowserClient() {
  if (!supabaseInstance) {
    supabaseInstance = createPagesBrowserClient()
  }
  return supabaseInstance
}

/**
 * Restore session from localStorage on first app load
 * Call this once during app initialization (e.g., in root layout)
 */
export async function restoreSessionFromStorage() {
  const supabase = getSupabaseBrowserClient()
  
  try {
    // Get the stored session and try to refresh it
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (session) {
      console.log('✓ Session restored from storage:', session.user.email)
      return session
    } else if (error) {
      console.error('Error restoring session:', error)
    } else {
      console.log('No stored session found')
    }
  } catch (err) {
    console.error('Failed to restore session:', err)
  }
  
  return null
}
