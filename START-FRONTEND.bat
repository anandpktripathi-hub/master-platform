@echo off
echo Starting SMETASC Frontend (with MongoDB via Docker if available)...
set "ROOT=%~dp0"
cd /d "%ROOT%frontend"
npm run dev:with-db
