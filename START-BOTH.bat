@echo off
echo Starting SMETASC Full Stack...
set "ROOT=%~dp0"
start "Backend" cmd /k "cd /d %ROOT%backend && set PORT=4000 && npm run start:dev:with-db"
timeout /t 5 /nobreak
start "Frontend" cmd /k "cd /d %ROOT%frontend && npm run dev"
echo.
echo Both servers are starting...
echo Backend will be on: http://localhost:4000
echo Frontend will be on: http://localhost:5173
