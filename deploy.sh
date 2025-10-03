#!/bin/bash

# PASSWORD : G2XMj;g9ovuHOOwwSt@h

# === CONFIG ===
SSH_USER="root"
SSH_HOST="147.79.75.202"
REMOTE_DIR="/var/www/biome/FE"

echo "🧹 Cleaning up local node_modules and lock file..."
rm -rf node_modules
rm -f package-lock.json

echo "🚀 Uploading frontend files to $SSH_HOST:$REMOTE_DIR..."
scp -r ./* $SSH_USER@$SSH_HOST:$REMOTE_DIR

echo "🔐 Logging into server to deploy frontend..."
ssh -t $SSH_USER@$SSH_HOST <<EOF
cd $REMOTE_DIR

echo "📦 Installing frontend dependencies..."
npm install

echo "🏗️ Building Next.js app..."
npm run build

echo "🔁 Reloading Nginx..."
systemctl reload nginx
EOF

echo "✅ Frontend deployed successfully!"
read -p "Press Enter to exit..."