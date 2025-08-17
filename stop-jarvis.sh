#!/bin/bash
# Stop J.A.R.V.I.S - Project Root Version

echo "🛑 Stopping J.A.R.V.I.S..."

if [ -f nextjs.pid ]; then
    kill $(cat nextjs.pid) 2>/dev/null
    rm nextjs.pid
    echo "🌐 Next.js server stopped"
fi

if [ -f voice.pid ]; then
    kill $(cat voice.pid) 2>/dev/null
    rm voice.pid
    echo "🎤 Voice server stopped"
fi

if [ -f server.pid ]; then
    kill $(cat server.pid) 2>/dev/null
    rm server.pid
    echo "🔧 API server stopped"
fi

# Fallback: kill by process name
pkill -f "jarvis-voice.py" 2>/dev/null
pkill -f "jarvis-server.js" 2>/dev/null
pkill -f "next dev" 2>/dev/null

echo "✅ J.A.R.V.I.S stopped successfully"
