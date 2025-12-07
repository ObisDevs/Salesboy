import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId') || 'current-user'
  
  const gatewayUrl = process.env.GATEWAY_URL || 'http://srv892192.hstgr.cloud:3001'
  const apiKey = process.env.API_SECRET_KEY
  
  try {
    const response = await fetch(`${gatewayUrl}/session/qr/${userId}`, {
      headers: {
        'X-API-KEY': apiKey || '',
      },
    })

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader()
        if (!reader) return

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            controller.enqueue(value)
          }
        } catch (error) {
          console.error('Stream error:', error)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('QR proxy error:', error)
    return new Response('Error connecting to gateway', { status: 500 })
  }
}
