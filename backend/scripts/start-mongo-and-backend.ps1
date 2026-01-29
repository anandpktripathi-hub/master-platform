#!/usr/bin/env pwsh
# PowerShell script to start MongoDB and the NestJS backend

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "MongoDB + Backend Startup Script" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "Checking Docker status..." -ForegroundColor Yellow
$dockerRunning = docker info 2>&1 | Select-String "Server Version"
if (-not $dockerRunning) {
    Write-Host "ERROR: Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}
Write-Host "✓ Docker is running" -ForegroundColor Green
Write-Host ""

# Check if MongoDB container already exists
Write-Host "Checking for existing MongoDB container..." -ForegroundColor Yellow
$existingContainer = docker ps -a --filter "name=mongo" --format "{{.Names}}"

if ($existingContainer -eq "mongo") {
    Write-Host "Found existing MongoDB container. Checking status..." -ForegroundColor Yellow
    $containerStatus = docker inspect -f '{{.State.Running}}' mongo
    
    if ($containerStatus -eq "true") {
        Write-Host "✓ MongoDB container is already running" -ForegroundColor Green
    } else {
        Write-Host "Starting existing MongoDB container..." -ForegroundColor Yellow
        docker start mongo
        Write-Host "✓ MongoDB container started" -ForegroundColor Green
    }
} else {
    Write-Host "Creating and starting MongoDB container..." -ForegroundColor Yellow
    docker run -d -p 27017:27017 --name mongo mongo:latest
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ MongoDB container created and started" -ForegroundColor Green
    } else {
        Write-Host "ERROR: Failed to start MongoDB container" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "Waiting for MongoDB to be ready (3 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
Write-Host "✓ MongoDB should be ready" -ForegroundColor Green
Write-Host ""

# Verify MongoDB is listening
Write-Host "Verifying MongoDB is listening on port 27017..." -ForegroundColor Yellow
$mongoPort = netstat -an | Select-String "127.0.0.1:27017" | Select-String "LISTENING"
if ($mongoPort) {
    Write-Host "✓ MongoDB is listening on 127.0.0.1:27017" -ForegroundColor Green
} else {
    Write-Host "WARNING: Cannot verify MongoDB port. Proceeding anyway..." -ForegroundColor Yellow
}
Write-Host ""

# Build the backend
Write-Host "Building backend..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\.."
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Backend build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Backend build successful" -ForegroundColor Green
Write-Host ""

# Start the backend
Write-Host "Starting backend..." -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
npm run start:dev
