import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              ✨ Preview Working
            </Badge>
            <h1 className="text-4xl font-bold mb-4">Jarvis AI Assistant</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Your intelligent AI assistant is now live and ready to help!
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">🤖 AI Powered</CardTitle>
                <CardDescription>Advanced AI capabilities for intelligent assistance</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Leveraging cutting-edge AI technology to provide smart, contextual responses.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">⚡ Fast Response</CardTitle>
                <CardDescription>Lightning-fast processing and responses</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Optimized for speed and efficiency to give you instant results.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Action Section */}
          <div className="text-center">
            <Card className="bg-card border">
              <CardHeader>
                <CardTitle>Ready to Get Started?</CardTitle>
                <CardDescription>
                  Your web preview is working perfectly! The interface is responsive and ready for development.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg">Start Chatting</Button>
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Status Indicator */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Web Preview Active
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
