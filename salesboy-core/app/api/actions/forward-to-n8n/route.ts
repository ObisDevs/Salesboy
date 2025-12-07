import { NextRequest, NextResponse } from 'next/server'
import { generateHmac } from '@/lib/hmac'
import axios from 'axios'

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL!

export async function POST(request: NextRequest) {
  try {
    const { task_type, payload, user_id } = await request.json()
    
    if (!task_type || !payload || !user_id) {
      return NextResponse.json({ error: 'task_type, payload, and user_id required' }, { status: 400 })
    }
    
    const webhookData = {
      task_type,
      payload,
      user_id,
      timestamp: new Date().toISOString()
    }
    
    const webhookBody = JSON.stringify(webhookData)
    const signature = generateHmac(webhookBody)
    
    // Forward to n8n workflow
    const response = await axios.post(`${N8N_WEBHOOK_URL}/webhook/${task_type}`, webhookData, {
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': `sha256=${signature}`
      },
      timeout: 30000
    })
    
    return NextResponse.json({
      message: 'Task forwarded successfully',
      n8n_response: response.data
    })
  } catch (error) {
    console.error('Forward to n8n error:', error)
    return NextResponse.json({ error: 'Failed to forward task' }, { status: 500 })
  }
}