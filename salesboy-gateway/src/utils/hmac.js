import crypto from 'crypto';

export function generateHMAC(payload, secret) {
  if (!secret || (process.env.DISABLE_HMAC || '').toLowerCase() === 'true') {
    return ''
  }

  return crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
}

export function verifyHMAC(payload, signature, secret) {
  const expectedSignature = generateHMAC(payload, secret);
  // If HMAC is disabled or no secret provided, skip verification
  if (!secret || (process.env.DISABLE_HMAC || '').toLowerCase() === 'true') {
    return true
  }

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (err) {
    return false
  }
}
