"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Code, Play, Copy, Download } from "lucide-react"

interface CodePreviewProps {
  code: string
  language: string
  onExecute?: () => void
}

export function CodePreview({ code, language, onExecute }: CodePreviewProps) {
  const [activeTab, setActiveTab] = useState("code")
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionResult, setExecutionResult] = useState("")

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
    } catch (error) {
      console.log("[v0] Copy failed:", error)
    }
  }

  const handleDownload = () => {
    const extension =
      language === "javascript"
        ? "js"
        : language === "python"
          ? "py"
          : language === "typescript"
            ? "ts"
            : language === "html"
              ? "html"
              : "txt"

    const blob = new Blob([code], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `jarvis-generated-code.${extension}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleExecute = async () => {
    if (!onExecute) return

    setIsExecuting(true)
    try {
      // For demonstration - in real implementation, this would execute the code safely
      if (language === "javascript") {
        // Simple eval for demo (not recommended for production)
        try {
          const result = eval(code)
          setExecutionResult(String(result))
        } catch (error) {
          setExecutionResult(`Error: ${error}`)
        }
      } else if (language === "python") {
        setExecutionResult("Python execution would require a Python runtime")
      } else {
        setExecutionResult("Code preview available - execution not supported for this language")
      }
      onExecute()
    } catch (error) {
      setExecutionResult(`Execution error: ${error}`)
    } finally {
      setIsExecuting(false)
    }
  }

  const renderPreview = () => {
    if (language === "html") {
      return (
        <div className="border rounded p-4 bg-white text-black min-h-[200px]">
          <div dangerouslySetInnerHTML={{ __html: code }} />
        </div>
      )
    } else if (language === "javascript" && code.includes("React")) {
      return (
        <div className="border rounded p-4 bg-muted/30 min-h-[200px] flex items-center justify-center">
          <p className="text-muted-foreground">React component preview would render here</p>
        </div>
      )
    } else {
      return (
        <div className="border rounded p-4 bg-muted/30 min-h-[200px] flex items-center justify-center">
          <p className="text-muted-foreground">Preview not available for {language}</p>
        </div>
      )
    }
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Code className="w-5 h-5 text-primary" />
              <span>Code Preview</span>
            </CardTitle>
            <CardDescription>Generated {language} code with live preview</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{language}</Badge>
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <Copy className="w-3 h-3 mr-1" />
              Copy
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="w-3 h-3 mr-1" />
              Download
            </Button>
            {(language === "javascript" || language === "python") && (
              <Button variant="outline" size="sm" onClick={handleExecute} disabled={isExecuting}>
                <Play className="w-3 h-3 mr-1" />
                {isExecuting ? "Running..." : "Execute"}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="code">Code</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="result">Result</TabsTrigger>
          </TabsList>

          <TabsContent value="code" className="mt-4">
            <pre className="bg-muted/50 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{code}</code>
            </pre>
          </TabsContent>

          <TabsContent value="preview" className="mt-4">
            {renderPreview()}
          </TabsContent>

          <TabsContent value="result" className="mt-4">
            <div className="bg-muted/50 p-4 rounded-lg min-h-[200px]">
              {executionResult ? (
                <pre className="text-sm">{executionResult}</pre>
              ) : (
                <p className="text-muted-foreground">Execute code to see results</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
