import { createHmac, timingSafeEqual } from 'crypto'

const HMAC_SECRET = process.env.HMAC_SECRET!

export function generateHmac(payload: string): string {
  return createHmac('sha256', HMAC_SECRET)
    .update(payload)
    .digest('hex')
}

export function validateHmac(payload: string, signature: string): boolean {
  if (!HMAC_SECRET) {
    console.warn('HMAC_SECRET not configured, skipping validation')
    return true
  }
  
  try {
    const expectedSignature = generateHmac(payload)
    const providedSignature = signature.startsWith('sha256=') 
      ? signature.slice(7) 
      : signature
    
    const expectedBuffer = Buffer.from(expectedSignature, 'hex')
    const providedBuffer = Buffer.from(providedSignature, 'hex')
    
    if (expectedBuffer.length !== providedBuffer.length) {
      return false
    }
    
    return timingSafeEqual(expectedBuffer, providedBuffer)
  } catch (error) {
    console.error('HMAC validation error:', error)
    return false
  }
}