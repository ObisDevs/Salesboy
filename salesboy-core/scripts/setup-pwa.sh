#!/bin/bash

# PWA Icon Generation Script for SALES-UP
# This script generates SVG icons in multiple sizes for PWA installation

set -e

ICON_DIR="public/icons"
SCREENSHOT_DIR="public/screenshots"

# Create directories if they don't exist
mkdir -p "$ICON_DIR"
mkdir -p "$SCREENSHOT_DIR"

echo "📱 Generating PWA Icons for SALES-UP..."

# Generate a base SVG icon (simple S+U logo)
cat > /tmp/base_icon.svg << 'EOF'
<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="512" height="512" fill="#cd9777"/>
  
  <!-- Background pattern -->
  <circle cx="256" cy="256" r="240" fill="#e6ddd3" opacity="0.1"/>
  
  <!-- S Letter -->
  <text x="120" y="340" font-size="200" font-weight="bold" font-family="Arial, sans-serif" fill="#2d1b0e">S</text>
  
  <!-- U Letter -->
  <text x="280" y="340" font-size="200" font-weight="bold" font-family="Arial, sans-serif" fill="#2d1b0e">U</text>
  
  <!-- Shine effect -->
  <circle cx="150" cy="150" r="80" fill="white" opacity="0.15"/>
</svg>
EOF

echo "✓ Created base SVG template"

# Icon sizes to generate
sizes=(72 96 128 144 152 192 384 512)

# Note: In production, you'd use a tool like ImageMagick or sharp
# For now, we'll create a placeholder message
echo ""
echo "📦 Icon Generation Options:"
echo ""
echo "Option 1: Using Online Tool (Recommended)"
echo "─────────────────────────────────────────"
echo "1. Go to: https://realfavicongenerator.net/"
echo "2. Upload the base icon: /tmp/base_icon.svg"
echo "3. Select 'App icons' for PWA"
echo "4. Download the favicon package"
echo "5. Extract icons to: public/icons/"
echo ""

echo "Option 2: Using Node.js with Sharp"
echo "─────────────────────────────────────────"
echo "npm install sharp"
echo "node scripts/generate-icons.js"
echo ""

echo "Option 3: Manual SVG Creation"
echo "─────────────────────────────────────────"
echo "Create SVG files for each size in public/icons/:"
for size in "${sizes[@]}"; do
  echo "  - icon-${size}x${size}.png (rasterized from SVG)"
done
echo ""

echo "📝 For now, creating placeholder info file..."

cat > "$ICON_DIR/README.md" << 'EOF'
# SALES-UP PWA Icons

This directory should contain icons in the following sizes:

- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png (Maskable)
- icon-384x384.png
- icon-512x512.png (Maskable)

## Generation Steps

### Using realfavicongenerator.net (Easiest)
1. Visit https://realfavicongenerator.net/
2. Upload a logo or SVG
3. Select "App icons" for PWA
4. Set these dimensions:
   - iPhone 152x152
   - Android 192x192
   - Android 512x512
5. Download and extract to this folder

### Using Sharp (Node.js)
```bash
npm install sharp
node scripts/generate-icons.js
```

### Manual Creation
Use a tool like GIMP, Photoshop, or Figma to:
1. Create a 512x512 PNG with your logo
2. Export to all required sizes
3. Place in this directory

## Icon Requirements

- **Format**: PNG (transparent background recommended)
- **Colors**: Use brand colors (#cd9777 accent, #2d1b0e dark)
- **Style**: Flat design, no text
- **Maskable**: Icons marked "maskable" should have safe zone 80px from edge

## Verification

After adding icons, verify:
```bash
# Check all icons exist
ls -la public/icons/

# Validate manifest references
cat public/manifest.json | grep "icon"
```

## Tips

- Use a 1:1 aspect ratio
- Keep safe zone clear of important details for maskable icons
- Test on mobile devices (iOS/Android)
- Check Chrome DevTools: Application > Manifest tab
EOF

cat > "$SCREENSHOT_DIR/README.md" << 'EOF'
# SALES-UP PWA Screenshots

This directory should contain screenshots for the PWA installation prompt:

- dashboard.png (1280x720) - Desktop screenshot
- mobile.png (750x1334) - Mobile screenshot

## Screenshot Guidelines

### Dashboard Screenshot (1280x720)
- Show the main dashboard with charts and data
- Include navigation sidebar
- Ensure it's clear and professional
- Highlight key features

### Mobile Screenshot (750x1334)
- Portrait orientation
- Show dashboard on mobile view
- Display responsive design
- Include key UI elements

## Tools for Creating Screenshots

1. **Browser DevTools**
   - Chrome: F12 → ... → Capture screenshot
   - Firefox: Developer Tools → Responsive Design Mode

2. **Online Tools**
   - https://www.screenshotmachine.com/
   - https://www.browserstack.com/

3. **Manual Capture**
   - Use screenshot feature on device
   - Edit with GIMP/Photoshop to size

## Dimensions

- Dashboard: 1280×720 (16:9 widescreen)
- Mobile: 750×1334 (≈9:16 portrait)
- Format: PNG or WebP (PNG recommended for better compatibility)

## Implementation

Once created, update `public/manifest.json`:
```json
"screenshots": [
  {
    "src": "/screenshots/mobile.png",
    "sizes": "750x1334",
    "type": "image/png",
    "form_factor": "narrow"
  },
  {
    "src": "/screenshots/dashboard.png",
    "sizes": "1280x720",
    "type": "image/png",
    "form_factor": "wide"
  }
]
```

## Verification

After adding screenshots:
1. Test manifest validation: https://www.pwabuilder.com/
2. Check Chrome DevTools: Application > Manifest tab
3. Install PWA and verify screenshots appear
EOF

echo "✓ Created icon and screenshot documentation"
echo ""
echo "✅ Setup Complete!"
echo ""
echo "Next Steps:"
echo "1. Generate icons using one of the methods above"
echo "2. Create 2 screenshots (dashboard and mobile)"
echo "3. Place them in public/icons/ and public/screenshots/"
echo "4. Run: npm run build"
echo "5. Deploy to Vercel"
echo ""
echo "📖 For more info, see PWA_IMPLEMENTATION_PLAN.md"
