# VPS Setup Guide - Hostinger (Root User)

## Prerequisites
- Hostinger VPS account
- Domain name (optional but recommended)
- SSH client (Terminal on Mac/Linux, PuTTY on Windows)

---

## Step 1: Initial VPS Access

### Connect via SSH
```bash
ssh root@your-vps-ip
# Enter password provided by Hostinger
```

### Update System
```bash
apt update && apt upgrade -y
```

---

## Step 2: Setup Application Directory

```bash
# Create project directory
mkdir -p /root/salesboy-gateway
cd /root/salesboy-gateway
```

---

## Step 3: Install Node.js 20

```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Install Node 20
nvm install 20
nvm use 20
nvm alias default 20

# Verify
node -v  # Should show v20.x.x
npm -v
```

---

## Step 4: Install PM2

```bash
npm install -g pm2

# Setup PM2 to start on boot
pm2 startup

# Verify
pm2 -v
```

---

## Step 5: Install Nginx

```bash
apt install nginx -y

# Start and enable Nginx
systemctl start nginx
systemctl enable nginx

# Check status
systemctl status nginx

# Allow through firewall
ufw allow 'Nginx Full'
```

---

## Step 6: Configure Firewall

```bash
# Enable UFW
ufw enable

# Allow SSH (IMPORTANT - do this first!)
ufw allow 22/tcp

# Allow HTTP and HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Check status
ufw status
```

---

## Step 7: Install Certbot (SSL)

```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Verify
certbot --version
```

---

## Step 8: Install Git

```bash
apt install git -y

# Configure Git
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

---

## Step 9: Install Additional Dependencies

```bash
# Install build tools (needed for some npm packages)
apt install build-essential -y

# Install Chrome dependencies (for web-whatsapp.js)
apt install -y \
  gconf-service \
  libasound2 \
  libatk1.0-0 \
  libc6 \
  libcairo2 \
  libcups2 \
  libdbus-1-3 \
  libexpat1 \
  libfontconfig1 \
  libgcc1 \
  libgconf-2-4 \
  libgdk-pixbuf2.0-0 \
  libglib2.0-0 \
  libgtk-3-0 \
  libnspr4 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libstdc++6 \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxi6 \
  libxrandr2 \
  libxrender1 \
  libxss1 \
  libxtst6 \
  ca-certificates \
  fonts-liberation \
  libappindicator1 \
  libnss3 \
  lsb-release \
  xdg-utils \
  wget

# Install Chromium
apt install chromium-browser -y
```

---

## Step 10: Configure Nginx for Gateway

```bash
# Create Nginx config
nano /etc/nginx/sites-available/salesboy-gateway
```

Paste this configuration:

```nginx
server {
    listen 80;
    server_name gateway.yourdomain.com;  # Replace with your domain or IP

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # SSE support
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}
```

Enable the site:
```bash
# Create symlink
ln -s /etc/nginx/sites-available/salesboy-gateway /etc/nginx/sites-enabled/

# Test configuration
nginx -t

# Reload Nginx
systemctl reload nginx
```

---

## Step 11: Setup SSL Certificate

```bash
# Get SSL certificate (replace with your domain)
certbot --nginx -d gateway.yourdomain.com

# Follow prompts:
# - Enter email
# - Agree to terms
# - Choose to redirect HTTP to HTTPS (option 2)

# Test auto-renewal
certbot renew --dry-run
```

---

## Step 12: Setup Log Rotation

```bash
# Create logrotate config
nano /etc/logrotate.d/salesboy-gateway
```

Paste this:
```
/root/salesboy-gateway/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 root root
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

---

## Step 13: Install Monitoring Tools (Optional)

```bash
# Install htop for process monitoring
apt install htop -y

# Install netstat for network monitoring
apt install net-tools -y
```

---

## Step 14: Install Fail2Ban (Security)

```bash
apt install fail2ban -y
systemctl start fail2ban
systemctl enable fail2ban
```

---

## Step 15: Setup Environment Variables

```bash
# Create .env file (you're already in /root/salesboy-gateway)
nano .env
```

Add your variables:
```env
NODE_ENV=production
PORT=3001
API_SECRET_KEY=your-secret-key-here
NEXT_WEBHOOK_URL=https://your-nextjs-app.vercel.app/api/webhook/whatsapp
HMAC_SECRET=your-hmac-secret-here
```

---

## Step 16: Test Setup

```bash
# Check Node
node -v

# Check PM2
pm2 -v

# Check Nginx
nginx -t

# Check firewall
ufw status

# Check SSL (if configured)
certbot certificates
```

---

## Quick Reference Commands

### PM2 Commands
```bash
pm2 start ecosystem.config.js    # Start app
pm2 stop all                      # Stop all apps
pm2 restart all                   # Restart all apps
pm2 logs                          # View logs
pm2 monit                         # Monitor processes
pm2 list                          # List all processes
pm2 save                          # Save current process list
```

### Nginx Commands
```bash
systemctl start nginx        # Start Nginx
systemctl stop nginx         # Stop Nginx
systemctl restart nginx      # Restart Nginx
systemctl reload nginx       # Reload config
nginx -t                     # Test config
```

### System Commands
```bash
htop                         # Process monitor
df -h                        # Disk usage
free -h                      # Memory usage
ufw status                   # Firewall status
systemctl status nginx       # Nginx status
```

---

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 3001
lsof -i :3001

# Kill process
kill -9 <PID>
```

### Nginx Not Starting
```bash
# Check error logs
tail -f /var/log/nginx/error.log

# Test configuration
nginx -t
```

### PM2 App Crashing
```bash
# View logs
pm2 logs

# View specific app logs
pm2 logs salesboy-gateway

# Restart with fresh logs
pm2 flush
pm2 restart all
```

### SSL Certificate Issues
```bash
# Renew certificate
certbot renew

# Check certificate status
certbot certificates
```

---

## Post-Setup Checklist

- [ ] VPS accessible via SSH
- [ ] Project directory created at `/root/salesboy-gateway`
- [ ] Node.js 20 installed
- [ ] PM2 installed and configured
- [ ] Nginx installed and running
- [ ] Firewall configured (SSH, HTTP, HTTPS)
- [ ] SSL certificate installed (if using domain)
- [ ] Chrome dependencies installed
- [ ] Log rotation configured
- [ ] Fail2Ban installed
- [ ] Environment variables ready

---

## Next Steps

1. You're now in `/root/salesboy-gateway`
2. Initialize your Node.js project or clone repository
3. Install dependencies: `npm install`
4. Create PM2 ecosystem file
5. Start application: `pm2 start ecosystem.config.js`
6. Save PM2 configuration: `pm2 save`
7. Test endpoints

---

## Useful File Locations

- Nginx config: `/etc/nginx/sites-available/salesboy-gateway`
- Nginx logs: `/var/log/nginx/`
- Application: `/root/salesboy-gateway`
- PM2 logs: `/root/.pm2/logs/`
- SSL certificates: `/etc/letsencrypt/live/`

---

**Setup Complete!** Your VPS is now ready for the Salesboy Gateway deployment.
