import { NextRequest } from 'next/server'

import { NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId') || 'current-user'
  
  const gatewayUrl = process.env.GATEWAY_URL || 'http://srv892192.hstgr.cloud:3001'
  const apiKey = process.env.API_SECRET_KEY
  
  try {
    // Get current QR from gateway status
    const response = await fetch(`${gatewayUrl}/session/status/${userId}`, {
      headers: {
        'X-API-KEY': apiKey || '',
      },
    })

    const data = await response.json()
    return NextResponse.json({ qr: data.qr || null })
  } catch (error) {
    console.error('QR proxy error:', error)
    return NextResponse.json({ error: 'Failed to get QR code' }, { status: 500 })
  }
}
