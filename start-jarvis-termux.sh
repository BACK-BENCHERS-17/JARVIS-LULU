#!/bin/bash

echo "🚀 Starting J.A.R.V.I.S Voice Assistant for Termux..."

cd "$(dirname "$0")"

# Check dependencies
echo "📦 Checking dependencies..."
if ! command -v espeak &> /dev/null; then
    echo "Installing espeak..."
    pkg install espeak -y
fi

if ! command -v python &> /dev/null; then
    echo "Installing python..."
    pkg install python -y
fi

# Install Python packages if needed
pip install speechrecognition requests &> /dev/null

echo "🎤 Starting JARVIS Voice Assistant..."
echo "✅ Voice-only mode activated!"
echo "🎯 Say 'Hey JARVIS' to interact"
echo "🛑 Press Ctrl+C to stop"

python scripts/jarvis-voice.py
