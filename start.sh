#!/usr/bin/env bash
echo "========================================================"
echo "  Photo Scrub - EXIF Remover (Kitsune Technologies)"
echo "========================================================"
echo ""

if ! command -v node >/dev/null 2>&1; then
    echo "[ERROR] Node.js was not found on your system."
    echo ""
    echo "Quick Option 1 (No Install Needed):"
    echo "  Visit the live web app in your browser:"
    echo "  https://kitsunetechnologies.org/play/photo-scrub/"
    echo ""
    echo "Quick Option 2 (Run Locally):"
    echo "  Install Node.js (v18+) from https://nodejs.org/"
    echo ""
    exit 1
fi

echo "Starting local server at http://localhost:5173 ..."
if command -v xdg-open >/dev/null 2>&1; then
    xdg-open http://localhost:5173 &
elif command -v open >/dev/null 2>&1; then
    open http://localhost:5173 &
fi

node server.js
