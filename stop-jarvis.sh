#!/bin/bash
# Stop J.A.R.V.I.S - Voice Only Version

echo "🛑 Stopping J.A.R.V.I.S..."

pkill -f "jarvis-voice.py" 2>/dev/null

# Clean up any remaining processes
pkill -f "python.*jarvis-voice" 2>/dev/null

echo "🔊 JARVIS: Goodbye! I'll be here when you need me again."
echo "✅ J.A.R.V.I.S voice assistant stopped successfully"
