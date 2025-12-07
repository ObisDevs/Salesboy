import crypto from 'crypto';

export function generateHMAC(payload, secret) {
  return crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
}

export function verifyHMAC(payload, signature, secret) {
  const expectedSignature = generateHMAC(payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
