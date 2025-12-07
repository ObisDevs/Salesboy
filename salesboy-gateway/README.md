# Salesboy Gateway

WhatsApp Gateway microservice for Salesboy AI.

## Features

- Multi-session WhatsApp management
- QR code generation via SSE
- Message forwarding with HMAC signatures
- Rate limiting and security
- Rotating file logs

## Installation

```bash
npm install
```

## Configuration

Copy `.env.example` to `.env` and fill in your credentials.

## Running

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### With PM2
```bash
pm2 start ecosystem.config.cjs
pm2 save
```

## API Endpoints

### Session Management

**Start Session**
```bash
POST /session/start
Headers: X-API-KEY: your-api-key
Body: { "userId": "user123" }
```

**Stop Session**
```bash
POST /session/stop
Headers: X-API-KEY: your-api-key
Body: { "userId": "user123" }
```

**Get Session Status**
```bash
GET /session/status/:userId
Headers: X-API-KEY: your-api-key
```

**Get QR Code (SSE)**
```bash
GET /session/qr/:userId
Headers: X-API-KEY: your-api-key
```

### Messaging

**Send Message**
```bash
POST /message/send
Headers: X-API-KEY: your-api-key
Body: {
  "userId": "user123",
  "to": "1234567890@c.us",
  "message": "Hello!"
}
```

**Get Groups**
```bash
GET /message/groups?user_id=user123
Headers: X-API-KEY: your-api-key
```

**Get Contacts**
```bash
GET /message/contacts?user_ids=user123,user456
Headers: X-API-KEY: your-api-key
```

### Health Check
```bash
GET /health
```

## Testing

```bash
# Test health endpoint
curl https://srv892192.hstgr.cloud:3001/health

# Start session
curl -X POST https://srv892192.hstgr.cloud:3001/session/start \
  -H "X-API-KEY: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user"}'

# Get QR code
curl https://srv892192.hstgr.cloud:3001/session/qr/test-user \
  -H "X-API-KEY: your-api-key"
```

## Deployment

1. Copy files to VPS: `/root/salesboy-gateway`
2. Install dependencies: `npm install`
3. Configure `.env` file
4. Start with PM2: `pm2 start ecosystem.config.cjs`
5. Save PM2 config: `pm2 save`

## Logs

Logs are stored in `./logs/` directory with daily rotation.

## Security

- API key authentication on all endpoints
- HMAC signatures on webhook payloads
- Rate limiting (100 requests per 15 minutes)
- Helmet.js security headers
- CORS enabled

## License

MIT
