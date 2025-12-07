import { createHmac, timingSafeEqual } from 'crypto'

const HMAC_SECRET = process.env.HMAC_SECRET!

export function generateHmac(payload: string): string {
  return createHmac('sha256', HMAC_SECRET)
    .update(payload)
    .digest('hex')
}

export function validateHmac(payload: string, signature: string): boolean {
  const expectedSignature = generateHmac(payload)
  const providedSignature = signature.startsWith('sha256=') 
    ? signature.slice(7) 
    : signature
  
  return timingSafeEqual(
    Buffer.from(expectedSignature, 'hex'),
    Buffer.from(providedSignature, 'hex')
  )
}