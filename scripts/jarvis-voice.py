#!/usr/bin/env python3
"""
J.A.R.V.I.S Voice Recognition and TTS for Termux
Enhanced with conversational AI and feature integration
"""
import speech_recognition as sr
import subprocess
import json
import time
import threading
import requests
import random
from datetime import datetime
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
        
        try:
            import pyttsx3
            self.tts_engine = pyttsx3.init()
            self.tts_engine.setProperty('rate', 150)
            self.tts_engine.setProperty('volume', 0.9)
            self.tts_available = True
            print("✅ TTS engine initialized successfully")
        except Exception as e:
            print(f"⚠️ TTS engine not available: {e}")
            print("📱 Will use espeak directly")
        
        self.is_listening = False
        self.wake_word = "jarvis"
        self.user_name = "Sir"
        
        self.responses = {
            'time': self.get_time,
            'date': self.get_date,
            'weather': self.get_weather_info,
            'battery': self.get_battery_status,
            'apps': self.list_apps,
            'call': self.make_call,
            'message': self.send_message,
            'music': self.play_music,
            'camera': self.open_camera,
            'calculator': self.open_calculator,
            'settings': self.open_settings,
            'joke': self.tell_joke,
            'compliment': self.give_compliment,
            'goodbye': self.say_goodbye,
            'search': self.web_search,
            'note': self.take_note,
            'reminder': self.set_reminder,
            'wifi': self.wifi_info,
            'brightness': self.adjust_brightness,
            'volume': self.adjust_volume
        }
        
        # Start activation sequence
        self.announce_activation()
        self.initial_greeting()
        
        # Auto-start listening
        self.is_listening = True
        threading.Thread(target=self.listen_for_wake_word, daemon=True).start()

    def announce_activation(self):
        """Announce JARVIS activation"""
        self.speak("JARVIS is activated")
        time.sleep(0.5)  # Brief pause for dramatic effect
        
    def initial_greeting(self):
        """Initial greeting when JARVIS starts"""
        current_hour = datetime.now().hour
        if 5 <= current_hour < 12:
            greeting = "Good morning"
        elif 12 <= current_hour < 17:
            greeting = "Good afternoon"
        elif 17 <= current_hour < 21:
            greeting = "Good evening"
        else:
            greeting = "Good night"
            
        welcome_msg = f"{greeting}, {self.user_name}! " + random.choice(self.greetings).format(self.user_name)
        self.speak(welcome_msg)
        self.speak("Say 'Hey JARVIS' to wake me up, or just start talking to me.")

    def speak(self, text, language='en'):
        """Enhanced TTS with better espeak integration"""
        print(f"🔊 JARVIS: {text}")  # Always show text output
        
        try:
            if language == 'hi':
                subprocess.run(['termux-tts-speak', text, '-l', 'hi-IN'], check=False)
            elif self.tts_available and self.tts_engine:
                self.tts_engine.say(text)
                self.tts_engine.runAndWait()
            else:
                result = subprocess.run([
                    'espeak', text, 
                    '-s', '160',  # Speed
                    '-p', '40',   # Pitch
                    '-a', '100',  # Amplitude
                    '-g', '5'     # Gap between words
                ], capture_output=True)
                
                if result.returncode != 0:
                    # Fallback to termux-tts-speak
                    subprocess.run(['termux-tts-speak', text], check=False)
        except Exception as e:
            print(f"TTS Error: {e}")

    def web_search(self, command):
        """Perform web search"""
        query = command.replace('search', '').replace('for', '').strip()
        if query:
            self.speak(f"Searching for {query}")
            try:
                subprocess.run(['am', 'start', '-a', 'android.intent.action.WEB_SEARCH', '--es', 'query', query])
            except:
                self.speak("I couldn't perform the search right now.")
        else:
            self.speak("What would you like me to search for?")

    def take_note(self, command):
        """Take a note"""
        note_content = command.replace('note', '').replace('take', '').strip()
        if note_content:
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            try:
                with open('jarvis_notes.txt', 'a') as f:
                    f.write(f"[{timestamp}] {note_content}\n")
                self.speak("Note saved successfully.")
            except:
                self.speak("I couldn't save the note right now.")
        else:
            self.speak("What would you like me to note down?")

    def set_reminder(self, command):
        """Set a reminder"""
        self.speak("Reminder feature is being prepared. For now, I've noted your request.")
        self.take_note(f"Reminder: {command}")

    def wifi_info(self, command):
        """Get WiFi information"""
        try:
            result = subprocess.run(['termux-wifi-connectioninfo'], capture_output=True, text=True)
            if result.returncode == 0:
                wifi_info = json.loads(result.stdout)
                ssid = wifi_info.get('ssid', 'Unknown')
                self.speak(f"You are connected to {ssid}")
            else:
                self.speak("I couldn't get WiFi information right now.")
        except:
            self.speak("WiFi information is not available.")

    def adjust_brightness(self, command):
        """Adjust screen brightness"""
        self.speak("Opening display settings for brightness adjustment.")
        try:
            subprocess.run(['am', 'start', '-a', 'android.settings.DISPLAY_SETTINGS'])
        except:
            self.speak("I couldn't open display settings right now.")

    def adjust_volume(self, command):
        """Adjust volume"""
        if 'up' in command:
            subprocess.run(['input', 'keyevent', 'KEYCODE_VOLUME_UP'])
            self.speak("Volume increased.")
        elif 'down' in command:
            subprocess.run(['input', 'keyevent', 'KEYCODE_VOLUME_DOWN'])
            self.speak("Volume decreased.")
        else:
            self.speak("Opening sound settings.")
            try:
                subprocess.run(['am', 'start', '-a', 'android.settings.SOUND_SETTINGS'])
            except:
                self.speak("I couldn't open sound settings right now.")

    def listen_for_wake_word(self):
        """Continuous listening for wake word"""
        with self.microphone as source:
            self.recognizer.adjust_for_ambient_noise(source)
        
        print("🎤 Listening for wake word 'Hey JARVIS'...")
        
        while self.is_listening:
            try:
                with self.microphone as source:
                    audio = self.recognizer.listen(source, timeout=1, phrase_time_limit=3)
                
                text = self.recognizer.recognize_google(audio).lower()
                print(f"Heard: {text}")
                
                if any(wake in text for wake in ['jarvis', 'hey jarvis', 'hi jarvis']):
                    responses = [
                        "Yes sir, how can I help you?",
                        "I'm here, what do you need?",
                        "How may I assist you today?",
                        "At your service, sir. What can I do for you?"
                    ]
                    self.speak(random.choice(responses))
                    command = self.listen_for_command()
                    if command:
                        self.process_command(command)
                    
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
                print("🎤 Listening for command...")
                audio = self.recognizer.listen(source, timeout=8, phrase_time_limit=15)
            
            command = self.recognizer.recognize_google(audio)
            print(f"Command received: {command}")
            return command.lower()
            
        except sr.WaitTimeoutError:
            self.speak("I didn't hear anything. Please try again.")
            return None
        except sr.UnknownValueError:
            self.speak("Sorry, I didn't understand that. Could you repeat?")
            return None
        except Exception as e:
            print(f"Command recognition error: {e}")
            self.speak("There was an error processing your request.")
            return None

    def process_command(self, command):
        """Process voice commands and execute appropriate actions"""
        command = command.lower()
        
        # Check for specific command patterns
        for keyword, handler in self.responses.items():
            if keyword in command:
                handler(command)
                return
        
        # Handle conversational queries
        if any(word in command for word in ['how are you', 'how do you do']):
            self.speak("I'm functioning perfectly, thank you for asking! How are you doing today?")
        elif any(word in command for word in ['thank you', 'thanks']):
            self.speak("You're very welcome! I'm always happy to help.")
        elif any(word in command for word in ['who are you', 'what are you']):
            self.speak("I'm JARVIS, your personal AI assistant. I'm here to help you with various tasks and answer your questions.")
        elif any(word in command for word in ['help', 'what can you do']):
            self.list_capabilities()
        else:
            # Try to search or provide general response
            self.handle_general_query(command)

    def get_time(self, command):
        """Get current time"""
        current_time = datetime.now().strftime("%I:%M %p")
        self.speak(f"The current time is {current_time}")

    def get_date(self, command):
        """Get current date"""
        current_date = datetime.now().strftime("%A, %B %d, %Y")
        self.speak(f"Today is {current_date}")

    def get_weather_info(self, command):
        """Get weather information"""
        self.speak("Let me check the weather for you.")
        # You can integrate with weather API here
        self.speak("I'm still learning to access weather data. Please check your weather app for now.")

    def get_battery_status(self, command):
        """Get battery status"""
        try:
            result = subprocess.run(['termux-battery-status'], capture_output=True, text=True)
            if result.returncode == 0:
                battery_info = json.loads(result.stdout)
                percentage = battery_info.get('percentage', 'unknown')
                status = battery_info.get('status', 'unknown')
                self.speak(f"Your battery is at {percentage}% and is currently {status}")
            else:
                self.speak("I couldn't access battery information right now.")
        except Exception as e:
            self.speak("Battery information is not available.")

    def list_apps(self, command):
        """List installed apps"""
        self.speak("Let me show you your installed applications.")
        try:
            # This would integrate with the app launcher
            self.speak("Opening your app list now.")
            subprocess.run(['am', 'start', '-a', 'android.intent.action.MAIN', '-c', 'android.intent.category.LAUNCHER'])
        except:
            self.speak("I couldn't open the app list right now.")

    def make_call(self, command):
        """Make a phone call"""
        self.speak("Who would you like to call?")
        # This would integrate with phone controls
        self.speak("Phone calling feature is being prepared for you.")

    def send_message(self, command):
        """Send a message"""
        self.speak("I can help you send messages. This feature is being set up.")

    def play_music(self, command):
        """Play music"""
        self.speak("Let me play some music for you.")
        try:
            subprocess.run(['am', 'start', '-a', 'android.intent.action.VIEW', '-t', 'audio/*'])
        except:
            self.speak("I couldn't open the music player right now.")

    def open_camera(self, command):
        """Open camera"""
        self.speak("Opening camera for you.")
        try:
            subprocess.run(['am', 'start', '-a', 'android.media.action.IMAGE_CAPTURE'])
        except:
            self.speak("I couldn't open the camera right now.")

    def open_calculator(self, command):
        """Open calculator"""
        self.speak("Opening calculator.")
        try:
            subprocess.run(['am', 'start', '-n', 'com.android.calculator2/.Calculator'])
        except:
            self.speak("I couldn't open the calculator right now.")

    def open_settings(self, command):
        """Open settings"""
        self.speak("Opening device settings.")
        try:
            subprocess.run(['am', 'start', '-a', 'android.settings.SETTINGS'])
        except:
            self.speak("I couldn't open settings right now.")

    def tell_joke(self, command):
        """Tell a joke"""
        jokes = [
            "Why don't scientists trust atoms? Because they make up everything!",
            "I told my wife she was drawing her eyebrows too high. She looked surprised.",
            "Why don't programmers like nature? It has too many bugs!",
            "I'm reading a book about anti-gravity. It's impossible to put down!"
        ]
        self.speak(random.choice(jokes))

    def give_compliment(self, command):
        """Give a compliment"""
        compliments = [
            "You're doing great today!",
            "I appreciate you using me to help with your tasks.",
            "You have excellent taste in AI assistants!",
            "You're very smart for choosing JARVIS as your assistant."
        ]
        self.speak(random.choice(compliments))

    def say_goodbye(self, command):
        """Say goodbye"""
        goodbyes = [
            "Goodbye! Have a wonderful day!",
            "See you later! I'll be here when you need me.",
            "Take care! Call me anytime you need assistance.",
            "Until next time! Stay awesome!"
        ]
        self.speak(random.choice(goodbyes))

    def list_capabilities(self):
        """List JARVIS capabilities"""
        capabilities = """I can help you with many things! I can tell you the time and date, 
        check your battery status, open apps, make calls, send messages, play music, 
        open camera, calculator, and settings. I can also tell jokes, give compliments, 
        and have friendly conversations with you. Just ask me anything!"""
        self.speak(capabilities)

    def handle_general_query(self, command):
        """Handle general queries"""
        responses = [
            "That's an interesting question. Let me think about that.",
            "I'm still learning about that topic. Is there something specific I can help you with?",
            "I'd love to help you with that. Could you be more specific?",
            "That's a great question! I'm working on expanding my knowledge in that area."
        ]
        self.speak(random.choice(responses))

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
    if command:
        jarvis.process_command(command)
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

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'online',
        'tts_available': jarvis.tts_available,
        'listening': jarvis.is_listening
    })

if __name__ == '__main__':
    print("🎤 J.A.R.V.I.S Voice System Starting...")
    print("🚀 JARVIS is now activated and ready!")
    app.run(host='0.0.0.0', port=8001, debug=False)
