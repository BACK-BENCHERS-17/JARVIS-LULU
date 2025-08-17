"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Mail, Send, Copy, ExternalLink } from "lucide-react"

interface MessagingCenterProps {
  onMessageSent?: (platform: string, message: string) => void
}

export function MessagingCenter({ onMessageSent }: MessagingCenterProps) {
  const [message, setMessage] = useState("")
  const [recipient, setRecipient] = useState("")
  const [selectedPlatform, setSelectedPlatform] = useState<"whatsapp" | "telegram" | "email">("whatsapp")
  const [generatedLinks, setGeneratedLinks] = useState<{ platform: string; url: string; copied: boolean }[]>([])

  const platforms = [
    { id: "whatsapp", name: "WhatsApp", icon: MessageSquare, color: "bg-green-500" },
    { id: "telegram", name: "Telegram", icon: Send, color: "bg-blue-500" },
    { id: "email", name: "Email", icon: Mail, color: "bg-red-500" },
  ]

  const generateMessageLink = (platform: string, recipient: string, message: string) => {
    let url = ""

    switch (platform) {
      case "whatsapp":
        // WhatsApp Web URL format
        const whatsappMessage = encodeURIComponent(message)
        const phoneNumber = recipient.replace(/\D/g, "") // Remove non-digits
        url = `https://wa.me/${phoneNumber}?text=${whatsappMessage}`
        break

      case "telegram":
        // Telegram URL format
        const telegramMessage = encodeURIComponent(message)
        const username = recipient.startsWith("@") ? recipient.slice(1) : recipient
        url = `https://t.me/${username}?text=${telegramMessage}`
        break

      case "email":
        // Email mailto format
        const emailSubject = encodeURIComponent("Message from J.A.R.V.I.S")
        const emailBody = encodeURIComponent(message)
        url = `mailto:${recipient}?subject=${emailSubject}&body=${emailBody}`
        break
    }

    return url
  }

  const sendMessage = () => {
    if (!message.trim() || !recipient.trim()) return

    const url = generateMessageLink(selectedPlatform, recipient, message)

    // Add to generated links
    const newLink = {
      platform: selectedPlatform,
      url,
      copied: false,
    }

    setGeneratedLinks((prev) => [newLink, ...prev.slice(0, 4)]) // Keep last 5 links

    // Open the URL
    window.open(url, "_blank")

    onMessageSent?.(selectedPlatform, message)

    // Clear form
    setMessage("")
    setRecipient("")
  }

  const copyLink = async (index: number) => {
    try {
      await navigator.clipboard.writeText(generatedLinks[index].url)
      setGeneratedLinks((prev) =>
        prev.map((link, i) => (i === index ? { ...link, copied: true } : { ...link, copied: false })),
      )

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setGeneratedLinks((prev) => prev.map((link) => ({ ...link, copied: false })))
      }, 2000)
    } catch (err) {
      console.error("Failed to copy link:", err)
    }
  }

  const openLink = (url: string) => {
    window.open(url, "_blank")
  }

  return (
    <Card className="border-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-accent" />
          <span>Messaging Center</span>
        </CardTitle>
        <CardDescription>Send messages via WhatsApp, Telegram, or Email</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Platform Selection */}
        <div className="flex space-x-2">
          {platforms.map((platform) => (
            <Button
              key={platform.id}
              variant={selectedPlatform === platform.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPlatform(platform.id as any)}
              className="flex items-center space-x-1"
            >
              <platform.icon className="w-3 h-3" />
              <span>{platform.name}</span>
            </Button>
          ))}
        </div>

        {/* Recipient Input */}
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-1 block">
            {selectedPlatform === "whatsapp"
              ? "Phone Number"
              : selectedPlatform === "telegram"
                ? "Username"
                : "Email Address"}
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder={
              selectedPlatform === "whatsapp"
                ? "+1234567890"
                : selectedPlatform === "telegram"
                  ? "@username"
                  : "user@example.com"
            }
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          />
        </div>

        {/* Message Input */}
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-1 block">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            rows={3}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
          />
        </div>

        {/* Send Button */}
        <Button onClick={sendMessage} disabled={!message.trim() || !recipient.trim()} className="w-full">
          <Send className="w-4 h-4 mr-2" />
          Send via {platforms.find((p) => p.id === selectedPlatform)?.name}
        </Button>

        {/* Generated Links */}
        {generatedLinks.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Recent Message Links</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {generatedLinks.map((link, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded-md text-sm">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <Badge variant="outline" className="text-xs">
                      {link.platform}
                    </Badge>
                    <span className="truncate text-muted-foreground">
                      {link.url.length > 40 ? `${link.url.substring(0, 40)}...` : link.url}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => copyLink(index)} className="h-6 w-6 p-0">
                      <Copy className={`w-3 h-3 ${link.copied ? "text-green-500" : ""}`} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openLink(link.url)} className="h-6 w-6 p-0">
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
