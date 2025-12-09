import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * Called after user successfully signs up
 * Creates initial profile, bot_config, and session records
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await request.json()

    if (!userId || !email) {
      return NextResponse.json({ error: 'userId and email required' }, { status: 400 })
    }

    console.log(`🔑 Initializing new user: ${userId} (${email})`)

    // 1. Create profile if not exists
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()

    if (!existingProfile) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: userId,
          email,
          created_at: new Date().toISOString(),
          metadata: { onboarded: true }
        })

      if (profileError) {
        console.error('Failed to create profile:', profileError)
        throw profileError
      }
      console.log('✓ Profile created')
    }

    // 2. Create default bot_config
    const { data: existingConfig } = await supabaseAdmin
      .from('bot_config')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (!existingConfig) {
      const { error: configError } = await supabaseAdmin
        .from('bot_config')
        .insert({
          user_id: userId,
          system_prompt: `You are a helpful AI assistant for a small business. You respond to customer inquiries professionally and helpfully.`,
          temperature: 0.7,
          model: 'mistral',
          max_tokens: 500,
          metadata: {}
        })

      if (configError) {
        console.error('Failed to create bot config:', configError)
        throw configError
      }
      console.log('✓ Bot config created')
    }

    // 3. Create empty session record (will be updated when WhatsApp session starts)
    const { error: sessionError } = await supabaseAdmin
      .from('sessions')
      .upsert({
        session_id: `session_${userId}`,
        user_id: userId,
        status: 'inactive'
      }, {
        onConflict: 'session_id'
      })

    if (sessionError) {
      console.error('Failed to create session:', sessionError)
      throw sessionError
    }
    console.log('✓ Session record created')

    return NextResponse.json({
      success: true,
      message: 'User initialized successfully',
      userId,
      initialized: {
        profile: true,
        bot_config: true,
        session: true
      }
    })
  } catch (error: any) {
    console.error('Auth initialization error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to initialize user' },
      { status: 500 }
    )
  }
}
