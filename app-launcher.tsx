"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Camera,
  ImageIcon,
  Settings,
  Globe,
  MapPin,
  Phone,
  MessageSquare,
  Music,
  Calculator,
  FileText,
  Calendar,
  Clock,
  Smartphone,
} from "lucide-react"

interface AppLauncherProps {
  onAppLaunch: (appName: string, appUrl: string) => void
}

export function AppLauncher({ onAppLaunch }: AppLauncherProps) {
  const [recentApps, setRecentApps] = useState<string[]>([])

  const apps = [
    {
      name: "Camera",
      icon: Camera,
      url: "intent://com.android.camera#Intent;scheme=android-app;end",
      category: "Media",
    },
    {
      name: "Gallery",
      icon: ImageIcon,
      url: "intent://com.android.gallery3d#Intent;scheme=android-app;end",
      category: "Media",
    },
    {
      name: "Settings",
      icon: Settings,
      url: "intent://com.android.settings#Intent;scheme=android-app;end",
      category: "System",
    },
    {
      name: "Browser",
      icon: Globe,
      url: "intent://com.android.browser#Intent;scheme=android-app;end",
      category: "Internet",
    },
    {
      name: "Maps",
      icon: MapPin,
      url: "intent://com.google.android.apps.maps#Intent;scheme=android-app;end",
      category: "Navigation",
    },
    { name: "Phone", icon: Phone, url: "tel:", category: "Communication" },
    { name: "Messages", icon: MessageSquare, url: "sms:", category: "Communication" },
    { name: "Music", icon: Music, url: "intent://com.android.music#Intent;scheme=android-app;end", category: "Media" },
    {
      name: "Calculator",
      icon: Calculator,
      url: "intent://com.android.calculator2#Intent;scheme=android-app;end",
      category: "Utilities",
    },
    {
      name: "Files",
      icon: FileText,
      url: "intent://com.android.documentsui#Intent;scheme=android-app;end",
      category: "Utilities",
    },
    {
      name: "Calendar",
      icon: Calendar,
      url: "intent://com.android.calendar#Intent;scheme=android-app;end",
      category: "Productivity",
    },
    {
      name: "Clock",
      icon: Clock,
      url: "intent://com.android.deskclock#Intent;scheme=android-app;end",
      category: "Utilities",
    },
  ]

  const categories = [...new Set(apps.map((app) => app.category))]

  const handleAppLaunch = (app: (typeof apps)[0]) => {
    // Add to recent apps
    setRecentApps((prev) => {
      const updated = [app.name, ...prev.filter((name) => name !== app.name)].slice(0, 4)
      return updated
    })

    // Try to open the app
    try {
      if (app.url.startsWith("intent://")) {
        // For Android intent URLs, try to open directly
        window.location.href = app.url
      } else {
        // For other URLs, open in new tab/window
        window.open(app.url, "_blank")
      }

      onAppLaunch(app.name, app.url)
    } catch (error) {
      console.log("[v0] App launch error:", error)
      // Fallback: provide Termux command
      const termuxCommand = `am start -n ${
        app.url.includes("camera")
          ? "com.android.camera/.Camera"
          : app.url.includes("gallery")
            ? "com.android.gallery3d/.app.GalleryActivity"
            : app.url.includes("settings")
              ? "com.android.settings/.Settings"
              : app.url.includes("browser")
                ? "com.android.browser/.BrowserActivity"
                : "com.android.launcher/.Launcher"
      }`

      onAppLaunch(app.name, `Termux command: ${termuxCommand}`)
    }
  }

  return (
    <Card className="border-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Smartphone className="w-5 h-5 text-accent" />
          <span>App Launcher</span>
        </CardTitle>
        <CardDescription>Launch Android apps directly or get Termux commands</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recent Apps */}
        {recentApps.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 text-muted-foreground">Recent Apps</h4>
            <div className="flex flex-wrap gap-2">
              {recentApps.map((appName) => {
                const app = apps.find((a) => a.name === appName)
                if (!app) return null
                const IconComponent = app.icon
                return (
                  <Button
                    key={appName}
                    variant="outline"
                    size="sm"
                    onClick={() => handleAppLaunch(app)}
                    className="flex items-center space-x-1"
                  >
                    <IconComponent className="w-3 h-3" />
                    <span>{appName}</span>
                  </Button>
                )
              })}
            </div>
          </div>
        )}

        {/* Apps by Category */}
        {categories.map((category) => (
          <div key={category}>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-muted-foreground">{category}</h4>
              <Badge variant="outline" className="text-xs">
                {apps.filter((app) => app.category === category).length}
              </Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {apps
                .filter((app) => app.category === category)
                .map((app) => {
                  const IconComponent = app.icon
                  return (
                    <Button
                      key={app.name}
                      variant="outline"
                      size="sm"
                      onClick={() => handleAppLaunch(app)}
                      className="flex items-center space-x-2 justify-start h-auto p-3"
                    >
                      <IconComponent className="w-4 h-4 text-accent" />
                      <span className="text-xs">{app.name}</span>
                    </Button>
                  )
                })}
            </div>
          </div>
        ))}

        <div className="text-xs text-muted-foreground p-2 bg-muted/30 rounded">
          <p className="font-medium mb-1">For Termux users:</p>
          <p>
            Use <code className="bg-muted px-1 rounded">am start -n [package]/[activity]</code> to launch apps
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
