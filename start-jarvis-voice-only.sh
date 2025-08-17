#!/bin/bash

echo "🚀 Starting J.A.R.V.I.S Voice Assistant (Termux Optimized)..."

# Create logs directory
mkdir -p logs

# Kill any existing processes
pkill -f "jarvis-voice.py" 2>/dev/null
pkill -f "jarvis-server.js" 2>/dev/null

echo "📦 Checking dependencies..."
# Install only essential dependencies for voice
pip install speechrecognition flask flask-cors requests 2>/dev/null

echo "🎤 Starting JARVIS Voice System..."
cd "$(dirname "$0")"
python3 scripts/jarvis-voice.py &
VOICE_PID=$!

echo "🔧 Starting API server..."
node scripts/jarvis-server.js &
SERVER_PID=$!

echo "✅ J.A.R.V.I.S Voice Assistant is now running!"
echo "🎤 Say 'Hey JARVIS' to interact"
echo "🔧 API server: http://localhost:8000"
echo "📱 Voice server: http://localhost:8001"
echo ""
echo "To stop JARVIS, run: bash stop-jarvis.sh"

# Save PIDs for cleanup
echo $VOICE_PID > logs/voice.pid
echo $SERVER_PID > logs/server.pid

# Keep script running
wait
