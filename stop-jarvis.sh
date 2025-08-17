#!/bin/bash
# Stop J.A.R.V.I.S

echo "🛑 Stopping J.A.R.V.I.S..."

if [ -f ~/jarvis/voice.pid ]; then
    kill $(cat ~/jarvis/voice.pid) 2>/dev/null
    rm ~/jarvis/voice.pid
    echo "🎤 Voice server stopped"
fi

if [ -f ~/jarvis/server.pid ]; then
    kill $(cat ~/jarvis/server.pid) 2>/dev/null
    rm ~/jarvis/server.pid
    echo "🌐 Main server stopped"
fi

echo "✅ J.A.R.V.I.S stopped successfully"
