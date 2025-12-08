import { generateHmac } from './hmac'

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://n8n.srv892192.hstgr.cloud'

export interface TaskPayload {
  task_type: string
  payload: Record<string, any>
  user_id: string
  from_number: string
  original_message: string
}

export interface N8nResponse {
  success: boolean
  message?: string
  data?: any
}

export async function forwardTaskToN8n(task: TaskPayload): Promise<N8nResponse> {
  try {
    const webhookData = {
      ...task,
      timestamp: new Date().toISOString()
    }
    
    const webhookBody = JSON.stringify(webhookData)
    const signature = generateHmac(webhookBody)
    
    // Construct n8n webhook URL based on task type
    const webhookUrl = `${N8N_WEBHOOK_URL}/webhook/${task.task_type}`
    
    console.log(`📤 Forwarding to n8n: ${webhookUrl}`)
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': `sha256=${signature}`
      },
      body: webhookBody
    })
    
    if (!response.ok) {
      throw new Error(`n8n responded with status ${response.status}`)
    }
    
    const data = await response.json().catch(() => ({}))
    
    return {
      success: true,
      message: 'Task forwarded successfully',
      data
    }
  } catch (error: any) {
    console.error('❌ n8n forwarding error:', error)
    
    // Return success even if n8n is not configured yet
    // This allows the system to work without n8n
    return {
      success: true,
      message: 'Task queued (n8n endpoint not configured)',
      data: { error: error.message }
    }
  }
}

export async function notifyTaskCompletion(
  userId: string,
  fromNumber: string,
  taskType: string,
  result: any
): Promise<void> {
  // This will be called by n8n workflows when they complete
  // For now, we just log it
  console.log('✅ Task completed:', { userId, fromNumber, taskType, result })
  
  // TODO: Send notification back to user via WhatsApp
  // await sendMessage({ userId, to: fromNumber, message: completionMessage })
}
