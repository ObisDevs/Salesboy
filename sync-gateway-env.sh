#!/bin/bash

# Sync gateway .env to VPS
echo "Syncing gateway .env to VPS..."

scp salesboy-gateway/.env root@srv892192.hstgr.cloud:/root/salesboy-gateway/.env

echo "Restarting gateway on VPS..."
ssh root@srv892192.hstgr.cloud "cd /root/salesboy-gateway && pm2 restart salesboy-gateway"

echo "Done! Gateway .env synced and service restarted."
