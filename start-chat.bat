@echo off
echo ====================================================
echo Starting Chat Clone Backend (Node.js/Socket.IO)...
echo ====================================================
start "Chat Clone - Backend (Port 5000)" cmd /k "cd /d %~dp0server && npm run dev"

timeout /t 2 /nobreak >nul

echo ====================================================
echo Starting Chat Clone Frontend (Vite/React)...
echo ====================================================
start "Chat Clone - Frontend (Port 5173)" cmd /k "cd /d %~dp0client && npm run dev"

timeout /t 3 /nobreak >nul
echo Opening Chat Clone in default browser...
start http://localhost:5173
