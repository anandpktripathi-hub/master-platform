# Complete PowerShell script for full project backup to GitHub
# Author: anandpktripathi@gmail.com
# Requirements: Windows 11, PowerShell 7+, Git, GitHub CLI (gh), zip

param(
    [string]$RepoUrl = "https://github.com/anandpktripathi-hub/master-platform",
    [string]$GitEmail = "anandpktripathi@gmail.com"
)

function Write-Log($msg) {
    Write-Host "[AutoGitBackup] $msg"
}

function Get-GitRoot {
    $dir = Get-Location
    while ($dir -ne $null) {
        if (Test-Path (Join-Path $dir '.git')) { return $dir }
        $parent = Split-Path $dir -Parent
        if ($parent -eq $dir) { break }
        $dir = $parent
    }
    throw "No .git directory found. Please run inside a git repository."
}

$ErrorActionPreference = 'Stop'

# Ensure GitHub CLI (gh) is installed
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Log "GitHub CLI not found. Installing via winget..."
    winget install --id GitHub.cli -e --source winget
}

# Authenticate gh CLI if needed
if (-not (gh auth status 2>$null)) {
    Write-Log "Authenticating gh CLI..."
    gh auth login --hostname github.com --git-protocol https --web
}

# Set global git config
Write-Log "Configuring git user.email..."
git config --global user.email $GitEmail

# Change to git root
$gitRoot = Get-GitRoot
Set-Location $gitRoot

# Backup .git folder
$backupName = "backup-$(Get-Date -Format 'yyyyMMdd-HHmmss').zip"
Write-Log "Backing up .git to $backupName..."
Compress-Archive -Path .git -DestinationPath $backupName -Force

# Ensure remote origin exists
$remote = git remote get-url origin 2>$null
if (-not $remote) {
    Write-Log "Adding remote origin: $RepoUrl"
    git remote add origin $RepoUrl
}

# Fetch latest from remote
Write-Log "Fetching latest from remote..."
git fetch origin

# Ensure main branch exists locally
if (-not (git show-ref --verify --quiet refs/heads/main)) {
    Write-Log "Creating local main branch..."
    git checkout -b main
} else {
    git checkout main
}

# Add all files (ignore nothing)
Write-Log "Adding all files to git..."
git add -A

# Show status and diff preview
Write-Log "Git status preview:"
git status
Write-Log "Git diff preview:"
git diff --stat
Start-Sleep -Seconds 5

# Merge remote/main, prioritize local
Write-Log "Merging remote/main, prioritizing local changes..."
git fetch origin main
if (git rev-parse --verify origin/main 2>$null) {
    git merge -X ours origin/main --allow-unrelated-histories --no-edit
}

# Commit
$commitMsg = "Full project backup snapshot - all current work as-is [$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')]"
Write-Log "Committing changes..."
git commit -am $commitMsg

# Warn before force push
Write-Log "About to force-push to origin/main. This will overwrite remote with local."
Start-Sleep -Seconds 3

# Push with force-with-lease
Write-Log "Pushing to origin/main (force-with-lease)..."
git push origin main --force-with-lease

# Verify status
Write-Log "Verifying git status..."
$stat = git status --porcelain
if ($stat) {
    Write-Log "ERROR: Working tree not clean after push!"
    git status
    exit 1
}
Write-Log "Backup complete. Local and remote are in sync."

git status
