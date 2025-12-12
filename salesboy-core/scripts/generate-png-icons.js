#!/usr/bin/env node

/**
 * PNG Icon Generation Script
 * 
 * Converts SVG icons to PNG format for PWA
 * Requires: npm install --save-dev sharp
 */

const fs = require('fs');
const path = require('path');

try {
  const sharp = require('sharp');
  
  const ICON_DIR = path.join(__dirname, '../public/icons');
  const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
  
  console.log('🎨 Converting SVG Icons to PNG...\n');
  
  // Read the base SVG
  const svgPath = path.join(ICON_DIR, 'icon-512x512.svg');
  
  if (!fs.existsSync(svgPath)) {
    console.error('❌ SVG file not found. Run: node scripts/generate-icons.js first');
    process.exit(1);
  }
  
  // Convert SVG to PNG for each size
  Promise.all(
    sizes.map(size => {
      const pngPath = path.join(ICON_DIR, `icon-${size}x${size}.png`);
      
      return sharp(svgPath)
        .resize(size, size, { fit: 'contain', background: { r: 205, g: 151, b: 119, alpha: 1 } })
        .png()
        .toFile(pngPath)
        .then(() => {
          console.log(`✓ Generated icon-${size}x${size}.png`);
        })
        .catch(err => {
          console.error(`✗ Failed to generate icon-${size}x${size}.png:`, err.message);
        });
    })
  ).then(() => {
    console.log('\n✅ All PNG icons generated successfully!\n');
    console.log('📝 You can now delete the SVG files:');
    console.log('  rm public/icons/*.svg');
    console.log('');
    console.log('🚀 Ready to build: npm run build');
  }).catch(err => {
    console.error('❌ Error during conversion:', err.message);
    process.exit(1);
  });
  
} catch (err) {
  console.error('❌ Error: sharp package not found');
  console.error('Install with: npm install --save-dev sharp');
  process.exit(1);
}
