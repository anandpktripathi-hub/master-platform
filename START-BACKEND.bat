@echo off
echo Starting SMETASC Backend Server (backend folder) with MongoDB via Docker...
set "ROOT=%~dp0"
cd /d "%ROOT%backend"
set PORT=4000
npm run start:dev:with-db
