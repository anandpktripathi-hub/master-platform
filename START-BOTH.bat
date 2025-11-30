@echo off
echo Starting SMETASC Full Stack...
start "Backend" cmd /k "cd /d C:\Users\annes\Desktop\smetasc-saas-multi-tenancy-app && npm run start:dev"
timeout /t 5 /nobreak
start "Frontend" cmd /k "cd /d C:\Users\annes\Desktop\smetasc-saas-multi-tenancy-app\frontend && npm run dev"
echo.
echo Both servers are starting...
echo Backend will be on: http://localhost:4000
echo Frontend will be on: http://localhost:5173
