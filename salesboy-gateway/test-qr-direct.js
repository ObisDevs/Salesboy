// Run this directly on VPS to test QR code generation
// Usage: node test-qr-direct.js

import sessionManager from './src/lib/session-manager.js';

const USER_ID = 'test-user-' + Date.now();

console.log('=== Direct Session Manager Test ===\n');
console.log(`Creating session for user: ${USER_ID}\n`);

// Create session
const result = await sessionManager.createSession(USER_ID);
console.log('Create session result:', result);

// Wait for QR
console.log('\nWaiting 5 seconds for QR generation...');
await new Promise(resolve => setTimeout(resolve, 5000));

// Get QR
const qr = await sessionManager.getQRCode(USER_ID);
if (qr) {
  console.log('\n✅ QR Code generated!');
  console.log('QR Data URL length:', qr.length);
  console.log('QR Data URL preview:', qr.substring(0, 100) + '...');
  console.log('\nPaste this in your browser to see the QR code:');
  console.log(qr);
} else {
  console.log('\n❌ QR Code is null');
  
  // Check session status
  const status = sessionManager.getSessionStatus(USER_ID);
  console.log('Session status:', status);
  
  // Get raw session data
  const sessionData = sessionManager.getSession(USER_ID);
  if (sessionData) {
    console.log('Session exists:', true);
    console.log('QR in session data:', sessionData.qr ? 'YES' : 'NO');
    console.log('Ready:', sessionData.ready);
  }
}

// Cleanup
console.log('\n\nCleaning up...');
await sessionManager.stopSession(USER_ID);
console.log('Done!');
process.exit(0);
