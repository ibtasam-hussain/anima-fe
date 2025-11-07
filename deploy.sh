#!/bin/bash

# PASSWORD : q&/65FMFJE'Vnu@H7V8H

# === SSH CONFIG ===
SSH_USER="root"
SSH_HOST="72.60.175.234"
REMOTE_DIR="/var/www/biome/FE"

echo "🧹 Cleaning up local node_modules and lock file..."
rm -rf node_modules
rm -f package-lock.json

echo "🚀 Uploading frontend files to $SSH_HOST:$REMOTE_DIR..."
scp -r ./* $SSH_USER@$SSH_HOST:$REMOTE_DIR

echo "🔐 Logging into server to deploy frontend..."
ssh -t $SSH_USER@$SSH_HOST <<EOF
cd $REMOTE_DIR

echo "🧹 Cleaning up remote node_modules and lock file..."
rm -rf node_modules
rm -f package-lock.json

echo "🚀 Deploying frontend..."
npm install
npm run build

pm2 restart 0

EOF

echo "🎉 Frontend deployed successfully!"