# SALES-UP PWA Implementation Guide

## ✅ Completed Components

### 1. Web App Manifest (`public/manifest.json`)
- ✅ App metadata with SALES-UP branding
- ✅ Theme colors (#cd9777 accent, #2d1b0e background)
- ✅ Icons configuration (8 sizes: 72px-512px)
- ✅ Standalone display mode
- ✅ App shortcuts for Dashboard, Sessions, Knowledge Base
- ✅ Screenshots configuration

### 2. Next.js Configuration (`next.config.js`)
- ✅ Integrated `next-pwa` package
- ✅ Service Worker auto-generation
- ✅ Runtime caching strategies:
  - **Static Assets** (JS, CSS): Stale-while-revalidate + 24h cache
  - **Fonts**: Cache-first + 1 year cache
  - **Images**: Stale-while-revalidate + 24h cache
  - **API Calls**: Network-first + 5min cache
- ✅ Disabled in development mode

### 3. Layout Updates (`app/layout.tsx`)
- ✅ PWA manifest link
- ✅ Theme color meta tags
- ✅ Apple web app capabilities
- ✅ Mobile viewport configuration
- ✅ Icon references for all platforms

### 4. Install Prompt Component (`app/components/InstallPrompt.tsx`)
- ✅ Detects PWA installability
- ✅ Intercepts `beforeinstallprompt` event
- ✅ Shows floating banner after 3 seconds
- ✅ Handles install/dismiss actions
- ✅ Prevents duplicate prompts (localStorage)
- ✅ Smooth animations

### 5. Offline Fallback (`app/offline/page.tsx`)
- ✅ Friendly offline page
- ✅ Auto-refresh when back online
- ✅ Shows cached content info
- ✅ Retry button with network detection
- ✅ Responsive design

### 6. Push Notifications
- ✅ NotificationPrompt component (`app/components/NotificationPrompt.tsx`)
- ✅ Subscribe endpoint (`app/api/notifications/subscribe/route.ts`)
- ✅ Send notifications endpoint (`app/api/notifications/send/route.ts`)
- ✅ Database migration for push subscriptions
- ✅ VAPID configuration support
- ✅ Failed subscription cleanup

### 7. Dashboard Integration
- ✅ InstallPrompt displayed on dashboard
- ✅ NotificationPrompt displayed on dashboard
- ✅ Both components properly scoped to client

---

## 🚀 Setup Instructions

### Step 1: Install Dependencies

The required packages have been added to `package.json`:
- `next-pwa` (v5.6.0)
- `web-push` (v3.6.7)

Run:
```bash
cd salesboy-core
npm install
```

### Step 2: Generate Icons

Icons need to be created in 8 sizes. Choose one method:

#### Method A: Online Tool (Recommended)
1. Visit https://realfavicongenerator.net/
2. Upload your logo or design
3. Configure for PWA
4. Download icons
5. Extract to `public/icons/`

#### Method B: Using Sharp
```bash
npm install --save-dev sharp
node scripts/generate-icons.js
```

#### Method C: Manual Creation
Create these files manually:
- `public/icons/icon-72x72.png`
- `public/icons/icon-96x96.png`
- `public/icons/icon-128x128.png`
- `public/icons/icon-144x144.png`
- `public/icons/icon-152x152.png`
- `public/icons/icon-192x192.png` (Maskable)
- `public/icons/icon-384x384.png`
- `public/icons/icon-512x512.png` (Maskable)

### Step 3: Create Screenshots

Create 2 screenshots:

**Dashboard Screenshot** (1280×720 PNG):
- File: `public/screenshots/dashboard.png`
- Show main dashboard with charts
- Include sidebar navigation
- Professional layout

**Mobile Screenshot** (750×1334 PNG):
- File: `public/screenshots/mobile.png`
- Portrait orientation
- Show responsive design
- Mobile-friendly layout

### Step 4: Setup Push Notifications (Optional)

For push notification support, you need VAPID keys:

```bash
# Generate VAPID keys
npm install -g web-push
web-push generate-vapid-keys
```

Add to `.env.local`:
```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
VAPID_EMAIL=your-email@example.com
```

### Step 5: Database Migration

Run the Supabase migration:
```bash
cd salesboy-core
npx supabase db push
```

This creates the `push_subscriptions` table for storing device subscriptions.

### Step 6: Build & Deploy

```bash
npm run build
npm run start
```

Test locally:
```bash
npm run dev
```

Deploy to Vercel:
```bash
vercel deploy
```

---

## 🧪 Testing the PWA

### 1. Check Manifest
Open browser DevTools:
- Chrome: F12 → Application → Manifest
- Should show all icons and metadata

### 2. Check Service Worker
- Chrome: F12 → Application → Service Workers
- Should show "Active and running"

### 3. Test Installation
1. Visit app on Android/desktop
2. Should see "Install SALES-UP" banner after 3 seconds
3. Click "Install"
4. App should appear on home screen/app drawer

### 4. Test Offline
1. Open DevTools → Network
2. Set throttling to "Offline"
3. Reload page
4. Should show offline page
5. Can view cached dashboard data

### 5. Test Push Notifications
1. Visit dashboard (you'll see notification prompt)
2. Click "Enable"
3. Should be able to send notifications
4. Test: `curl -X POST http://localhost:3000/api/notifications/send -H "Content-Type: application/json" -d '{"userId":"user123","title":"Test","body":"This is a test"}'`

### 6. Lighthouse Audit
- Chrome DevTools → Lighthouse
- Select "PWA" category
- Run audit
- Target: PWA score > 90

---

## 📊 Caching Strategies

### Current Configuration

| Resource | Strategy | Cache Time | Notes |
|----------|----------|-----------|-------|
| Static JS | Stale-While-Revalidate | 24h | Fast fallback, updates in background |
| Static CSS | Stale-While-Revalidate | 24h | Prevents layout breaking |
| Images | Stale-While-Revalidate | 24h | Shows cached version immediately |
| Fonts | Cache-First | 1 year | Never changes, cache indefinitely |
| API Calls | Network-First | 5min | Always try network, cache as fallback |
| Next.js Image | Stale-While-Revalidate | 24h | Optimized image caching |

### Customization

Edit `next.config.js` `runtimeCaching` array to adjust:
- `urlPattern` - Regex pattern for matching URLs
- `handler` - Strategy (CacheFirst, NetworkFirst, etc.)
- `options.cacheName` - Unique cache name
- `options.expiration` - Max entries and age

---

## 🔔 Push Notifications Flow

```
User Enables Notifications
  ↓
Browser Requests Permission
  ↓
User Approves (or Denies)
  ↓
Service Worker Generates Subscription
  ↓
Send to Backend: /api/notifications/subscribe
  ↓
Store in Supabase (push_subscriptions table)
  ↓
Backend can now send notifications
  ↓
/api/notifications/send triggers Web Push API
  ↓
Service Worker Receives Push Event
  ↓
Show Notification to User
```

### Sending Notifications from Backend

```typescript
// In your API route or task handler
await fetch('/api/notifications/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: user_id,
    title: 'New Customer Inquiry',
    body: 'John asked about pricing',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    tag: 'inquiry', // Groups notifications
    requireInteraction: true // Keep until user interacts
  })
})
```

---

## 🐛 Troubleshooting

### Service Worker Not Registering
- Check: `npm run build` completes without errors
- Clear browser cache and reload
- Check browser console for errors
- Verify HTTPS (required for SW)

### Install Prompt Not Showing
- Must be HTTPS (except localhost)
- Manifest must be valid JSON
- Icons must be accessible
- Has installability criteria from Google:
  - Web app manifest
  - Icons in manifest
  - Service worker
  - HTTPS
  - Meta viewport tag

### Offline Page Showing Instead of Content
- This means service worker intercepted request
- Check Network tab in DevTools
- Verify cache contains expected assets
- Check browser storage quota (usually 50MB limit)

### Push Notifications Not Working
- Check VAPID keys are set in `.env.local`
- Verify browser supports Web Push (most do)
- Check browser notification permissions
- Look for errors in browser console
- Verify backend can reach service worker

### Icons Not Showing
- Verify `public/icons/` folder exists
- Icons must be PNG format
- Check `manifest.json` icon paths
- Use absolute paths: `/icons/icon-192x192.png`
- Clear browser cache

---

## 🎯 Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| First Contentful Paint | <1.5s | TBD |
| Time to Interactive | <3.5s | TBD |
| Lighthouse PWA Score | >90 | TBD |
| Cache Hit Rate | >80% | TBD |
| Service Worker Load Time | <100ms | TBD |

Run Lighthouse audit to measure actual performance.

---

## 📱 Browser Support

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Install Prompt | ✅ | ✅ | ⚠️ | ✅ |
| Service Worker | ✅ | ✅ | ✅ | ✅ |
| Offline Mode | ✅ | ✅ | ✅ | ✅ |
| Push Notifications | ✅ | ✅ | ⚠️* | ✅ |
| Web App Manifest | ✅ | ✅ | ⚠️ | ✅ |

*Safari: Push notifications only on iOS 16.4+

---

## 📚 Resources

- [MDN PWA Documentation](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [next-pwa Documentation](https://github.com/shadowwalker/next-pwa)
- [Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Service Worker Strategies](https://developer.chrome.com/docs/workbox/service-worker-caching-strategies/)

---

## 🔄 Next Steps

1. ✅ Install dependencies: `npm install`
2. ⏳ Generate icons (all 8 sizes)
3. ⏳ Create 2 screenshots (dashboard + mobile)
4. ⏳ Generate VAPID keys (if using push notifications)
5. ⏳ Run: `npm run build`
6. ⏳ Test locally: `npm run dev`
7. ⏳ Run Lighthouse audit
8. ⏳ Deploy to Vercel
9. ⏳ Test installation on mobile device

---

## 📞 Support

For issues or questions:
1. Check browser console for errors
2. Review Lighthouse PWA audit
3. Test on actual mobile device
4. Check Chrome DevTools: Application tab
5. Review logs in browser DevTools > Console

Happy PWA building! 🚀
