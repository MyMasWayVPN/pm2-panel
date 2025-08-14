#!/bin/bash
set -e  # stop kalau ada error

# Konfigurasi
GITHUB_REPO="https://github.com/MyMasWayVPN/pm2-panel.git"  # ganti kalau perlu
APP_DIR="$HOME/monitoring"
NODE_VERSION="20.x"
ENTRY_FILE="pm2-monitor.js"  # ganti sesuai file start kamu

echo "=== Auto Installer Node Panel ==="

# [1/6] Update & install dependencies
echo "[1/6] Update system & install basic dependencies..."
mkdir -p "$(dirname "$APP_DIR")"
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git unzip

# [2/6] Install Node.js
echo "[2/6] Installing Node.js v$NODE_VERSION..."
curl -fsSL https://deb.nodesource.com/setup_$NODE_VERSION | sudo -E bash -
sudo apt install -y nodejs

# [3/6] Install PM2
echo "[3/6] Installing PM2..."
sudo npm install -g pm2

# [4/6] Clone repo panel
echo "[4/6] Cloning panel from $GITHUB_REPO..."
rm -rf "$APP_DIR"
git clone "$GITHUB_REPO" "$APP_DIR"

# [5/6] Install dependencies
echo "[5/6] Installing dependencies..."
cd "$APP_DIR"
npm install

# [6/6] Start panel with PM2
echo "[6/6] Starting panel..."
pm2 start "$ENTRY_FILE" --name pm2-panel
pm2 save
rm -rf install.sh
sudo pm2 startup systemd -u "$USER" --hp "$HOME"

echo "=== Install selesai! ==="
echo "Panel berjalan di PM2 dengan nama: pm2-panel"
echo "Gunakan: pm2 logs pm2-panel   untuk melihat log."
