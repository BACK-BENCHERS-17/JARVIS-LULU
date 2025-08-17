"use client"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return Response.json({ error: "Prompt is required" }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      // Fallback to mock code generation when no API key is available
      const mockCode = generateMockCode(prompt)
      return Response.json({ code: mockCode })
    }

    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: `You are J.A.R.V.I.S, an expert code generator. Generate clean, functional code based on user requests. 
      Always include comments explaining the code. Format your response as proper code with syntax highlighting.
      If the request is unclear, ask for clarification. Keep responses concise but complete.`,
      prompt: `Generate code for: ${prompt}`,
    })

    return Response.json({ code: text })
  } catch (error) {
    console.error("Code generation error:", error)
    const mockCode = generateMockCode(prompt)
    return Response.json({ code: mockCode })
  }
}

function generateMockCode(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase()

  if (lowerPrompt.includes("react") || lowerPrompt.includes("component")) {
    return `// J.A.R.V.I.S Generated React Component
import React, { useState } from 'react'

const MyComponent = () => {
  const [state, setState] = useState('')
  
  return (
    <div className="p-4">
      <h2>Generated Component</h2>
      <p>Based on: ${prompt}</p>
      {/* Add your component logic here */}
    </div>
  )
}

export default MyComponent`
  }

  if (lowerPrompt.includes("function") || lowerPrompt.includes("javascript")) {
    return `// J.A.R.V.I.S Generated JavaScript Function
function generatedFunction() {
  // Generated based on: ${prompt}
  console.log('Function executed successfully')
  
  // Add your function logic here
  return 'Done ✅'
}

// Usage example
generatedFunction()`
  }

  if (lowerPrompt.includes("python")) {
    return `# J.A.R.V.I.S Generated Python Code
def generated_function():
    """Generated based on: ${prompt}"""
    print("Function executed successfully")
    
    # Add your Python logic here
    return "Done ✅"

# Usage example
if __name__ == "__main__":
    result = generated_function()
    print(result)`
  }

  // Default fallback
  return `// J.A.R.V.I.S Code Generation
// Request: ${prompt}
// 
// This is a mock response since no AI API is configured.
// To enable full AI code generation, add your OpenAI API key
// to the environment variables as OPENAI_API_KEY.

console.log("J.A.R.V.I.S: Code generation request received")
console.log("Request: ${prompt}")
console.log("Status: Done ✅")

// Add your implementation here based on the request above`
}
