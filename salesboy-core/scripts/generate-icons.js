#!/usr/bin/env node

/**
 * Icon Generation Script for SALES-UP PWA
 * 
 * This script generates placeholder SVG icons for PWA installation
 * To use actual icons, follow the guide in PWA_SETUP_GUIDE.md
 */

const fs = require('fs');
const path = require('path');

const ICON_DIR = path.join(__dirname, '../public/icons');

// Create icons directory if it doesn't exist
if (!fs.existsSync(ICON_DIR)) {
  fs.mkdirSync(ICON_DIR, { recursive: true });
}

// SVG template for SALES-UP logo
function generateIconSVG(size) {
  return `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#cd9777;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#b8876a;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#grad)"/>
  
  <!-- Circle background -->
  <circle cx="256" cy="256" r="240" fill="#f5f1eb" opacity="0.1"/>
  
  <!-- S Letter -->
  <text x="100" y="380" font-size="220" font-weight="900" font-family="Arial, sans-serif" fill="#2d1b0e" letter-spacing="10">S</text>
  
  <!-- U Letter -->
  <text x="280" y="380" font-size="220" font-weight="900" font-family="Arial, sans-serif" fill="#2d1b0e" letter-spacing="10">U</text>
  
  <!-- Shine effect -->
  <circle cx="140" cy="140" r="90" fill="white" opacity="0.1"/>
  
  <!-- Corner accent -->
  <circle cx="460" cy="460" r="60" fill="white" opacity="0.08"/>
</svg>`;
}

// Generate icons for all sizes
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

console.log('📱 Generating SALES-UP PWA Icons...\n');

sizes.forEach(size => {
  const svg = generateIconSVG(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(ICON_DIR, filename);
  
  fs.writeFileSync(filepath, svg);
  console.log(`✓ Generated ${filename}`);
});

console.log('\n✅ SVG icons generated successfully!\n');

console.log('📝 Next Steps:');
console.log('─────────────────────────────────────────');
console.log('Option 1: Convert SVG to PNG (Recommended)');
console.log('  Install sharp: npm install --save-dev sharp');
console.log('  npm run generate-png-icons');
console.log('');
console.log('Option 2: Use Online Tool');
console.log('  Visit: https://realfavicongenerator.net/');
console.log('  Upload: public/icons/icon-512x512.svg');
console.log('  Download PNG versions');
console.log('  Extract to: public/icons/');
console.log('');
console.log('Option 3: Use Real Logo');
console.log('  Replace SVG files with your actual logo');
console.log('  Or edit the SVG template in this script');
console.log('');
console.log('📚 For more info, see PWA_SETUP_GUIDE.md\n');
