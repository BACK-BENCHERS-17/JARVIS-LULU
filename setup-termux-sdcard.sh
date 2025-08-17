#!/bin/bash

echo "🚀 Setting up J.A.R.V.I.S in /sdcard/jarvis..."

# Create directory structure in /sdcard/jarvis
mkdir -p /sdcard/jarvis/scripts
mkdir -p /sdcard/jarvis/logs
mkdir -p /sdcard/jarvis/data

cd /sdcard/jarvis

# Install required packages
echo "📦 Installing required packages..."
pkg update -y
pkg install -y python nodejs npm termux-api git curl wget

# Install Python packages
echo "🐍 Installing Python packages..."
pip install speech_recognition pyttsx3 requests flask flask-cors

# Install Node.js packages
echo "📦 Installing Node.js packages..."
npm init -y
npm install express cors ws node-fetch

# Set permissions for Termux API
echo "🔐 Setting up Termux API permissions..."
termux-setup-storage

# Create voice recognition script
cat > scripts/jarvis-voice.py << 'EOF'
#!/usr/bin/env python3
import speech_recognition as sr
import pyttsx3
import json
import requests
import threading
import time
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

class JarvisVoice:
    def __init__(self):
        self.recognizer = sr.Recognizer()
        self.microphone = sr.Microphone()
        self.tts_engine = pyttsx3.init()
        self.is_listening = False
        self.wake_words = ['jarvis', 'जार्विस']
        
        # Configure TTS
        self.tts_engine.setProperty('rate', 150)
        self.tts_engine.setProperty('volume', 0.8)
        
        # Adjust for ambient noise
        with self.microphone as source:
            self.recognizer.adjust_for_ambient_noise(source)
    
    def speak(self, text):
        """Convert text to speech"""
        try:
            self.tts_engine.say(text)
            self.tts_engine.runAndWait()
            return True
        except Exception as e:
            print(f"TTS Error: {e}")
            return False
    
    def listen_for_wake_word(self):
        """Continuously listen for wake word"""
        while True:
            try:
                with self.microphone as source:
                    print("🎤 Listening for wake word...")
                    audio = self.recognizer.listen(source, timeout=1, phrase_time_limit=3)
                
                text = self.recognizer.recognize_google(audio).lower()
                print(f"Heard: {text}")
                
                if any(wake_word in text for wake_word in self.wake_words):
                    print("🎯 Wake word detected!")
                    self.speak("Yes, how can I help you?")
                    self.process_command()
                    
            except sr.WaitTimeoutError:
                pass
            except sr.UnknownValueError:
                pass
            except Exception as e:
                print(f"Wake word detection error: {e}")
                time.sleep(1)
    
    def process_command(self):
        """Process voice command after wake word"""
        try:
            with self.microphone as source:
                print("🎤 Listening for command...")
                audio = self.recognizer.listen(source, timeout=5, phrase_time_limit=10)
            
            command = self.recognizer.recognize_google(audio)
            print(f"Command: {command}")
            
            # Send command to main server
            response = requests.post('http://localhost:8000/api/voice-command', 
                                   json={'command': command})
            
            if response.status_code == 200:
                result = response.json()
                if result.get('response'):
                    self.speak(result['response'])
                    
        except sr.WaitTimeoutError:
            self.speak("I didn't hear anything. Try again.")
        except sr.UnknownValueError:
            self.speak("Sorry, I didn't understand that.")
        except Exception as e:
            print(f"Command processing error: {e}")
            self.speak("There was an error processing your command.")

# Flask routes
jarvis = JarvisVoice()

@app.route('/speak', methods=['POST'])
def speak_text():
    data = request.json
    text = data.get('text', '')
    success = jarvis.speak(text)
    return jsonify({'success': success})

@app.route('/status', methods=['GET'])
def get_status():
    return jsonify({
        'status': 'online',
        'listening': jarvis.is_listening,
        'timestamp': time.time()
    })

if __name__ == '__main__':
    # Start wake word detection in background
    wake_thread = threading.Thread(target=jarvis.listen_for_wake_word, daemon=True)
    wake_thread.start()
    
    print("🎤 J.A.R.V.I.S Voice System Started")
    print("📡 Voice server running on http://localhost:8001")
    
    app.run(host='0.0.0.0', port=8001, debug=False)
