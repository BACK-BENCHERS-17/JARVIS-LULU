#!/bin/bash
# Install JARVIS dependencies for Termux

echo "📦 Installing J.A.R.V.I.S dependencies..."

# Update Termux packages
pkg update -y

# Install core packages
echo "Installing core packages..."
pkg install -y python nodejs termux-api git curl wget jq

# Install Python packages
echo "🐍 Installing Python packages..."
pip install speechrecognition pyttsx3 requests flask flask-cors

# Install Node.js packages
echo "📦 Installing Node.js packages..."
npm install express cors

# Set up Termux permissions
echo "🔐 Setting up Termux storage access..."
termux-setup-storage

# Create logs directory
mkdir -p logs

echo "✅ Dependencies installed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Grant Termux permissions in Android Settings:"
echo "   - Storage, Microphone, Phone access"
echo "2. Start JARVIS: bash start-jarvis.sh"
echo "3. Access web interface: http://localhost:8000"
