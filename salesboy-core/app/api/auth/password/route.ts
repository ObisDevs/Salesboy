import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/server-auth'

export async function POST(request: NextRequest) {
  try {
    const { action, email, currentPassword, newPassword } = await request.json()

    if (action === 'reset') {
      // Forgot password - send reset email
      const supabase = createServerClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`
      })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json({ message: 'Password reset email sent' })
    }

    if (action === 'change') {
      // Change password - requires current password
      const supabase = createServerClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      // Verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: currentPassword
      })

      if (signInError) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 400 })
      }

      return NextResponse.json({ message: 'Password updated successfully' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Password management error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}