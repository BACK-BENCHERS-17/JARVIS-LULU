#!/bin/bash
# J.A.R.V.I.S Termux Setup Script
echo "🚀 Setting up J.A.R.V.I.S on Termux..."

# Update packages
pkg update && pkg upgrade -y

# Install required packages
pkg install -y python nodejs termux-api curl wget git openssh

# Install Python packages for voice and AI
pip install speechrecognition pyttsx3 requests flask

# Install Node.js packages
npm install -g express cors body-parser

# Create directories
mkdir -p ~/jarvis/{scripts,logs,data}
cd ~/jarvis

# Set permissions
termux-setup-storage
echo "✅ Basic setup complete!"
echo "📱 Please grant Termux the following permissions in Android Settings:"
echo "   - Storage access"
echo "   - Microphone access" 
echo "   - Device admin (for screen control)"
echo "   - Accessibility service"
echo "   - Modify system settings"
