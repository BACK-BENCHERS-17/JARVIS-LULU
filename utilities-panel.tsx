"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Calendar, StickyNote, Calculator, MapPin, CloudSun, Trash2, Save } from "lucide-react"

interface UtilitiesPanelProps {
  onUtilityAction?: (action: string, data?: any) => void
}

interface Note {
  id: string
  content: string
  timestamp: Date
}

export function UtilitiesPanel({ onUtilityAction }: UtilitiesPanelProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [notes, setNotes] = useState<Note[]>([])
  const [newNote, setNewNote] = useState("")
  const [calculatorInput, setCalculatorInput] = useState("")
  const [calculatorResult, setCalculatorResult] = useState("")

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Load notes from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem("jarvis-notes")
    if (savedNotes) {
      try {
        const parsedNotes = JSON.parse(savedNotes).map((note: any) => ({
          ...note,
          timestamp: new Date(note.timestamp),
        }))
        setNotes(parsedNotes)
      } catch (error) {
        console.error("Failed to load notes:", error)
      }
    }
  }, [])

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    localStorage.setItem("jarvis-notes", JSON.stringify(notes))
  }, [notes])

  const addNote = () => {
    if (!newNote.trim()) return

    const note: Note = {
      id: Date.now().toString(),
      content: newNote.trim(),
      timestamp: new Date(),
    }

    setNotes((prev) => [note, ...prev])
    setNewNote("")
    onUtilityAction?.("note_saved", note)
  }

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id))
    onUtilityAction?.("note_deleted", id)
  }

  const calculate = () => {
    if (!calculatorInput.trim()) return

    try {
      // Basic calculator - only allow safe mathematical operations
      const sanitizedInput = calculatorInput.replace(/[^0-9+\-*/().\s]/g, "")
      const result = Function(`"use strict"; return (${sanitizedInput})`)()
      setCalculatorResult(result.toString())
      onUtilityAction?.("calculation", { input: calculatorInput, result })
    } catch (error) {
      setCalculatorResult("Error")
      onUtilityAction?.("calculation_error", calculatorInput)
    }
  }

  const getWeatherInfo = () => {
    // In a real implementation, this would call a weather API
    const weatherInfo = {
      location: "Current Location",
      temperature: "22°C",
      condition: "Partly Cloudy",
      humidity: "65%",
    }
    onUtilityAction?.("weather_check", weatherInfo)
    return weatherInfo
  }

  const openApp = (appName: string) => {
    // In Android with Termux, this would use termux-open or am start commands
    const appCommands = {
      camera: "am start -a android.media.action.IMAGE_CAPTURE",
      gallery: "am start -a android.intent.action.VIEW -t image/*",
      settings: "am start -a android.settings.SETTINGS",
      browser: "am start -a android.intent.action.VIEW -d https://google.com",
      maps: "am start -a android.intent.action.VIEW geo:0,0?q=current+location",
    }

    console.log(`[v0] Opening ${appName}: ${appCommands[appName as keyof typeof appCommands] || "Unknown app"}`)
    onUtilityAction?.("app_launched", appName)
  }

  const utilities = [
    {
      id: "time",
      name: "Current Time",
      icon: Clock,
      value: currentTime.toLocaleTimeString(),
      action: () => onUtilityAction?.("time_check", currentTime),
    },
    {
      id: "date",
      name: "Current Date",
      icon: Calendar,
      value: currentTime.toLocaleDateString(),
      action: () => onUtilityAction?.("date_check", currentTime),
    },
    {
      id: "weather",
      name: "Weather",
      icon: CloudSun,
      value: "22°C Partly Cloudy",
      action: getWeatherInfo,
    },
    {
      id: "location",
      name: "Location",
      icon: MapPin,
      value: "Get Current Location",
      action: () => {
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const location = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              }
              onUtilityAction?.("location_check", location)
            },
            (error) => {
              onUtilityAction?.("location_error", error.message)
            },
          )
        }
      },
    },
  ]

  const quickApps = [
    { name: "Camera", id: "camera", icon: "📷" },
    { name: "Gallery", id: "gallery", icon: "🖼️" },
    { name: "Settings", id: "settings", icon: "⚙️" },
    { name: "Browser", id: "browser", icon: "🌐" },
    { name: "Maps", id: "maps", icon: "🗺️" },
  ]

  return (
    <Card className="border-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <StickyNote className="w-5 h-5 text-accent" />
          <span>Utilities & Commands</span>
        </CardTitle>
        <CardDescription>Quick access to system utilities and helpful commands</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {utilities.map((utility) => (
            <Button
              key={utility.id}
              variant="outline"
              onClick={utility.action}
              className="flex flex-col items-center space-y-2 h-auto py-3 bg-muted/20 hover:bg-accent/10"
            >
              <utility.icon className="w-4 h-4 text-accent" />
              <div className="text-center">
                <p className="text-xs font-medium">{utility.name}</p>
                <p className="text-xs text-muted-foreground">{utility.value}</p>
              </div>
            </Button>
          ))}
        </div>

        {/* Calculator */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Quick Calculator</h4>
          <div className="flex space-x-2">
            <input
              type="text"
              value={calculatorInput}
              onChange={(e) => setCalculatorInput(e.target.value)}
              placeholder="Enter calculation (e.g., 2 + 2 * 3)"
              className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              onKeyPress={(e) => e.key === "Enter" && calculate()}
            />
            <Button onClick={calculate} size="sm" disabled={!calculatorInput.trim()}>
              <Calculator className="w-4 h-4" />
            </Button>
          </div>
          {calculatorResult && (
            <div className="p-2 bg-primary/10 rounded border border-primary/20">
              <p className="text-sm">
                <span className="text-muted-foreground">Result: </span>
                <span className="font-medium text-primary">{calculatorResult}</span>
              </p>
            </div>
          )}
        </div>

        {/* Quick Notes */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Quick Notes</h4>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a quick note..."
              className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              onKeyPress={(e) => e.key === "Enter" && addNote()}
            />
            <Button onClick={addNote} size="sm" disabled={!newNote.trim()}>
              <Save className="w-4 h-4" />
            </Button>
          </div>

          {notes.length > 0 && (
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {notes.slice(0, 5).map((note) => (
                <div key={note.id} className="flex items-start justify-between p-2 bg-muted/30 rounded text-sm">
                  <div className="flex-1 min-w-0">
                    <p className="truncate">{note.content}</p>
                    <p className="text-xs text-muted-foreground">{note.timestamp.toLocaleString()}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => deleteNote(note.id)} className="h-6 w-6 p-0 ml-2">
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </Button>
                </div>
              ))}
              {notes.length > 5 && (
                <p className="text-xs text-muted-foreground text-center">+{notes.length - 5} more notes saved</p>
              )}
            </div>
          )}
        </div>

        {/* Quick App Launcher */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Quick App Launcher</h4>
          <div className="grid grid-cols-5 gap-2">
            {quickApps.map((app) => (
              <Button
                key={app.id}
                variant="outline"
                onClick={() => openApp(app.id)}
                className="flex flex-col items-center space-y-1 h-auto py-2 text-xs"
              >
                <span className="text-lg">{app.icon}</span>
                <span>{app.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Termux Commands Reference */}
        <div className="text-xs text-muted-foreground bg-muted/20 p-3 rounded-lg">
          <p className="font-medium mb-2">Available Termux Commands:</p>
          <div className="space-y-1">
            <p>
              • Time/Date: <code>date</code>
            </p>
            <p>
              • Location: <code>termux-location</code>
            </p>
            <p>
              • Open Apps: <code>am start [intent]</code>
            </p>
            <p>• Calculator: Built-in JavaScript calculator</p>
            <p>• Notes: Saved to local storage</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
