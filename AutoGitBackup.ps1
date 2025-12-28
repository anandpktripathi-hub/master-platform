# AutoGitBackup.ps1
# Fully automatic backup script for master-platform repository
# Author: anandpktripathi@gmail.com
# Requirements: Windows 11, PowerShell 7+, Git, GitHub CLI (gh), zip

param(
    [string]$RepoUrl = "https://github.com/anandpktripathi-hub/master-platform",
    [string]$GitEmail = "anandpktripathi@gmail.com"
)

function Write-Log($msg) {
    Write-Host "[AutoGitBackup] $msg"
}

# 1. Detect project root (contains .git)
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

# 2. Ensure GitHub CLI (gh) is installed
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Log "GitHub CLI not found. Installing via winget..."
    winget install --id GitHub.cli -e --source winget
}

# 3. Ensure gh is authenticated (PAT or browser, only first run)
if (-not (gh auth status 2>$null)) {
    Write-Log "Authenticating gh CLI..."
    gh auth login --hostname github.com --git-protocol https --web
}

# 4. Set global git config
Write-Log "Configuring git user.email..."
git config --global user.email $GitEmail

# 5. Change to git root
$gitRoot = Get-GitRoot
Set-Location $gitRoot

# 6. Backup .git folder
$backupName = "backup-$(Get-Date -Format 'yyyyMMdd-HHmmss').zip"
Write-Log "Backing up .git to $backupName..."
Compress-Archive -Path .git -DestinationPath $backupName -Force

# 7. Add all files (ignore nothing)
Write-Log "Adding all files to git..."
git add -A

# 8. Show git status and diff preview
Write-Log "Git status preview:"
git status
Write-Log "Git diff preview:"
git diff --stat
Start-Sleep -Seconds 5

# 9. Pull latest with rebase and autostash
Write-Log "Pulling latest from origin/main with rebase/autostash..."
git pull origin main --rebase --autostash

# 10. Commit with timestamp
$commitMsg = "FULL BACKUP $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - master-platform complete snapshot"
Write-Log "Committing changes..."
git commit -am $commitMsg

# 11. Push with force-with-lease
Write-Log "Pushing to origin/main (force-with-lease)..."
git push origin main --force-with-lease

# 12. Verify status
Write-Log "Verifying git status..."
$stat = git status --porcelain
if ($stat) {
    Write-Log "ERROR: Working tree not clean after push!"
    git status
    exit 1
}
Write-Log "Backup complete. Local and remote are in sync."

# 13. Show final status
Write-Log "Final status:"
git status
