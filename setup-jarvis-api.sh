#!/bin/bash

echo "🔧 Setting up JARVIS with GPT API integration..."

# Install required Python packages
echo "📦 Installing Python packages..."
pip install openai requests

# Check if OpenAI API key is set
if [ -z "$OPENAI_API_KEY" ]; then
    echo "⚠️ OpenAI API key not found!"
    echo "To enable intelligent responses, set your API key:"
    echo "export OPENAI_API_KEY='your-api-key-here'"
    echo "Add this to your ~/.bashrc to make it permanent"
else
    echo "✅ OpenAI API key found!"
fi

echo "🎤 JARVIS setup complete!"
echo "Run: bash start-jarvis-termux.sh"
