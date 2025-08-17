#!/bin/bash
# J.A.R.V.I.S App Launcher

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_DIR="$PROJECT_DIR/logs"

# Create logs directory if it doesn't exist
mkdir -p "$LOG_DIR"

launch_app() {
    app_name=$1
    
    case "$app_name" in
        "whatsapp"|"WhatsApp")
            am start -n com.whatsapp/.HomeActivity
            ;;
        "telegram"|"Telegram")
            am start -n org.telegram.messenger/.DefaultIcon
            ;;
        "chrome"|"Chrome")
            am start -n com.android.chrome/.Main
            ;;
        "gmail"|"Gmail")
            am start -n com.google.android.gm/.ConversationListActivityGmail
            ;;
        "youtube"|"YouTube")
            am start -n com.google.android.youtube/.HomeActivity
            ;;
        "camera"|"Camera")
            am start -n com.android.camera/.Camera
            ;;
        "gallery"|"Gallery")
            am start -n com.google.android.apps.photos/.home.HomeActivity
            ;;
        "settings"|"Settings")
            am start -n com.android.settings/.Settings
            ;;
        "calculator"|"Calculator")
            am start -n com.google.android.calculator/.Calculator
            ;;
        "maps"|"Maps")
            am start -n com.google.android.apps.maps/.MapsActivity
            ;;
        *)
            echo "App not found: $app_name"
            return 1
            ;;
    esac
    
    echo "$(date): Launched $app_name" >> "$LOG_DIR/actions.log"
    echo "Done ✅ Launched $app_name"
}

# Launch app from command line
if [ $# -eq 1 ]; then
    launch_app "$1"
else
    echo "Usage: $0 <app_name>"
    echo "Available apps: whatsapp, telegram, chrome, gmail, youtube, camera, gallery, settings, calculator, maps"
fi