EOF

# Create phone controls script
cat > scripts/phone-controls.sh << 'EOF'
#!/bin/bash

LOG_FILE="/sdcard/jarvis/logs/phone-controls.log"

log_action() {
    echo "[$(date)] $1" >> "$LOG_FILE"
}

case "$1" in
    "wifi_on")
        log_action "Enabling Wi-Fi"
        termux-wifi-enable
        echo "✅ Wi-Fi enabled"
        ;;
    "wifi_off")
        log_action "Disabling Wi-Fi"
        termux-wifi-disable
        echo "✅ Wi-Fi disabled"
        ;;
    "torch_on")
        log_action "Turning on torch"
        termux-torch on
        echo "✅ Torch enabled"
        ;;
    "torch_off")
        log_action "Turning off torch"
        termux-torch off
        echo "✅ Torch disabled"
        ;;
    "volume_up")
        log_action "Increasing volume"
        termux-volume music up
        echo "✅ Volume increased"
        ;;
    "volume_down")
        log_action "Decreasing volume"
        termux-volume music down
        echo "✅ Volume decreased"
        ;;
    "brightness_up")
        log_action "Increasing brightness"
        termux-brightness 255
        echo "✅ Brightness set to maximum"
        ;;
    "brightness_down")
        log_action "Decreasing brightness"
        termux-brightness 50
        echo "✅ Brightness set to low"
        ;;
    "vibrate")
        log_action "Triggering vibration"
        termux-vibrate -d 500
        echo "✅ Vibration triggered"
        ;;
    "battery")
        log_action "Checking battery status"
        termux-battery-status
        ;;
    "screen_on")
        log_action "Turning screen on"
        termux-wake-lock
        echo "✅ Screen wake lock enabled"
        ;;
    "screen_off")
        log_action "Allowing screen off"
        termux-wake-unlock
        echo "✅ Screen wake lock disabled"
        ;;
    *)
        echo "Usage: $0 {wifi_on|wifi_off|torch_on|torch_off|volume_up|volume_down|brightness_up|brightness_down|vibrate|battery|screen_on|screen_off}"
        exit 1
        ;;
esac
EOF

# Create app launcher script
cat > scripts/app-launcher.sh << 'EOF'
#!/bin/bash

LOG_FILE="/sdcard/jarvis/logs/app-launcher.log"

log_action() {
    echo "[$(date)] Launching $1" >> "$LOG_FILE"
}

launch_app() {
    local app_name="$1"
    local package_name="$2"
    
    log_action "$app_name"
    
    if termux-open --send "$package_name" 2>/dev/null; then
        echo "✅ $app_name launched successfully"
    else
        # Fallback to intent
        am start -n "$package_name" 2>/dev/null || \
        am start -a android.intent.action.MAIN -c android.intent.category.LAUNCHER "$package_name" 2>/dev/null || \
        echo "❌ Failed to launch $app_name"
    fi
}

case "$1" in
    "camera")
        launch_app "Camera" "com.android.camera/.Camera"
        ;;
    "gallery")
        launch_app "Gallery" "com.android.gallery3d/.app.GalleryActivity"
        ;;
    "settings")
        launch_app "Settings" "com.android.settings/.Settings"
        ;;
    "browser")
        launch_app "Browser" "com.android.browser/.BrowserActivity"
        ;;
    "chrome")
        launch_app "Chrome" "com.android.chrome/com.google.android.apps.chrome.Main"
        ;;
    "maps")
        launch_app "Maps" "com.google.android.apps.maps/com.google.android.maps.MapsActivity"
        ;;
    "phone")
        launch_app "Phone" "com.android.dialer/.DialtactsActivity"
        ;;
    "messages")
        launch_app "Messages" "com.android.mms/.ui.ConversationList"
        ;;
    "music")
        launch_app "Music" "com.android.music/.MusicBrowserActivity"
        ;;
    "calculator")
        launch_app "Calculator" "com.android.calculator2/.Calculator"
        ;;
    "files")
        launch_app "Files" "com.android.documentsui/.files.FilesActivity"
        ;;
    "calendar")
        launch_app "Calendar" "com.android.calendar/.AllInOneActivity"
        ;;
    "clock")
        launch_app "Clock" "com.android.deskclock/.DeskClock"
        ;;
    "whatsapp")
        launch_app "WhatsApp" "com.whatsapp/.Main"
        ;;
    "telegram")
        launch_app "Telegram" "org.telegram.messenger/.DefaultIcon"
        ;;
    *)
        echo "Available apps: camera, gallery, settings, browser, chrome, maps, phone, messages, music, calculator, files, calendar, clock, whatsapp, telegram"
        exit 1
        ;;
