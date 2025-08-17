#!/bin/bash
# J.A.R.V.I.S Startup Script - Project Root Version

echo "🚀 Starting J.A.R.V.I.S Personal Assistant..."

# Check if we're in the right directory
if [ ! -d "scripts" ]; then
    echo "❌ Error: scripts directory not found!"
    echo "Please run this from the project root directory"
    exit 1
fi

# Make scripts executable
chmod +x scripts/*.sh

echo "🌐 Starting Next.js web interface..."
npm run dev &
NEXTJS_PID=$!

# Start the voice recognition server
echo "🎤 Starting voice recognition..."
python scripts/jarvis-voice.py &
VOICE_PID=$!

# Wait a moment for voice server to start
sleep 3

# Start the main server
echo "🌐 Starting API server..."
node scripts/jarvis-server.js &
SERVER_PID=$!

# Create PID files for easy stopping
echo $VOICE_PID > voice.pid
echo $SERVER_PID > server.pid
echo $NEXTJS_PID > nextjs.pid

echo "✅ J.A.R.V.I.S is now running!"
echo "🌐 Web Interface: http://localhost:3000"
echo "📱 Voice server: http://localhost:8001"
echo "🔧 API server: http://localhost:8000"
echo "🎯 Open http://localhost:3000 for the full JARVIS experience"
echo ""
echo "To stop J.A.R.V.I.S, run: bash stop-jarvis.sh"

# Keep script running
wait
