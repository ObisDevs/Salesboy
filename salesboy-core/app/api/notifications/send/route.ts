import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'
import { supabaseAdmin } from '@/lib/supabase'

// Configure web-push with VAPID keys
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || ''

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    'mailto:' + (process.env.VAPID_EMAIL || 'support@salesboy.com'),
    vapidPublicKey,
    vapidPrivateKey
  )
}

export async function POST(request: NextRequest) {
  try {
    const { userId, title, body, icon, badge, tag, requireInteraction } = await request.json()

    if (!userId || !title || !body) {
      return NextResponse.json(
        { error: 'userId, title, and body are required' },
        { status: 400 }
      )
    }

    // Fetch user's push subscriptions
    const { data: subscriptions, error } = await supabaseAdmin
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId)

    if (error) {
      console.error('Failed to fetch subscriptions:', error)
      return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 })
    }

    const subs = (subscriptions as any[]) || []

    if (!subs || subs.length === 0) {
      return NextResponse.json(
        { message: 'No push subscriptions found for user' },
        { status: 404 }
      )
    }

    // Send push notification to all subscriptions
    const results = await Promise.allSettled(
      subs.map((sub: any) =>
        webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              auth: sub.auth,
              p256dh: sub.p256dh
            }
          },
          JSON.stringify({
            title,
            body,
            icon: icon || '/icons/icon-192x192.svg',
            badge: badge || '/icons/icon-192x192.svg',
            tag: tag || 'notification',
            requireInteraction: requireInteraction || false,
            data: {
              dateOfArrival: Date.now(),
              primaryKey: userId
            }
          })
        )
      )
    )

    const successful = results.filter((r) => r.status === 'fulfilled').length
    const failed = results.filter((r) => r.status === 'rejected').length

    // Remove failed subscriptions
    const failedSubscriptions = subs.filter((_: any, index: number) => results[index].status === 'rejected')
    if (failedSubscriptions.length > 0) {
      await supabaseAdmin
        .from('push_subscriptions')
        .delete()
        .in('id', failedSubscriptions.map((s: any) => s.id))
    }

    console.log(`📤 Push notifications sent: ${successful} successful, ${failed} failed`)

    return NextResponse.json({
      success: true,
      message: `Sent to ${successful} device${successful !== 1 ? 's' : ''}`,
      stats: { successful, failed, total: subscriptions.length }
    })
  } catch (error) {
    console.error('Send notification error:', error)
    return NextResponse.json({ error: 'Failed to send notifications' }, { status: 500 })
  }
}
