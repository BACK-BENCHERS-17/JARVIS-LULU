#!/bin/bash
# J.A.R.V.I.S Startup Script

echo "🚀 Starting J.A.R.V.I.S Personal Assistant..."

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Make scripts executable
chmod +x "$SCRIPT_DIR"/*.sh

# Start the voice recognition server
echo "🎤 Starting voice recognition..."
python "$SCRIPT_DIR/jarvis-voice.py" &
VOICE_PID=$!

# Wait a moment for voice server to start
sleep 3

# Start the main server
echo "🌐 Starting main server..."
node "$SCRIPT_DIR/jarvis-server.js" &
SERVER_PID=$!

echo $VOICE_PID > "$PROJECT_DIR/voice.pid"
echo $SERVER_PID > "$PROJECT_DIR/server.pid"

echo "✅ J.A.R.V.I.S is now running!"
echo "📱 Voice server: http://localhost:8001"
echo "🌐 Main server: http://localhost:8000"
echo "🎯 Open your web interface and connect to localhost:8000"
echo ""
echo "To stop J.A.R.V.I.S, run: $SCRIPT_DIR/stop-jarvis.sh"

# Keep script running
wait