esac
EOF

# Create main server script
cat > scripts/jarvis-server.js << 'EOF'
const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const LOG_FILE = '/sdcard/jarvis/logs/server.log';

function logAction(action, details = '') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${action} ${details}\n`;
    fs.appendFileSync(LOG_FILE, logEntry);
    console.log(`[${timestamp}] ${action} ${details}`);
}

// Voice command processing
app.post('/api/voice-command', (req, res) => {
    const { command } = req.body;
    logAction('Voice command received:', command);
    
    const lowerCommand = command.toLowerCase();
    let response = '';
    
    if (lowerCommand.includes('open') || lowerCommand.includes('launch')) {
        const appName = extractAppName(lowerCommand);
        if (appName) {
            exec(`bash /sdcard/jarvis/scripts/app-launcher.sh ${appName}`, (error, stdout) => {
                if (error) {
                    logAction('App launch error:', error.message);
                } else {
                    logAction('App launched:', appName);
                }
            });
            response = `Opening ${appName} app for you.`;
        }
    } else if (lowerCommand.includes('wifi') || lowerCommand.includes('torch') || 
               lowerCommand.includes('volume') || lowerCommand.includes('brightness')) {
        handlePhoneControl(lowerCommand);
        response = 'Phone control command executed.';
    } else if (lowerCommand.includes('time')) {
        response = `The current time is ${new Date().toLocaleTimeString()}.`;
    } else if (lowerCommand.includes('date')) {
        response = `Today is ${new Date().toLocaleDateString()}.`;
    } else {
        response = 'Command processed. How else can I help you?';
    }
    
    res.json({ response, status: 'success' });
});

// Phone controls
app.post('/api/phone-control', (req, res) => {
    const { action } = req.body;
    logAction('Phone control:', action);
    
    exec(`bash /sdcard/jarvis/scripts/phone-controls.sh ${action}`, (error, stdout, stderr) => {
        if (error) {
            logAction('Phone control error:', error.message);
            res.json({ success: false, error: error.message });
        } else {
            logAction('Phone control success:', stdout.trim());
            res.json({ success: true, output: stdout.trim() });
        }
    });
});

// App launcher
app.post('/api/launch-app', (req, res) => {
    const { appName } = req.body;
    logAction('App launch request:', appName);
    
    exec(`bash /sdcard/jarvis/scripts/app-launcher.sh ${appName}`, (error, stdout, stderr) => {
        if (error) {
            logAction('App launch error:', error.message);
            res.json({ success: false, error: error.message });
        } else {
            logAction('App launch success:', stdout.trim());
            res.json({ success: true, output: stdout.trim() });
        }
    });
});

// System status
app.get('/api/status', (req, res) => {
    exec('termux-battery-status', (error, stdout) => {
        let batteryInfo = {};
        if (!error) {
            try {
                batteryInfo = JSON.parse(stdout);
            } catch (e) {
                batteryInfo = { percentage: 'Unknown' };
            }
        }
        
        res.json({
            status: 'online',
            timestamp: new Date().toISOString(),
            battery: batteryInfo,
            location: '/sdcard/jarvis'
        });
    });
});

function extractAppName(command) {
    const appMappings = {
        'camera': 'camera',
        'gallery': 'gallery',
        'photos': 'gallery',
        'settings': 'settings',
        'browser': 'browser',
        'chrome': 'chrome',
        'maps': 'maps',
        'phone': 'phone',
        'messages': 'messages',
        'music': 'music',
        'calculator': 'calculator',
        'files': 'files',
        'calendar': 'calendar',
        'clock': 'clock',
        'whatsapp': 'whatsapp',
        'telegram': 'telegram'
    };
    
    for (const [key, value] of Object.entries(appMappings)) {
        if (command.includes(key)) {
            return value;
        }
    }
    return null;
}

function handlePhoneControl(command) {
    let action = '';
    
    if (command.includes('wifi')) {
        action = command.includes('on') || command.includes('enable') ? 'wifi_on' : 'wifi_off';
    } else if (command.includes('torch') || command.includes('flashlight')) {
        action = command.includes('on') || command.includes('enable') ? 'torch_on' : 'torch_off';
    } else if (command.includes('volume')) {
        action = command.includes('up') || command.includes('increase') ? 'volume_up' : 'volume_down';
    } else if (command.includes('brightness')) {
        action = command.includes('up') || command.includes('increase') ? 'brightness_up' : 'brightness_down';
    } else if (command.includes('vibrate')) {
        action = 'vibrate';
    } else if (command.includes('battery')) {
        action = 'battery';
    }
    
    if (action) {
        exec(`bash /sdcard/jarvis/scripts/phone-controls.sh ${action}`, (error, stdout) => {
            if (error) {
                logAction('Phone control error:', error.message);
            } else {
                logAction('Phone control executed:', action);
            }
        });
    }
}

const PORT = 8000;
app.listen(PORT, '0.0.0.0', () => {
    logAction('J.A.R.V.I.S Server started', `http://localhost:${PORT}`);
    console.log(`🌐 J.A.R.V.I.S Server running on http://localhost:${PORT}`);
});
EOF

