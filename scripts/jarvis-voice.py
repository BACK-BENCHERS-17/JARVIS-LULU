#!/usr/bin/env python3
"""
J.A.R.V.I.S Voice Recognition and TTS for Termux
"""
import speech_recognition as sr
import subprocess
import json
import time
import threading
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

class JarvisVoice:
    def __init__(self):
        self.recognizer = sr.Recognizer()
        self.microphone = sr.Microphone()
        self.tts_engine = None
        self.tts_available = False
        
        # Try to initialize TTS engine
        try:
            import pyttsx3
            self.tts_engine = pyttsx3.init()
            self.tts_engine.setProperty('rate', 150)
            self.tts_engine.setProperty('volume', 0.9)
            self.tts_available = True
            print("✅ TTS engine initialized successfully")
        except Exception as e:
            print(f"⚠️ TTS engine not available: {e}")
            print("📱 Will use Termux TTS as fallback")
        
        self.is_listening = False
        self.wake_word = "jarvis"
        
    def speak(self, text, language='en'):
        """Text to speech with language support and fallback options"""
        try:
            if language == 'hi':
                # For Hindi, use system TTS if available
                subprocess.run(['termux-tts-speak', text, '-l', 'hi-IN'], check=False)
            elif self.tts_available and self.tts_engine:
                # Use pyttsx3 if available
                self.tts_engine.say(text)
                self.tts_engine.runAndWait()
            else:
                # Fallback to Termux TTS
                result = subprocess.run(['termux-tts-speak', text], capture_output=True)
                if result.returncode != 0:
                    # Final fallback - just print
                    print(f"🔊 JARVIS: {text}")
        except Exception as e:
            print(f"TTS Error: {e}")
            print(f"🔊 JARVIS: {text}")  # Always show text as fallback
    
    def listen_for_wake_word(self):
        """Continuous listening for wake word"""
        with self.microphone as source:
            self.recognizer.adjust_for_ambient_noise(source)
        
        while True:
            try:
                with self.microphone as source:
                    audio = self.recognizer.listen(source, timeout=1, phrase_time_limit=3)
                
                text = self.recognizer.recognize_google(audio).lower()
                print(f"Heard: {text}")
                
                if self.wake_word in text:
                    self.speak("Yes sir, how can I help you?")
                    return self.listen_for_command()
                    
            except sr.WaitTimeoutError:
                pass
            except sr.UnknownValueError:
                pass
            except Exception as e:
                print(f"Wake word error: {e}")
                time.sleep(1)
    
    def listen_for_command(self):
        """Listen for actual command after wake word"""
        try:
            with self.microphone as source:
                print("Listening for command...")
                audio = self.recognizer.listen(source, timeout=5, phrase_time_limit=10)
            
            command = self.recognizer.recognize_google(audio)
            print(f"Command: {command}")
            return command
            
        except Exception as e:
            print(f"Command recognition error: {e}")
            return None

# Flask API endpoints
jarvis = JarvisVoice()

@app.route('/speak', methods=['POST'])
def speak_endpoint():
    data = request.json
    text = data.get('text', '')
    language = data.get('language', 'en')
    jarvis.speak(text, language)
    return jsonify({'status': 'success'})

@app.route('/listen', methods=['POST'])
def listen_endpoint():
    command = jarvis.listen_for_command()
    return jsonify({'command': command})

@app.route('/wake-word', methods=['POST'])
def toggle_wake_word():
    if not jarvis.is_listening:
        jarvis.is_listening = True
        threading.Thread(target=jarvis.listen_for_wake_word, daemon=True).start()
        return jsonify({'status': 'listening'})
    else:
        jarvis.is_listening = False
        return jsonify({'status': 'stopped'})

if __name__ == '__main__':
    print("🎤 J.A.R.V.I.S Voice System Starting...")
    app.run(host='0.0.0.0', port=8001, debug=False)
