"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Code, Copy, Send, Loader2 } from "lucide-react"

interface CodeGeneratorProps {
  onCodeGenerated?: (code: string) => void
}

export function CodeGenerator({ onCodeGenerated }: CodeGeneratorProps) {
  const [prompt, setPrompt] = useState("")
  const [generatedCode, setGeneratedCode] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState("")

  const addConfirmation = (action: string, details?: string) => {
    if ((window as any).jarvisConfirmation) {
      return (window as any).jarvisConfirmation.add(action, details)
    }
  }

  const generateCode = async (codePrompt: string = prompt) => {
    if (!codePrompt.trim()) return

    setIsGenerating(true)
    setError("")

    const confirmationId = addConfirmation("Generating code", codePrompt)

    try {
      const response = await fetch("/api/generate-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: codePrompt }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate code")
      }

      setGeneratedCode(data.code)
      onCodeGenerated?.(data.code)

      addConfirmation("Code generated successfully", "Ready to copy")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      setError(errorMessage)

      if ((window as any).jarvisConfirmation && confirmationId) {
        ;(window as any).jarvisConfirmation.error(confirmationId, errorMessage)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode)
      addConfirmation("Code copied to clipboard")
    } catch (err) {
      console.error("Failed to copy code:", err)
      addConfirmation("Copy failed", "Unable to access clipboard")
    }
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Code className="w-5 h-5 text-primary" />
          <span>AI Code Generator</span>
        </CardTitle>
        <CardDescription>Describe what code you need and I'll generate it for you</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Create a React component for a login form"
            className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            onKeyPress={(e) => e.key === "Enter" && !isGenerating && generateCode()}
          />
          <Button onClick={() => generateCode()} disabled={isGenerating || !prompt.trim()} size="sm">
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {generatedCode && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant="secondary">Generated Code</Badge>
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                <Copy className="w-3 h-3 mr-1" />
                Copy
              </Button>
            </div>
            <pre className="bg-muted/50 p-4 rounded-md overflow-x-auto text-sm border">
              <code>{generatedCode}</code>
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
