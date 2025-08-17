#!/bin/bash
# Stop J.A.R.V.I.S

echo "🛑 Stopping J.A.R.V.I.S..."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

if [ -f "$PROJECT_DIR/voice.pid" ]; then
    kill $(cat "$PROJECT_DIR/voice.pid") 2>/dev/null
    rm "$PROJECT_DIR/voice.pid"
    echo "🎤 Voice server stopped"
fi

if [ -f "$PROJECT_DIR/server.pid" ]; then
    kill $(cat "$PROJECT_DIR/server.pid") 2>/dev/null
    rm "$PROJECT_DIR/server.pid"
    echo "🌐 Main server stopped"
fi

echo "✅ J.A.R.V.I.S stopped successfully"
