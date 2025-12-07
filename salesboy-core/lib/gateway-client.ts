import axios from 'axios'

const GATEWAY_URL = process.env.GATEWAY_URL!
const API_SECRET_KEY = process.env.API_SECRET_KEY!

const gatewayClient = axios.create({
  baseURL: GATEWAY_URL,
  headers: {
    'X-API-KEY': API_SECRET_KEY,
    'Content-Type': 'application/json'
  }
})

export interface SendMessageRequest {
  user_id: string
  to: string
  message: string
  type?: 'text' | 'media'
}

export async function sendMessage(request: SendMessageRequest) {
  return await gatewayClient.post('/message/send', request)
}

export async function startSession(userId: string) {
  return await gatewayClient.post('/session/start', { user_id: userId })
}

export async function stopSession(userId: string) {
  return await gatewayClient.post('/session/stop', { user_id: userId })
}

export async function getSessionStatus(userId: string) {
  return await gatewayClient.get(`/session/status/${userId}`)
}