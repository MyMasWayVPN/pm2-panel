#!/bin/bash

# Konfigurasi
GITHUB_REPO="https://github.com/MyMasWayVPN/pm2-panel.git"  # ganti kalau perlu
APP_DIR="/monitoring/node-panel"
NODE_VERSION="20"

echo "=== Auto Installer Node Panel ==="

# Update & install dependencies
echo "[1/6] Update system & install basic dependencies..."
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git unzip

# Install Node.js 20
echo "[2/6] Installing Node.js v$NODE_VERSION..."
curl -fsSL https://deb.nodesource.com/setup_$NODE_VERSION.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 untuk daemon process
echo "[3/6] Installing PM2..."
sudo npm install -g pm2
sudo npm i

# Clone repo panel
echo "[4/6] Cloning panel from $GITHUB_REPO..."
sudo rm -rf $APP_DIR
sudo git clone $GITHUB_REPO $APP_DIR

# Install dependencies
echo "[5/6] Installing dependencies..."
cd $APP_DIR
npm install

# Jalankan panel dengan PM2
echo "[6/6] Starting panel..."
pm2 start pm2-monitor.js --name pm2-panel
pm2 save
pm2 startup systemd -u $USER --hp $HOME

echo "=== Install selesai! ==="
echo "Panel berjalan di PM2 dengan nama: pm2-panel"
echo "Gunakan 'pm2 logs pm2-panel' untuk melihat log."
