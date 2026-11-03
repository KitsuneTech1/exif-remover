@echo off
setlocal
echo ========================================================
echo   Photo Scrub - EXIF Remover (Kitsune Technologies)
echo ========================================================
echo.

where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js was not found on your system.
    echo.
    echo Quick Option 1 (No Install Needed):
    echo   Visit the live web app in your browser:
    echo   https://kitsunetechnologies.org/play/photo-scrub/
    echo.
    echo Quick Option 2 (Run Locally):
    echo   Download and install Node.js from https://nodejs.org/ (LTS version)
    echo   and double-click start.bat again.
    echo.
    pause
    exit /b 1
)

echo Starting local server at http://localhost:5173 ...
start http://localhost:5173
node server.js
pause
