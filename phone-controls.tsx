"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Wifi,
  WifiOff,
  Flashlight,
  FlashlightOff,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Battery,
  Vibrate,
  Smartphone,
  Power,
  PowerOff,
} from "lucide-react"

interface PhoneControlsProps {
  onControlAction?: (action: string, status: boolean) => void
}

export function PhoneControls({ onControlAction }: PhoneControlsProps) {
  const [wifiEnabled, setWifiEnabled] = useState(true)
  const [torchEnabled, setTorchEnabled] = useState(false)
  const [volumeLevel, setVolumeLevel] = useState(70)
  const [brightnessLevel, setBrightnessLevel] = useState(80)
  const [screenOn, setScreenOn] = useState(true)
  const [batteryLevel, setBatteryLevel] = useState(85)
  const [isCharging, setIsCharging] = useState(false)
  const [vibrationEnabled, setVibrationEnabled] = useState(true)

  // Simulate battery status updates
  useEffect(() => {
    const interval = setInterval(() => {
      if ("getBattery" in navigator) {
        ;(navigator as any)
          .getBattery()
          .then((battery: any) => {
            setBatteryLevel(Math.round(battery.level * 100))
            setIsCharging(battery.charging)
          })
          .catch(() => {
            // Fallback to simulated battery level
            setBatteryLevel((prev) => Math.max(20, prev + (Math.random() > 0.5 ? 1 : -1)))
          })
      }
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const toggleWifi = () => {
    const newState = !wifiEnabled
    setWifiEnabled(newState)
    onControlAction?.("wifi", newState)

    // In a real Android app with Termux, this would execute:
    // termux-wifi-enable or termux-wifi-disable
    console.log(`[v0] WiFi ${newState ? "enabled" : "disabled"}`)
  }

  const toggleTorch = () => {
    const newState = !torchEnabled
    setTorchEnabled(newState)
    onControlAction?.("torch", newState)

    // In a real Android app with Termux, this would execute:
    // termux-torch on or termux-torch off
    console.log(`[v0] Torch ${newState ? "enabled" : "disabled"}`)
  }

  const adjustVolume = (delta: number) => {
    const newLevel = Math.max(0, Math.min(100, volumeLevel + delta))
    setVolumeLevel(newLevel)
    onControlAction?.("volume", newLevel > 0)

    // In a real Android app with Termux, this would execute:
    // termux-volume music [level]
    console.log(`[v0] Volume set to ${newLevel}%`)
  }

  const adjustBrightness = (delta: number) => {
    const newLevel = Math.max(10, Math.min(100, brightnessLevel + delta))
    setBrightnessLevel(newLevel)
    onControlAction?.("brightness", true)

    // In a real Android app with Termux, this would execute:
    // termux-brightness [level]
    console.log(`[v0] Brightness set to ${newLevel}%`)
  }

  const toggleScreen = () => {
    const newState = !screenOn
    setScreenOn(newState)
    onControlAction?.("screen", newState)

    // In a real Android app with Termux, this would execute:
    // termux-wake-lock or termux-wake-unlock
    console.log(`[v0] Screen ${newState ? "on" : "off"}`)
  }

  const triggerVibration = () => {
    if (vibrationEnabled && "vibrate" in navigator) {
      navigator.vibrate([200, 100, 200])
    }
    onControlAction?.("vibrate", true)

    // In a real Android app with Termux, this would execute:
    // termux-vibrate
    console.log(`[v0] Vibration triggered`)
  }

  const getBatteryColor = () => {
    if (isCharging) return "text-green-500"
    if (batteryLevel > 50) return "text-green-500"
    if (batteryLevel > 20) return "text-yellow-500"
    return "text-red-500"
  }

  const controls = [
    {
      id: "wifi",
      name: "Wi-Fi",
      icon: wifiEnabled ? Wifi : WifiOff,
      enabled: wifiEnabled,
      action: toggleWifi,
      color: wifiEnabled ? "bg-blue-500" : "bg-gray-500",
    },
    {
      id: "torch",
      name: "Torch",
      icon: torchEnabled ? Flashlight : FlashlightOff,
      enabled: torchEnabled,
      action: toggleTorch,
      color: torchEnabled ? "bg-yellow-500" : "bg-gray-500",
    },
    {
      id: "screen",
      name: "Screen",
      icon: screenOn ? Power : PowerOff,
      enabled: screenOn,
      action: toggleScreen,
      color: screenOn ? "bg-green-500" : "bg-gray-500",
    },
    {
      id: "vibrate",
      name: "Vibrate",
      icon: Vibrate,
      enabled: vibrationEnabled,
      action: triggerVibration,
      color: "bg-purple-500",
    },
  ]

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Smartphone className="w-5 h-5 text-primary" />
          <span>Phone Controls</span>
        </CardTitle>
        <CardDescription>Control your Android device settings via Termux</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Toggle Controls */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {controls.map((control) => (
            <Button
              key={control.id}
              variant="outline"
              onClick={control.action}
              className={`flex flex-col items-center space-y-2 h-auto py-3 ${
                control.enabled ? "bg-accent/10 border-accent" : ""
              }`}
            >
              <control.icon className={`w-5 h-5 ${control.enabled ? "text-accent" : "text-muted-foreground"}`} />
              <span className="text-xs">{control.name}</span>
            </Button>
          ))}
        </div>

        {/* Volume Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Volume</label>
            <Badge variant="outline">{volumeLevel}%</Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => adjustVolume(-10)}>
              <VolumeX className="w-3 h-3" />
            </Button>
            <div className="flex-1 bg-muted rounded-full h-2 relative">
              <div
                className="bg-accent h-2 rounded-full transition-all duration-200"
                style={{ width: `${volumeLevel}%` }}
              ></div>
            </div>
            <Button variant="outline" size="sm" onClick={() => adjustVolume(10)}>
              <Volume2 className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Brightness Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Brightness</label>
            <Badge variant="outline">{brightnessLevel}%</Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => adjustBrightness(-10)}>
              <Moon className="w-3 h-3" />
            </Button>
            <div className="flex-1 bg-muted rounded-full h-2 relative">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-200"
                style={{ width: `${brightnessLevel}%` }}
              ></div>
            </div>
            <Button variant="outline" size="sm" onClick={() => adjustBrightness(10)}>
              <Sun className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Battery Status */}
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center space-x-2">
            <Battery className={`w-5 h-5 ${getBatteryColor()}`} />
            <span className="text-sm font-medium">Battery</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={isCharging ? "default" : "outline"} className="text-xs">
              {isCharging ? "Charging" : "Not Charging"}
            </Badge>
            <span className={`text-sm font-medium ${getBatteryColor()}`}>{batteryLevel}%</span>
          </div>
        </div>

        {/* Termux Commands Info */}
        <div className="text-xs text-muted-foreground bg-muted/20 p-3 rounded-lg">
          <p className="font-medium mb-1">Termux Commands:</p>
          <div className="space-y-1">
            <p>
              • Wi-Fi: <code>termux-wifi-enable/disable</code>
            </p>
            <p>
              • Torch: <code>termux-torch on/off</code>
            </p>
            <p>
              • Volume: <code>termux-volume music [level]</code>
            </p>
            <p>
              • Brightness: <code>termux-brightness [level]</code>
            </p>
            <p>
              • Vibrate: <code>termux-vibrate</code>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
