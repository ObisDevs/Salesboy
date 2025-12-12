# PWA Implementation Plan - Salesboy AI

## Overview
Convert Salesboy AI into a Progressive Web App (PWA) to enable:
- Installable on mobile/desktop
- Offline functionality
- Push notifications
- App-like experience
- Faster load times

## Implementation Steps

### 1. Web App Manifest (`public/manifest.json`)
```json
{
  "name": "Salesboy AI - WhatsApp Business Assistant",
  "short_name": "Salesboy AI",
  "description": "AI-powered WhatsApp automation for Nigerian businesses",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#2d1b0e",
  "theme_color": "#cd9777",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/dashboard.png",
      "sizes": "1280x720",
      "type": "image/png"
    },
    {
      "src": "/screenshots/mobile.png",
      "sizes": "750x1334",
      "type": "image/png"
    }
  ]
}
```

### 2. Service Worker (`public/sw.js`)
**Features**:
- Cache static assets (CSS, JS, images)
- Cache API responses with stale-while-revalidate
- Offline fallback page
- Background sync for failed requests
- Push notification handling

**Caching Strategy**:
- **Static Assets**: Cache-first
- **API Calls**: Network-first with cache fallback
- **Images**: Cache-first with expiration
- **Dashboard Pages**: Network-first

### 3. Next.js Configuration (`next.config.js`)
```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-webfonts',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60 // 1 year
        }
      }
    },
    {
      urlPattern: /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'google-fonts-stylesheets',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 7 * 24 * 60 * 60 // 1 week
        }
      }
    },
    {
      urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-font-assets',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 7 * 24 * 60 * 60 // 1 week
        }
      }
    },
    {
      urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-image-assets',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        }
      }
    },
    {
      urlPattern: /\/_next\/image\?url=.+$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'next-image',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        }
      }
    },
    {
      urlPattern: /\.(?:js)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-js-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        }
      }
    },
    {
      urlPattern: /\.(?:css|less)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-style-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        }
      }
    },
    {
      urlPattern: /^https:\/\/salesboy-lilac\.vercel\.app\/api\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 16,
          maxAgeSeconds: 5 * 60 // 5 minutes
        },
        networkTimeoutSeconds: 10
      }
    }
  ]
})

module.exports = withPWA({
  // existing config
})
```

### 4. Update Root Layout (`app/layout.tsx`)
Add manifest and theme-color meta tags:
```tsx
export const metadata = {
  title: 'Salesboy AI - WhatsApp Business Assistant',
  description: 'AI-powered WhatsApp assistant for Nigerian businesses',
  manifest: '/manifest.json',
  themeColor: '#cd9777',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Salesboy AI'
  },
  icons: {
    icon: '/icons/icon-192x192.png',
    shortcut: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png',
  },
}
```

### 5. Install Prompt Component (`app/components/InstallPrompt.tsx`)
- Detect if app is installable
- Show install banner on mobile
- Handle beforeinstallprompt event
- Track installation analytics

### 6. Offline Page (`app/offline/page.tsx`)
- Friendly offline message
- Cached content display
- Retry button
- Queue failed actions

### 7. Push Notifications Setup
**Backend** (`app/api/notifications/subscribe/route.ts`):
- Store push subscriptions in Supabase
- Send notifications via Web Push API

**Frontend** (`app/components/NotificationPrompt.tsx`):
- Request notification permission
- Subscribe to push notifications
- Handle notification clicks

### 8. App Icons Generation
Create icons in multiple sizes:
- 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512
- Use maskable icons for Android
- Apple touch icons for iOS

**Tool**: Use https://realfavicongenerator.net/ or create manually

## Dependencies to Install
```bash
npm install next-pwa
npm install web-push
```

## Files to Create/Modify

### New Files
- `public/manifest.json`
- `public/sw.js` (auto-generated by next-pwa)
- `public/icons/icon-*.png` (8 sizes)
- `public/screenshots/dashboard.png`
- `public/screenshots/mobile.png`
- `app/components/InstallPrompt.tsx`
- `app/components/NotificationPrompt.tsx`
- `app/offline/page.tsx`
- `app/api/notifications/subscribe/route.ts`
- `app/api/notifications/send/route.ts`

### Modified Files
- `next.config.js`
- `app/layout.tsx`
- `package.json`

## Testing Checklist
- [ ] Manifest validates (Chrome DevTools > Application > Manifest)
- [ ] Service worker registers successfully
- [ ] Install prompt appears on mobile
- [ ] App installs on Android/iOS
- [ ] Offline page displays when network is down
- [ ] Cached assets load offline
- [ ] Push notifications work
- [ ] App icon displays correctly
- [ ] Splash screen shows on launch
- [ ] Lighthouse PWA score > 90

## Performance Targets
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Lighthouse PWA Score**: > 90
- **Offline Support**: Full dashboard access
- **Cache Size**: < 50MB

## Rollout Plan
1. **Phase 1**: Manifest + Icons (1 day)
2. **Phase 2**: Service Worker + Caching (2 days)
3. **Phase 3**: Install Prompt + Offline Page (1 day)
4. **Phase 4**: Push Notifications (2 days)
5. **Phase 5**: Testing + Optimization (2 days)

**Total Estimated Time**: 8 days

## Benefits
- ✅ 50% faster load times (cached assets)
- ✅ Works offline (cached dashboard)
- ✅ Installable (home screen icon)
- ✅ Push notifications (customer engagement)
- ✅ App-like experience (no browser chrome)
- ✅ Better SEO (PWA ranking boost)
- ✅ Reduced data usage (cached resources)

## Considerations
- Service worker cache invalidation strategy
- Storage quota management (50MB limit)
- iOS limitations (no push notifications on iOS < 16.4)
- Background sync for failed API calls
- Update notification when new version available
