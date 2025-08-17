#!/bin/bash

echo "🚀 Installing Complete JARVIS Dependencies..."

# Update Termux packages
pkg update -y

# Install core packages
pkg install -y python nodejs espeak espeak-data termux-api git curl wget jq

# Install Python packages
pip install speechrecognition pyttsx3 requests flask flask-cors

# Install Node.js packages in project directory
cd "$(dirname "$0")"
npm install express cors

# Test espeak
echo "🔊 Testing voice system..."
espeak "JARVIS dependencies installed successfully"

# Set executable permissions
chmod +x scripts/*.sh
chmod +x *.sh

echo "✅ All dependencies installed successfully!"
echo "🎯 Run 'bash start-jarvis.sh' to launch JARVIS"
