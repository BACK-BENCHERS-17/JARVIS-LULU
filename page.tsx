"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CodeGenerator } from "@/components/code-generator"
import { MessagingCenter } from "@/components/messaging-center"
import { PhoneControls } from "@/components/phone-controls"
import { UtilitiesPanel } from "@/components/utilities-panel"
import { ConfirmationSystem } from "@/components/confirmation-system"
import { Mic, MicOff, Settings, Calendar, Music, Bell, Zap, Activity, Volume2, VolumeX } from "lucide-react"
import { AppLauncher } from "@/components/app-launcher"
import { CodePreview } from "@/components/code-preview"

export default function JarvisInterface() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [response, setResponse] = useState("Hello, I am J.A.R.V.I.S. How may I assist you today?")
  const [pulseAnimation, setPulseAnimation] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState<"en" | "hi">("en")
  const [isWakeWordActive, setIsWakeWordActive] = useState(true)
  const [generatedCode, setGeneratedCode] = useState("")
  const [codeLanguage, setCodeLanguage] = useState("javascript")
  const [speechSupported, setSpeechSupported] = useState(false)
  const [ttsSupported, setTtsSupported] = useState(false)
  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const [isHologramMode, setIsHologramMode] = useState(false)
  const [activePanel, setActivePanel] = useState<string | null>(null)
  const [voiceWaveActive, setVoiceWaveActive] = useState(false)

  const addConfirmation = (action: string, details?: string) => {
    if ((window as any).jarvisConfirmation) {
      return (window as any).jarvisConfirmation.add(action, details)
    }
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        if ("speechSynthesis" in window) {
          synthRef.current = window.speechSynthesis
          setTtsSupported(true)
        } else {
          console.log("[v0] Speech synthesis not supported")
          setTtsSupported(false)
        }

        if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
          const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
          recognitionRef.current = new SpeechRecognition()
          recognitionRef.current.continuous = false
          recognitionRef.current.interimResults = true
          recognitionRef.current.lang = currentLanguage === "hi" ? "hi-IN" : "en-US"

          recognitionRef.current.onresult = (event: any) => {
            try {
              const current = event.resultIndex
              const transcript = event.results[current][0].transcript.toLowerCase()
              setTranscript(transcript)

              if (isWakeWordActive && (transcript.includes("jarvis") || transcript.includes("जार्विस"))) {
                const responses = getResponse("", currentLanguage)
                setResponse(responses.listening)
                if (voiceEnabled && synthRef.current) {
                  speak(responses.listening)
                }
                addConfirmation("Wake word detected", "J.A.R.V.I.S activated")
              }

              if (event.results[current].isFinal) {
                processVoiceCommand(transcript)
              }
            } catch (error) {
              console.log("[v0] Speech recognition result error:", error)
            }
          }

          recognitionRef.current.onend = () => {
            setIsListening(false)
            setPulseAnimation(false)
          }

          recognitionRef.current.onerror = (event: any) => {
            console.log("[v0] Speech recognition error:", event.error)
            setIsListening(false)
            setPulseAnimation(false)
            if (event.error === "not-allowed") {
              setResponse("Microphone access denied. Please allow microphone permissions and try again.")
            } else if (event.error === "network") {
              setResponse("Network error. Speech recognition requires internet connection.")
            } else {
              setResponse("Speech recognition temporarily unavailable. You can still use text commands.")
            }
          }

          setSpeechSupported(true)
        } else {
          console.log("[v0] Speech recognition not supported")
          setSpeechSupported(false)
        }
      } catch (error) {
        console.log("[v0] Error initializing speech APIs:", error)
        setSpeechSupported(false)
        setTtsSupported(false)
      }
    }
  }, [currentLanguage, isWakeWordActive])

  const processVoiceCommand = async (command: string) => {
    setIsProcessing(true)
    setVoiceWaveActive(true)
    const lowerCommand = command.toLowerCase()
    const responses = getResponse("", currentLanguage)

    const confirmationId = addConfirmation("Processing voice command", command)

    let responseText = ""

    if (lowerCommand.includes("hello") || lowerCommand.includes("hi") || lowerCommand.includes("namaste")) {
      responseText = responses.greeting
      addConfirmation("Greeting processed")
    } else if (lowerCommand.includes("open") || lowerCommand.includes("launch") || lowerCommand.includes("kholo")) {
      const appName = extractAppName(lowerCommand)
      if (appName) {
        responseText = responses.appLaunched(appName)
        handleAppLaunch(appName, "")
        addConfirmation(`${appName} app launch initiated`)
      } else {
        responseText = "Which app would you like me to open?"
        addConfirmation("App launch guidance provided")
      }
    } else if (lowerCommand.includes("code") || lowerCommand.includes("generate") || lowerCommand.includes("create")) {
      const codeRequest = command.replace(/generate|code|create|make|jarvis/gi, "").trim()
      if (codeRequest) {
        await generateCodeFromVoice(codeRequest)
        responseText = responses.codeGenerated
        addConfirmation("Code generation completed", codeRequest)
      } else {
        responseText = "What type of code would you like me to generate?"
        addConfirmation("Code generation guidance provided")
      }
    } else if (lowerCommand.includes("language") || lowerCommand.includes("bhasha")) {
      if (lowerCommand.includes("hindi") || lowerCommand.includes("हिंदी")) {
        setCurrentLanguage("hi")
        responseText = "भाषा हिंदी में बदल दी गई है।"
        addConfirmation("Language changed to Hindi")
      } else if (lowerCommand.includes("english") || lowerCommand.includes("अंग्रेजी")) {
        setCurrentLanguage("en")
        responseText = "Language changed to English."
        addConfirmation("Language changed to English")
      }
    } else if (lowerCommand.includes("time")) {
      const now = new Date()
      responseText = responses.time(now.toLocaleTimeString())
      addConfirmation("Time retrieved", now.toLocaleTimeString())
    } else if (lowerCommand.includes("date")) {
      const now = new Date()
      responseText = responses.date(now.toLocaleDateString())
      addConfirmation("Date retrieved", now.toLocaleDateString())
    } else if (lowerCommand.includes("weather")) {
      responseText = responses.weather
      addConfirmation("Weather information provided")
    } else if (lowerCommand.includes("note") || lowerCommand.includes("remember")) {
      if (lowerCommand.includes("save") || lowerCommand.includes("add")) {
        responseText = "I can help you save notes! Use the utilities panel below to add your note."
        addConfirmation("Note saving guidance provided")
      } else {
        responseText = "Your notes are available in the utilities panel. You can add, view, and delete notes there."
        addConfirmation("Note access guidance provided")
      }
    } else if (lowerCommand.includes("calculate") || lowerCommand.includes("math")) {
      responseText =
        "I can help you with calculations! Use the calculator in the utilities panel or tell me what to calculate."
      addConfirmation("Calculator guidance provided")
    } else if (lowerCommand.includes("location") || lowerCommand.includes("where am i")) {
      responseText = "I can get your current location! Check the utilities panel and click on the location button."
      addConfirmation("Location service guidance provided")
    } else if (
      lowerCommand.includes("message") ||
      lowerCommand.includes("whatsapp") ||
      lowerCommand.includes("telegram") ||
      lowerCommand.includes("email")
    ) {
      if (lowerCommand.includes("whatsapp")) {
        responseText = "I can help you send a WhatsApp message! Use the messaging center below to compose your message."
        addConfirmation("WhatsApp messaging guidance provided")
      } else if (lowerCommand.includes("telegram")) {
        responseText = "I can help you send a Telegram message! Use the messaging center below to compose your message."
        addConfirmation("Telegram messaging guidance provided")
      } else if (lowerCommand.includes("email")) {
        responseText = "I can help you send an email! Use the messaging center below to compose your message."
        addConfirmation("Email messaging guidance provided")
      } else {
        responseText =
          "I can help you compose messages for WhatsApp, Telegram, or Email. Check the messaging center below!"
        addConfirmation("Messaging guidance provided")
      }
    } else if (
      lowerCommand.includes("wifi") ||
      lowerCommand.includes("torch") ||
      lowerCommand.includes("volume") ||
      lowerCommand.includes("brightness") ||
      lowerCommand.includes("vibrate") ||
      lowerCommand.includes("battery")
    ) {
      if (lowerCommand.includes("wifi")) {
        if (lowerCommand.includes("on") || lowerCommand.includes("enable")) {
          responseText = "Enabling Wi-Fi through phone controls."
          addConfirmation("Wi-Fi enable command processed")
        } else if (lowerCommand.includes("off") || lowerCommand.includes("disable")) {
          responseText = "Disabling Wi-Fi through phone controls."
          addConfirmation("Wi-Fi disable command processed")
        } else {
          responseText = "Wi-Fi control is available in the phone controls section below."
          addConfirmation("Wi-Fi control guidance provided")
        }
      } else if (lowerCommand.includes("torch") || lowerCommand.includes("flashlight")) {
        if (lowerCommand.includes("on") || lowerCommand.includes("enable")) {
          responseText = "Turning on the torch through phone controls."
          addConfirmation("Torch enable command processed")
        } else if (lowerCommand.includes("off") || lowerCommand.includes("disable")) {
          responseText = "Turning off the torch through phone controls."
          addConfirmation("Torch disable command processed")
        } else {
          responseText = "Torch control is available in the phone controls section below."
          addConfirmation("Torch control guidance provided")
        }
      } else if (lowerCommand.includes("volume")) {
        if (lowerCommand.includes("up") || lowerCommand.includes("increase")) {
          responseText = "Increasing volume through phone controls."
          addConfirmation("Volume increase command processed")
        } else if (lowerCommand.includes("down") || lowerCommand.includes("decrease")) {
          responseText = "Decreasing volume through phone controls."
          addConfirmation("Volume decrease command processed")
        } else {
          responseText = "Volume control is available in the phone controls section below."
          addConfirmation("Volume control guidance provided")
        }
      } else if (lowerCommand.includes("brightness")) {
        responseText = "Brightness control is available in the phone controls section below."
        addConfirmation("Brightness control guidance provided")
      } else if (lowerCommand.includes("vibrate")) {
        responseText = "Triggering vibration through phone controls."
        addConfirmation("Vibration command processed")
      } else if (lowerCommand.includes("battery")) {
        responseText = "Battery status is displayed in the phone controls section below."
        addConfirmation("Battery status guidance provided")
      } else {
        responseText = "Phone control features are now available! Check the phone controls section below."
        addConfirmation("Phone controls guidance provided")
      }
    } else {
      responseText =
        "I heard you say: " + command + ". I'm processing your request and learning to handle more commands."
      addConfirmation("General command processed", command)
    }

    setResponse(responseText)

    if (voiceEnabled && synthRef.current && ttsSupported) {
      speak(responseText)
    }

    setVoiceWaveActive(false)
    setIsProcessing(false)
  }

  const generateCodeFromVoice = async (codeRequest: string) => {
    const confirmationId = addConfirmation("Generating code", codeRequest)

    try {
      const response = await fetch("/api/generate-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: codeRequest }),
      })

      const data = await response.json()

      if (response.ok) {
        setGeneratedCode(data.code)
        setCodeLanguage(data.language || "javascript")
        setResponse(`Code generated successfully! Check the preview below.`)
        addConfirmation("Code generation successful", "Check code preview section")
      } else {
        setResponse(`Sorry, I couldn't generate the code: ${data.error}`)
        if ((window as any).jarvisConfirmation) {
          ;(window as any).jarvisConfirmation.error(confirmationId, data.error)
        }
      }
    } catch (error) {
      setResponse("There was an error generating the code. Please try again.")
      if ((window as any).jarvisConfirmation) {
        ;(window as any).jarvisConfirmation.error(confirmationId, "Network error")
      }
    }
  }

  const speak = (text: string) => {
    if (synthRef.current && voiceEnabled && ttsSupported) {
      try {
        synthRef.current.cancel()
        setVoiceWaveActive(true)

        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 0.9
        utterance.pitch = 1.1
        utterance.volume = 0.8
        utterance.lang = currentLanguage === "hi" ? "hi-IN" : "en-US"

        utterance.onstart = () => {
          setIsSpeaking(true)
          setVoiceWaveActive(true)
        }
        utterance.onend = () => {
          setIsSpeaking(false)
          setVoiceWaveActive(false)
        }
        utterance.onerror = (error) => {
          console.log("[v0] TTS error:", error)
          setIsSpeaking(false)
          setVoiceWaveActive(false)
        }

        synthRef.current.speak(utterance)
      } catch (error) {
        console.log("[v0] Speech synthesis error:", error)
        setIsSpeaking(false)
        setVoiceWaveActive(false)
      }
    } else if (!ttsSupported && voiceEnabled) {
      setResponse(text + " (Voice output not available in this environment)")
    }
  }

  const handleAppLaunch = (appName: string, appUrl: string) => {
    const responses = getResponse("", currentLanguage)
    const responseText = responses.appLaunched(appName)
    setResponse(responseText)

    if (voiceEnabled && synthRef.current && ttsSupported) {
      speak(responseText)
    }

    addConfirmation(`${appName} app launched`, "Check your device")
  }

  const handleMessageSent = (platform: string, message: string) => {
    const responseText = `Message prepared for ${platform}! The app should open automatically.`
    setResponse(responseText)

    if (voiceEnabled && synthRef.current && ttsSupported) {
      speak(responseText)
    }

    addConfirmation(`${platform} message prepared`, "App should open automatically")
  }

  const handlePhoneControl = (action: string, status: boolean) => {
    const responseText = `${action.charAt(0).toUpperCase() + action.slice(1)} control executed successfully.`
    setResponse(responseText)

    if (voiceEnabled && synthRef.current && ttsSupported) {
      speak(responseText)
    }

    addConfirmation(`${action} control executed`, status ? "Enabled" : "Disabled")
  }

  const handleUtilityAction = (action: string, data?: any) => {
    let responseText = ""

    switch (action) {
      case "time_check":
        responseText = `The current time is ${data.toLocaleTimeString()}.`
        addConfirmation("Time check completed", data.toLocaleTimeString())
        break
      case "date_check":
        responseText = `Today is ${data.toLocaleDateString()}.`
        addConfirmation("Date check completed", data.toLocaleDateString())
        break
      case "weather_check":
        responseText = `The weather is ${data.temperature} and ${data.condition.toLowerCase()}.`
        addConfirmation("Weather check completed", `${data.temperature} ${data.condition}`)
        break
      case "location_check":
        responseText = `Your location coordinates are ${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)}.`
        addConfirmation("Location retrieved", `${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)}`)
        break
      case "location_error":
        responseText = `Unable to get location: ${data}`
        addConfirmation("Location error", data)
        break
      case "note_saved":
        responseText = `Note saved successfully: "${data.content}"`
        addConfirmation("Note saved", data.content.substring(0, 30) + "...")
        break
      case "note_deleted":
        responseText = "Note deleted successfully."
        addConfirmation("Note deleted")
        break
      case "calculation":
        responseText = `${data.input} equals ${data.result}.`
        addConfirmation("Calculation completed", `${data.input} = ${data.result}`)
        break
      case "calculation_error":
        responseText = `Invalid calculation: ${data}`
        addConfirmation("Calculation error", data)
        break
      case "app_launched":
        responseText = `Opening ${data} app.`
        addConfirmation(`${data} app launched`)
        break
      default:
        responseText = "Utility action completed."
        addConfirmation("Utility action completed")
    }

    setResponse(responseText)

    if (voiceEnabled && synthRef.current && ttsSupported) {
      speak(responseText)
    }
  }

  useEffect(() => {
    if (voiceEnabled && synthRef.current && ttsSupported) {
      setTimeout(() => {
        const responses = getResponse("", currentLanguage)
        speak(responses.ready)
        addConfirmation("J.A.R.V.I.S initialized", "Ready to assist")
      }, 1000)
    }
  }, [voiceEnabled, currentLanguage, ttsSupported])

  const extractAppName = (command: string): string => {
    const appMappings: { [key: string]: string } = {
      camera: "Camera",
      gallery: "Gallery",
      photos: "Gallery",
      settings: "Settings",
      browser: "Browser",
      chrome: "Browser",
      maps: "Maps",
      phone: "Phone",
      messages: "Messages",
      music: "Music",
      calculator: "Calculator",
      files: "Files",
      calendar: "Calendar",
      clock: "Clock",
    }

    for (const [key, value] of Object.entries(appMappings)) {
      if (command.includes(key)) {
        return value
      }
    }
    return ""
  }

  const getResponse = (command: string, lang: "en" | "hi" = currentLanguage) => {
    const responses = {
      en: {
        greeting: "Hello! I'm J.A.R.V.I.S, your personal AI assistant. How can I help you today?",
        time: (time: string) => `The current time is ${time}`,
        date: (date: string) => `Today is ${date}`,
        weather: "The weather is 22 degrees Celsius and partly cloudy. Check the utilities panel for more details.",
        codeGenerated: "Code generated successfully! Check the preview below.",
        appLaunched: (app: string) => `Opening ${app} app for you.`,
        listening: "I'm listening. How can I assist you?",
        ready: "J.A.R.V.I.S is ready to assist you.",
      },
      hi: {
        greeting: "Namaste! Main J.A.R.V.I.S hun, aapka personal AI assistant. Kaise madad kar sakta hun?",
        time: (time: string) => `Abhi ka samay hai ${time}`,
        date: (date: string) => `Aaj ki date hai ${date}`,
        weather: "Mausam 22 degree Celsius hai aur thoda cloudy hai. Details ke liye utilities panel check kariye.",
        codeGenerated: "Code successfully generate ho gaya! Neeche preview dekh sakte hain.",
        appLaunched: (app: string) => `${app} app open kar raha hun aapke liye.`,
        listening: "Main sun raha hun. Kya madad chahiye?",
        ready: "J.A.R.V.I.S ready hai aapki madad ke liye.",
      },
    }
    return responses[lang]
  }

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (error) {
          console.log("[v0] Error stopping recognition:", error)
        }
      }
      setIsListening(false)
      setPulseAnimation(false)
      addConfirmation("Voice listening stopped")
    } else {
      if (!speechSupported) {
        setResponse(
          "Speech recognition not supported in this browser. Try using Chrome, Edge, or Safari for voice features.",
        )
        addConfirmation("Voice recognition unavailable", "Browser not supported")
        return
      }

      if (recognitionRef.current) {
        try {
          recognitionRef.current.start()
          setIsListening(true)
          setPulseAnimation(true)
          setTranscript("")
          addConfirmation("Voice listening started")
        } catch (error) {
          console.log("[v0] Error starting recognition:", error)
          setResponse("Unable to start voice recognition. Please check microphone permissions.")
          addConfirmation("Voice recognition failed", "Check permissions")
        }
      }
    }
  }

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled)
    if (isSpeaking && synthRef.current && ttsSupported) {
      try {
        synthRef.current.cancel()
        setIsSpeaking(false)
      } catch (error) {
        console.log("[v0] Error canceling speech:", error)
      }
    }
    addConfirmation(`Voice output ${!voiceEnabled ? "enabled" : "disabled"}`)
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <header className="border-b border-border bg-card/50 backdrop-blur-sm relative z-10 jarvis-hologram">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center jarvis-glow">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-pulse">
              J.A.R.V.I.S
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentLanguage(currentLanguage === "en" ? "hi" : "en")}
              className="jarvis-button-glow border-primary/30 hover:border-primary/60"
            >
              {currentLanguage === "en" ? "EN" : "हि"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleVoice}
              className={`jarvis-button-glow ${voiceEnabled ? "bg-accent/20 border-accent/40" : "border-muted-foreground/30"}`}
              disabled={!ttsSupported}
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsHologramMode(!isHologramMode)}
              className={`jarvis-button-glow ${isHologramMode ? "bg-primary/20 border-primary/40" : "border-muted-foreground/30"}`}
            >
              <Activity className="w-4 h-4" />
            </Button>
            <Badge
              variant="secondary"
              className={`bg-accent text-accent-foreground ${isProcessing ? "animate-pulse" : ""}`}
            >
              <Activity className={`w-3 h-3 mr-1 ${voiceWaveActive ? "jarvis-voice-wave" : ""}`} />
              {isProcessing ? "Processing" : isSpeaking ? "Speaking" : "Online"}
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-6 relative z-10">
        <aside className="lg:col-span-1 space-y-4">
          <Card className={`border-primary/20 jarvis-card-hover ${isHologramMode ? "jarvis-hologram" : ""}`}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <span className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse"></span>
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent jarvis-button-glow hover:bg-primary/10"
                size="sm"
                onClick={() => setActivePanel(activePanel === "settings" ? null : "settings")}
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent jarvis-button-glow hover:bg-accent/10"
                size="sm"
                onClick={() => setActivePanel(activePanel === "calendar" ? null : "calendar")}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Calendar
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent jarvis-button-glow hover:bg-primary/10"
                size="sm"
                onClick={() => setActivePanel(activePanel === "music" ? null : "music")}
              >
                <Music className="w-4 h-4 mr-2" />
                Music
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent jarvis-button-glow hover:bg-accent/10"
                size="sm"
                onClick={() => setActivePanel(activePanel === "notifications" ? null : "notifications")}
              >
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </Button>
            </CardContent>
          </Card>

          <Card className={`border-accent/20 jarvis-card-hover ${isHologramMode ? "jarvis-hologram" : ""}`}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <span className="w-2 h-2 bg-accent rounded-full mr-2 animate-pulse"></span>
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">CPU Usage</span>
                <span className="text-sm font-medium">23%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-primary to-accent h-2 rounded-full w-[23%] transition-all duration-1000 jarvis-data-stream relative"></div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Memory</span>
                <span className="text-sm font-medium">67%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-accent to-primary h-2 rounded-full w-[67%] transition-all duration-1000 jarvis-data-stream relative"></div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Speech</span>
                <Badge
                  variant={speechSupported ? "default" : "outline"}
                  className={`text-xs ${speechSupported ? "jarvis-glow" : ""}`}
                >
                  {speechSupported ? "Ready" : "Limited"}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Voice</span>
                <Badge
                  variant={ttsSupported && voiceEnabled ? "default" : "outline"}
                  className={`text-xs ${ttsSupported && voiceEnabled ? "jarvis-glow" : ""}`}
                >
                  {ttsSupported ? (voiceEnabled ? "Enabled" : "Disabled") : "Limited"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </aside>

        <main className="lg:col-span-3 space-y-6">
          <Card
            className={`border-primary/30 bg-gradient-to-br from-card to-primary/5 jarvis-card-hover ${isHologramMode ? "jarvis-hologram" : ""}`}
          >
            <CardHeader className="text-center">
              <CardTitle className="text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Voice Interface
              </CardTitle>
              <CardDescription>
                {speechSupported
                  ? `Click the microphone to start voice interaction. Voice responses are ${voiceEnabled && ttsSupported ? "enabled" : "limited"}.`
                  : "Voice features are limited in this environment. You can still use all text-based commands."}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="relative inline-block">
                <Button
                  onClick={toggleListening}
                  size="lg"
                  disabled={isProcessing || !speechSupported}
                  className={`w-20 h-20 rounded-full transition-all duration-300 jarvis-button-glow ${
                    isListening
                      ? "bg-accent hover:bg-accent/90 shadow-lg shadow-accent/50 jarvis-glow"
                      : isProcessing
                        ? "bg-muted animate-pulse"
                        : speechSupported
                          ? "bg-primary hover:bg-primary/90 jarvis-glow"
                          : "bg-muted"
                  } ${pulseAnimation ? "animate-pulse" : ""}`}
                >
                  {isProcessing ? (
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : isListening ? (
                    <MicOff className="w-8 h-8" />
                  ) : (
                    <Mic className="w-8 h-8" />
                  )}
                </Button>
                {isListening && (
                  <>
                    <div className="absolute inset-0 rounded-full border-2 border-accent animate-ping"></div>
                    <div className="absolute inset-0 rounded-full border border-accent/50 animate-pulse delay-300"></div>
                  </>
                )}
                {isSpeaking && (
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center jarvis-glow">
                    <Volume2
                      className={`w-3 h-3 text-white ${voiceWaveActive ? "jarvis-voice-wave" : "animate-pulse"}`}
                    />
                  </div>
                )}
              </div>

              {transcript && (
                <div
                  className={`bg-muted/50 rounded-lg p-4 max-w-md mx-auto border border-primary/20 ${isHologramMode ? "jarvis-hologram" : ""}`}
                >
                  <p className="text-sm text-muted-foreground mb-1">You said:</p>
                  <p className="font-medium">{transcript}</p>
                </div>
              )}

              <div
                className={`bg-primary/10 rounded-lg p-4 max-w-md mx-auto border border-primary/20 jarvis-data-stream relative ${isHologramMode ? "jarvis-hologram" : ""}`}
              >
                <p className="text-sm text-muted-foreground mb-1">J.A.R.V.I.S:</p>
                <p className="font-medium text-primary">{response}</p>
              </div>

              <div className="text-xs text-muted-foreground max-w-md mx-auto">
                <p className="mb-2 font-medium">Try saying:</p>
                <div className="grid grid-cols-2 gap-2 text-left">
                  <span className="p-2 bg-primary/5 rounded border border-primary/20 hover:bg-primary/10 transition-colors">
                    "What time is it?"
                  </span>
                  <span className="p-2 bg-accent/5 rounded border border-accent/20 hover:bg-accent/10 transition-colors">
                    "Save a note"
                  </span>
                  <span className="p-2 bg-primary/5 rounded border border-primary/20 hover:bg-primary/10 transition-colors">
                    "Open camera"
                  </span>
                  <span className="p-2 bg-accent/5 rounded border border-accent/20 hover:bg-accent/10 transition-colors">
                    "Calculate 2 + 2"
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="jarvis-card-hover">
            <AppLauncher onAppLaunch={handleAppLaunch} />
          </div>

          {generatedCode && (
            <div className="jarvis-card-hover">
              <CodePreview
                code={generatedCode}
                language={codeLanguage}
                onExecute={() => addConfirmation("Code executed", "Check result tab")}
              />
            </div>
          )}

          <div className="jarvis-card-hover">
            <UtilitiesPanel onUtilityAction={handleUtilityAction} />
          </div>
          <div className="jarvis-card-hover">
            <PhoneControls onControlAction={handlePhoneControl} />
          </div>
          <div className="jarvis-card-hover">
            <CodeGenerator />
          </div>
          <div className="jarvis-card-hover">
            <MessagingCenter onMessageSent={handleMessageSent} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card
              className={`border-accent/20 jarvis-card-hover ${isHologramMode ? "jarvis-hologram" : ""} ${activePanel === "calendar" ? "ring-2 ring-accent" : ""}`}
            >
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-accent" />
                  <span>Today's Schedule</span>
                  <span className="w-2 h-2 bg-accent rounded-full animate-pulse ml-auto"></span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded hover:bg-accent/10 transition-colors cursor-pointer jarvis-button-glow">
                    <span className="text-sm">Team Meeting</span>
                    <Badge variant="outline" className="border-accent/30">
                      10:00 AM
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded hover:bg-primary/10 transition-colors cursor-pointer jarvis-button-glow">
                    <span className="text-sm">Project Review</span>
                    <Badge variant="outline" className="border-primary/30">
                      2:00 PM
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded hover:bg-accent/10 transition-colors cursor-pointer jarvis-button-glow">
                    <span className="text-sm">Client Call</span>
                    <Badge variant="outline" className="border-accent/30">
                      4:30 PM
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className={`border-primary/20 jarvis-card-hover ${isHologramMode ? "jarvis-hologram" : ""} ${activePanel === "notifications" ? "ring-2 ring-primary" : ""}`}
            >
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5 text-primary" />
                  <span>Notifications</span>
                  <span className="w-2 h-2 bg-primary rounded-full animate-pulse ml-auto"></span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-2 bg-accent/10 rounded border-l-2 border-accent hover:bg-accent/20 transition-colors cursor-pointer jarvis-button-glow">
                    <p className="text-sm font-medium">System Update Available</p>
                    <p className="text-xs text-muted-foreground">Version 2.1.0 ready to install</p>
                  </div>
                  <div className="p-2 bg-primary/10 rounded border-l-2 border-primary hover:bg-primary/20 transition-colors cursor-pointer jarvis-button-glow">
                    <p className="text-sm font-medium">New Message Received</p>
                    <p className="text-xs text-muted-foreground">From: Tony Stark</p>
                  </div>
                  <div className="p-2 bg-muted/50 rounded border-l-2 border-muted-foreground hover:bg-muted transition-colors cursor-pointer jarvis-button-glow">
                    <p className="text-sm font-medium">Weather Alert</p>
                    <p className="text-xs text-muted-foreground">Rain expected this afternoon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <ConfirmationSystem />
    </div>
  )
}
