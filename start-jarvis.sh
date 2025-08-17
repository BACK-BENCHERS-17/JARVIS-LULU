#!/bin/bash
# J.A.R.V.I.S Startup Script

echo "🚀 Starting J.A.R.V.I.S Personal Assistant..."

# Make scripts executable
chmod +x ~/jarvis/scripts/*.sh

# Start the voice recognition server
echo "🎤 Starting voice recognition..."
python ~/jarvis/scripts/jarvis-voice.py &
VOICE_PID=$!

# Wait a moment for voice server to start
sleep 3

# Start the main server
echo "🌐 Starting main server..."
node ~/jarvis/scripts/jarvis-server.js &
SERVER_PID=$!

# Create PID file for easy stopping
echo $VOICE_PID > ~/jarvis/voice.pid
echo $SERVER_PID > ~/jarvis/server.pid

echo "✅ J.A.R.V.I.S is now running!"
echo "📱 Voice server: http://localhost:8001"
echo "🌐 Main server: http://localhost:8000"
echo "🎯 Open your web interface and connect to localhost:8000"
echo ""
echo "To stop J.A.R.V.I.S, run: ~/jarvis/scripts/stop-jarvis.sh"

# Keep script running
wait
