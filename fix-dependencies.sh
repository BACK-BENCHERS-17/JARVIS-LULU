#!/bin/bash

echo "🔧 Fixing JARVIS dependencies..."

# Navigate to project directory
cd ~/JARVIS-LULU

# Install Node.js dependencies locally
echo "📦 Installing Express and CORS..."
npm install express cors ws

# Test espeak installation
echo "🔊 Testing espeak..."
espeak "Testing voice system" 2>/dev/null || {
    echo "Installing espeak..."
    pkg install espeak espeak-data -y
}

# Test termux-tts-speak
echo "📱 Testing Termux TTS..."
termux-tts-speak "Testing Termux TTS" 2>/dev/null || {
    echo "⚠️ Termux TTS not available, using espeak only"
}

echo "✅ Dependencies fixed! Now run: bash start-jarvis.sh"
