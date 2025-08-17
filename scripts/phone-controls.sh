#!/bin/bash
# J.A.R.V.I.S Phone Control Scripts

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_DIR="$PROJECT_DIR/logs"

# Create logs directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Function to log actions
log_action() {
    echo "$(date): $1" >> "$LOG_DIR/actions.log"
    echo "Done ✅"
}

# Wi-Fi Control
toggle_wifi() {
    current_state=$(termux-wifi-connectioninfo | jq -r '.supplicant_state')
    if [ "$current_state" = "COMPLETED" ]; then
        svc wifi disable
        log_action "Wi-Fi disabled"
    else
        svc wifi enable
        log_action "Wi-Fi enabled"
    fi
}

# Torch Control
toggle_torch() {
    if [ -f /tmp/torch_on ]; then
        termux-torch off
        rm /tmp/torch_on
        log_action "Torch turned off"
    else
        termux-torch on
        touch /tmp/torch_on
        log_action "Torch turned on"
    fi
}

# Volume Control
set_volume() {
    level=$1
    termux-volume music $level
    log_action "Volume set to $level"
}

volume_up() {
    current=$(termux-volume | jq -r '.music')
    new_level=$((current + 1))
    if [ $new_level -le 15 ]; then
        termux-volume music $new_level
        log_action "Volume increased to $new_level"
    fi
}

volume_down() {
    current=$(termux-volume | jq -r '.music')
    new_level=$((current - 1))
    if [ $new_level -ge 0 ]; then
        termux-volume music $new_level
        log_action "Volume decreased to $new_level"
    fi
}

# Brightness Control
set_brightness() {
    level=$1
    settings put system screen_brightness $level
    log_action "Brightness set to $level"
}

# Screen Control
screen_on() {
    input keyevent KEYCODE_WAKEUP
    log_action "Screen turned on"
}

screen_off() {
    input keyevent KEYCODE_POWER
    log_action "Screen turned off"
}

# Battery Info
battery_status() {
    termux-battery-status | jq -r '"Battery: \(.percentage)% - \(.status)"'
}

# Vibration
vibrate() {
    duration=${1:-500}
    termux-vibrate -d $duration
    log_action "Vibrated for ${duration}ms"
}

# Handle command line arguments
case "$1" in
    "wifi") toggle_wifi ;;
    "torch") toggle_torch ;;
    "volume-up") volume_up ;;
    "volume-down") volume_down ;;
    "volume") set_volume $2 ;;
    "brightness") set_brightness $2 ;;
    "screen-on") screen_on ;;
    "screen-off") screen_off ;;
    "battery") battery_status ;;
    "vibrate") vibrate $2 ;;
    *) echo "Usage: $0 {wifi|torch|volume-up|volume-down|volume <level>|brightness <level>|screen-on|screen-off|battery|vibrate [duration]}" ;;
esac
