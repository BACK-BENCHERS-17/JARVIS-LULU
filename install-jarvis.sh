#!/bin/bash
# J.A.R.V.I.S Installation Script for Termux

echo "🚀 Installing J.A.R.V.I.S Personal Assistant..."

# Create directory structure
mkdir -p ~/jarvis/{scripts,logs,data}

# Copy files to proper locations
cp -r scripts/* ~/jarvis/scripts/
cp -r components ~/jarvis/ 2>/dev/null || true
cp -r app ~/jarvis/ 2>/dev/null || true

# Make scripts executable
chmod +x ~/jarvis/scripts/*.sh

# Install required packages
echo "📦 Installing required packages..."
pkg update -y
pkg install -y python nodejs npm termux-api git curl wget

# Install Python packages
echo "🐍 Installing Python packages..."
pip install speechrecognition pyttsx3 requests flask flask-cors

# Install Node.js packages
echo "📦 Installing Node.js packages..."
cd ~/jarvis
npm init -y
npm install express cors

# Set up Termux permissions
echo "🔐 Setting up Termux permissions..."
termux-setup-storage

echo "✅ J.A.R.V.I.S installation completed!"
echo ""
echo "📋 Next steps:"
echo "1. Grant Termux permissions in Android Settings:"
echo "   - Storage, Microphone, Phone, Device Admin"
echo "2. Start J.A.R.V.I.S: bash ~/jarvis/scripts/start-jarvis.sh"
echo "3. Open browser and go to: http://localhost:8000"
echo ""
echo "🎯 To start JARVIS anytime, run: bash ~/jarvis/scripts/start-jarvis.sh"