# Create startup script
cat > scripts/start-jarvis.sh << 'EOF'
#!/bin/bash

echo "🚀 Starting J.A.R.V.I.S Personal Assistant..."

# Set working directory
cd /sdcard/jarvis

# Create logs directory if it doesn't exist
mkdir -p logs

# Make scripts executable
chmod +x scripts/*.sh scripts/*.py

echo "🎤 Starting voice recognition..."
python scripts/jarvis-voice.py &
VOICE_PID=$!

echo "🌐 Starting main server..."
node scripts/jarvis-server.js &
SERVER_PID=$!

# Save PIDs for stopping later
echo $VOICE_PID > logs/voice.pid
echo $SERVER_PID > logs/server.pid

echo "✅ J.A.R.V.I.S is now running!"
echo "📱 Voice server: http://localhost:8001"
echo "🌐 Main server: http://localhost:8000"
echo "🎯 Open your web interface and connect to localhost:8000"
echo ""
echo "To stop J.A.R.V.I.S, run: bash /sdcard/jarvis/scripts/stop-jarvis.sh"

# Keep script running
wait
EOF

# Create stop script
cat > scripts/stop-jarvis.sh << 'EOF'
#!/bin/bash

echo "🛑 Stopping J.A.R.V.I.S..."

cd /sdcard/jarvis

# Kill processes using saved PIDs
if [ -f logs/voice.pid ]; then
    VOICE_PID=$(cat logs/voice.pid)
    kill $VOICE_PID 2>/dev/null
    rm logs/voice.pid
    echo "🎤 Voice recognition stopped"
fi

if [ -f logs/server.pid ]; then
    SERVER_PID=$(cat logs/server.pid)
    kill $SERVER_PID 2>/dev/null
    rm logs/server.pid
    echo "🌐 Main server stopped"
fi

# Fallback: kill by process name
pkill -f "jarvis-voice.py" 2>/dev/null
pkill -f "jarvis-server.js" 2>/dev/null

echo "✅ J.A.R.V.I.S stopped successfully"
EOF

# Make all scripts executable
chmod +x scripts/*.sh

echo "✅ J.A.R.V.I.S setup completed in /sdcard/jarvis!"
echo ""
echo "📋 Next steps:"
echo "1. Grant Termux permissions: Settings → Apps → Termux → Permissions"
echo "2. Enable: Storage, Microphone, Phone, Device Admin"
echo "3. Start J.A.R.V.I.S: bash /sdcard/jarvis/scripts/start-jarvis.sh"
echo "4. Open your web interface and connect to localhost:8000"
echo ""
echo "🎯 All files are now in /sdcard/jarvis for easy access!"
EOF

chmod +x scripts/setup-termux-sdcard.sh

echo "✅ Setup script created! Run: bash /sdcard/jarvis/scripts/setup-termux-sdcard.sh"
