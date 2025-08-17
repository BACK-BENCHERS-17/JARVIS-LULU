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
import os
from datetime import datetime

class JarvisVoice:
    def __init__(self):
        self.recognizer = sr.Recognizer()
        self.microphone = sr.Microphone()
        self.tts_engine = None
        self.tts_available = False
        
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        if not self.openai_api_key:
            print("⚠️ OpenAI API key not found. Set OPENAI_API_KEY environment variable for intelligent responses.")
        
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
        
        self.greetings = [
            "I am JARVIS, your personal assistant. How can I assist you today?",
            "JARVIS at your service. What would you like me to help you with?",
            "I'm here and ready to help. What can I do for you?",
            "Your personal AI assistant is online. How may I be of assistance?",
            "JARVIS reporting for duty. What tasks can I handle for you today?",
            "Good to see you again! What exciting task do we have today?",
            "I'm fully operational and eager to help. What's on your mind?"
        ]
        
        self.conversation_context = []
        
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
        self.start_listening()

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
            
        welcome_msg = f"{greeting}, {self.user_name}! " + random.choice(self.greetings)
        self.speak(welcome_msg)
        self.speak("Say 'Hey JARVIS' to wake me up, or just start talking to me.")

    def speak(self, text, language='en'):
        """Enhanced TTS with better espeak integration"""
        print(f"🔊 JARVIS: {text}")
        
        try:
            if language == 'hi':
                subprocess.run(['termux-tts-speak', text, '-l', 'hi-IN'], check=False)
            elif self.tts_available and self.tts_engine:
                self.tts_engine.say(text)
                self.tts_engine.runAndWait()
            else:
                result = subprocess.run([
                    'espeak', text, 
                    '-s', '155',  # Slightly slower for clarity
                    '-p', '45',   # Better pitch
                    '-a', '120',  # Higher amplitude
                    '-g', '8',    # More gap between words
                    '-v', 'en+m3' # Male voice variant
                ], capture_output=True)
                
                if result.returncode != 0:
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

    def start_listening(self):
        """Start the main listening loop"""
        threading.Thread(target=self.listen_for_wake_word, daemon=True).start()
        
        # Keep main thread alive
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            self.speak("JARVIS shutting down. Goodbye!")
            self.is_listening = False

    def listen_for_wake_word(self):
        """Continuous listening for wake word"""
        with self.microphone as source:
            self.recognizer.adjust_for_ambient_noise(source, duration=2)
        
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
        
        self.conversation_context.append(f"User: {command}")
        
        # Check for specific command patterns
        for keyword, handler in self.responses.items():
            if keyword in command:
                handler(command)
                return
        
        if any(word in command for word in ['how are you', 'how do you do', 'how are you doing']):
            responses = [
                "I'm functioning perfectly and feeling quite energetic today! How are you doing?",
                "All systems are running smoothly, thank you for asking! What about you?",
                "I'm doing wonderfully and ready for any challenge! How has your day been?",
                "Excellent as always! I'm here and happy to help. How are you feeling today?"
            ]
            response = random.choice(responses)
            self.speak(response)
            self.conversation_context.append(f"JARVIS: {response}")
        elif any(word in command for word in ['thank you', 'thanks', 'appreciate']):
            responses = [
                "You're absolutely welcome! It's my pleasure to help you.",
                "Anytime! I genuinely enjoy assisting you with your tasks.",
                "My pleasure entirely! That's what I'm here for.",
                "You're very kind! I'm always happy to be of service."
            ]
            response = random.choice(responses)
            self.speak(response)
            self.conversation_context.append(f"JARVIS: {response}")
        elif any(word in command for word in ['who are you', 'what are you', 'introduce yourself']):
            response = "I'm JARVIS, your personal AI assistant created to make your life easier and more enjoyable. I can help with tasks, answer questions, and have friendly conversations with you!"
            self.speak(response)
            self.conversation_context.append(f"JARVIS: {response}")
        elif any(word in command for word in ['help', 'what can you do', 'capabilities']):
            self.list_capabilities()
        else:
            self.handle_general_query(command)

    def get_gpt_response(self, query):
        """Get intelligent response from GPT API"""
        if not self.openai_api_key:
            return None
            
        try:
            # Prepare conversation context
            context = "\n".join(self.conversation_context[-6:])  # Last 6 exchanges
            
            headers = {
                'Authorization': f'Bearer {self.openai_api_key}',
                'Content-Type': 'application/json'
            }
            
            data = {
                'model': 'gpt-3.5-turbo',
                'messages': [
                    {
                        'role': 'system', 
                        'content': 'You are JARVIS, a friendly and helpful AI assistant. Keep responses concise (1-2 sentences), conversational, and helpful. You are running on a mobile device in Termux.'
                    },
                    {
                        'role': 'user', 
                        'content': f"Context: {context}\n\nUser question: {query}"
                    }
                ],
                'max_tokens': 150,
                'temperature': 0.7
            }
            
            response = requests.post(
                'https://api.openai.com/v1/chat/completions',
                headers=headers,
                json=data,
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                return result['choices'][0]['message']['content'].strip()
            else:
                print(f"API Error: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"GPT API Error: {e}")
            return None

    def handle_general_query(self, command):
        """Handle general queries with GPT API or fallback responses"""
        gpt_response = self.get_gpt_response(command)
        
        if gpt_response:
            self.speak(gpt_response)
            self.conversation_context.append(f"JARVIS: {gpt_response}")
        else:
            # Friendly fallback responses
            responses = [
                "That's a fascinating question! While I'm still expanding my knowledge, I'd love to help you explore that topic further.",
                "Interesting! I'm always learning new things. Could you tell me more about what you're curious about?",
                "Great question! I may not have all the answers, but I'm here to help however I can. What specifically interests you about that?",
                "I find that topic intriguing! While I'm still developing my expertise there, I'm happy to discuss it with you.",
                "That's something I'd love to learn more about too! What aspects of that are you most curious about?"
            ]
            response = random.choice(responses)
            self.speak(response)
            self.conversation_context.append(f"JARVIS: {response}")

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
        capabilities = """I'm quite versatile! I can tell you the time and date, check your battery, 
        open apps, help with calls and messages, play music, open camera and calculator. 
        I can also tell jokes, have friendly conversations, answer questions, and learn from our chats. 
        Just talk to me naturally - I'm here to help make your day better!"""
        self.speak(capabilities)
        self.conversation_context.append(f"JARVIS: {capabilities}")

if __name__ == '__main__':
    print("🎤 J.A.R.V.I.S Voice System Starting...")
    print("🚀 JARVIS is now activated and ready!")
    jarvis = JarvisVoice()
