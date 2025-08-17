#!/usr/bin/env node
/**
 * J.A.R.V.I.S Local Server for Termux Integration
 */
const express = require("express")
const cors = require("cors")
const { exec } = require("child_process")
const fs = require("fs")
const path = require("path")

const app = express()
const PORT = 8000

app.use(cors())
app.use(express.json())

// Utility function to execute shell commands
const executeCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject({ error: error.message, stderr })
      } else {
        resolve({ stdout, stderr })
      }
    })
  })
}

// Phone control endpoints
app.post("/api/phone-control", async (req, res) => {
  const { action, value } = req.body

  try {
    let command = `~/jarvis/scripts/phone-controls.sh ${action}`
    if (value) command += ` ${value}`

    const result = await executeCommand(command)
    res.json({ success: true, result: result.stdout })
  } catch (error) {
    res.status(500).json({ success: false, error: error.error })
  }
})

// App launcher endpoint
app.post("/api/launch-app", async (req, res) => {
  const { appName } = req.body

  try {
    const result = await executeCommand(`~/jarvis/scripts/app-launcher.sh "${appName}"`)
    res.json({ success: true, result: result.stdout })
  } catch (error) {
    res.status(500).json({ success: false, error: error.error })
  }
})

// Voice control endpoints
app.post("/api/speak", async (req, res) => {
  const { text, language = "en" } = req.body

  try {
    const response = await fetch("http://localhost:8001/speak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, language }),
    })

    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// System info endpoint
app.get("/api/system-info", async (req, res) => {
  try {
    const battery = await executeCommand("termux-battery-status")
    const wifi = await executeCommand("termux-wifi-connectioninfo")

    res.json({
      battery: JSON.parse(battery.stdout),
      wifi: JSON.parse(wifi.stdout),
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.error })
  }
})

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 J.A.R.V.I.S Server running on http://localhost:${PORT}`)
  console.log("📱 Ready to receive commands from the web interface")
})
