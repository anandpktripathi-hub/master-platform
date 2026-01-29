<#
Usage examples:

# Initialize repo (local config only), set origin, set main
./scripts/git-workflow.ps1 -Init -RepoUrl "https://github.com/anandpktripathi-hub/master-platform.git" -Email "anandpktripathi@gmail.com" -Name "Anand Tripathi" -Branch main

# Stage all changes and commit
./scripts/git-workflow.ps1 -CommitMessage "feat: implement change"

# Push to main
./scripts/git-workflow.ps1 -Push -Branch main

# Create/switch to feature branch
./scripts/git-workflow.ps1 -FeatureBranch "feature/my-change"

# Rebase feature onto main and push
./scripts/git-workflow.ps1 -FeatureBranch "feature/my-change" -Rebase -Branch main

# Merge feature into main and push
./scripts/git-workflow.ps1 -FeatureBranch "feature/my-change" -Merge -Branch main

#>

[CmdletBinding()]param(
  [string]$Owner = 'anandpktripathi-hub',
  [string]$Repo = 'master-platform',
  [string]$Email = 'anandpktripathi@gmail.com',
  [string]$Name = 'Anand Tripathi',
  [string]$Branch = 'main',
  [string]$CommitMessage,
  [string]$FeatureBranch,
  [string]$PrTitle = 'feat: merge feature into main',
  [string]$PrBody = 'Automated PR created by script.',
  [string]$PrLabel = 'automerge',
  [string]$GithubToken,
  [switch]$Init,
  [switch]$Push,
  [switch]$Merge,
  [switch]$Rebase,
  [switch]$OpenPR,
  [switch]$DryRun,
  [switch]$SyncMain,
  [ValidateSet('ours','theirs')][string]$AutoResolve = 'ours',
  [string]$AutoCommitMessage = 'chore: sync local changes'
)

function Ensure-Git() {
  if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    throw "Git is not installed or not in PATH. Install from https://git-scm.com/downloads"
  }
}

function Run($cmd) {
  Write-Host "→ $cmd" -ForegroundColor Cyan
  if ($DryRun) { return }
  iex $cmd
  if ($LASTEXITCODE -ne 0) { throw "Command failed: $cmd" }
}

function Has-LocalChanges() {
  if ($DryRun) { Write-Host "DryRun: Would check status for local changes." -ForegroundColor DarkYellow; return $true }
  $status = git status --porcelain
  return -not [string]::IsNullOrWhiteSpace($status)
}

function Try-Rebase-Or-Merge([string]$branch, [string]$strategy) {
  try {
    Run "git pull --rebase origin $branch"
  } catch {
    Write-Host "Rebase failed, attempting merge with -X $strategy" -ForegroundColor Yellow
    if (-not $DryRun) {
      # Abort rebase if in progress
      git rebase --abort 2>$null | Out-Null
    }
    Run "git merge -X $strategy origin/$branch"
    if (-not $DryRun) {
      $conflicts = git ls-files -u
      if ($conflicts) {
        Write-Host "Conflicts detected. Auto-resolving with '$strategy'." -ForegroundColor Yellow
        if ($strategy -eq 'ours') {
          Run "git checkout --ours ."
        } else {
          Run "git checkout --theirs ."
        }
        Run "git add -A"
        # Complete the merge
        try { Run "git merge --continue" } catch { Run "git commit -m \"chore: auto-resolve conflicts ($strategy)\"" }
      }
    } else {
      Write-Host "DryRun: Would check conflicts and auto-resolve using '$strategy'." -ForegroundColor DarkYellow
    }
  }
}

Ensure-Git

if (-not $PSBoundParameters.ContainsKey('Owner') -or -not $PSBoundParameters.ContainsKey('Repo')) {
  Write-Host "Using default repo: $Owner/$Repo" -ForegroundColor DarkCyan
}

$RepoUrl = "https://github.com/$Owner/$Repo.git"

if ($Init) {
  Run 'git init'
  $hasOrigin = git remote | Select-String -Pattern '^origin$'
  if (-not $hasOrigin) {
    Run "git remote add origin $RepoUrl"
  } else {
    Run "git remote set-url origin $RepoUrl"
  }
  Run "git config user.email '$Email'"
  Run "git config user.name '$Name'"
  Run "git branch -M $Branch"
}

if ($CommitMessage) {
  Run 'git add -A'
  Run "git commit -m \"$CommitMessage\""
}

if ($Push) {
  Run "git push -u origin $Branch"
}

if ($FeatureBranch) {
  # If the branch exists, switch; else create
  $branches = (git branch --list $FeatureBranch)
  if ($branches) {
    Run "git checkout $FeatureBranch"
  } else {
    Run "git checkout -b $FeatureBranch"
  }

  if ($Merge) {
    Run 'git fetch origin'
    Run "git checkout $Branch"
    Run "git pull --rebase origin $Branch"
    Run "git merge --no-ff $FeatureBranch"
    Write-Host "If conflicts occur: fix files, 'git add', then 'git merge --continue'" -ForegroundColor Yellow
    Run "git push origin $Branch"
  } elseif ($Rebase) {
    Run 'git fetch origin'
    Run "git checkout $FeatureBranch"
    Run "git rebase origin/$Branch"
    Write-Host "If conflicts occur: fix files, 'git add', then 'git rebase --continue' (or --abort)" -ForegroundColor Yellow
    Run "git push -u origin $FeatureBranch"
  }
}

function Ensure-GhCli() {
  return (Get-Command gh -ErrorAction SilentlyContinue) -ne $null
}

function Create-PR-And-Label() {
  if (-not $FeatureBranch) { throw "FeatureBranch is required to open a PR." }
  $base = $Branch
  $head = $FeatureBranch

  if (Ensure-GhCli) {
    # Use GitHub CLI if available
    $cmd = "gh pr create --repo $Owner/$Repo --base $base --head $head --title `"$PrTitle`" --body `"$PrBody`""
    if ($PrLabel) { $cmd = "$cmd --label $PrLabel" }
    Run $cmd
  } else {
    if (-not $GithubToken) {
      if ($DryRun) {
        Write-Host "DryRun: Would use GitHub REST API with a PAT (set -GithubToken)." -ForegroundColor DarkYellow
        return
      }
      throw "GithubToken is required when 'gh' CLI is not available. Create a classic PAT with 'repo' scope and pass -GithubToken '[TOKEN]'."
    }
    $Headers = @{ Authorization = "token $GithubToken"; 'User-Agent' = "ps-script" }
    $CreatePrBody = @{ title = $PrTitle; body = $PrBody; base = $base; head = $head } | ConvertTo-Json
    Write-Host "→ REST: create PR $Owner/$Repo base=$base head=$head" -ForegroundColor Cyan
    if (-not $DryRun) {
      $pr = Invoke-RestMethod -Method Post -Uri "https://api.github.com/repos/$Owner/$Repo/pulls" -Headers $Headers -Body $CreatePrBody
      $prNumber = $pr.number
      Write-Host "PR #$prNumber created" -ForegroundColor Green
      if ($PrLabel) {
        $LabelsBody = @{ labels = @($PrLabel) } | ConvertTo-Json
        Write-Host "→ REST: add label '$PrLabel' to PR #$prNumber" -ForegroundColor Cyan
        Invoke-RestMethod -Method Post -Uri "https://api.github.com/repos/$Owner/$Repo/issues/$prNumber/labels" -Headers $Headers -Body $LabelsBody | Out-Null
        Write-Host "Label added." -ForegroundColor Green
      }
    }
  }
}

if ($OpenPR) {
  Create-PR-And-Label
}

if ($SyncMain) {
  Run "git checkout $Branch"
  Run 'git fetch origin'
  if (Has-LocalChanges) {
    Run 'git add -A'
    Run "git commit -m \"$AutoCommitMessage\""
  } else {
    Write-Host "No local changes to commit." -ForegroundColor DarkGray
  }
  Try-Rebase-Or-Merge -branch $Branch -strategy $AutoResolve
  Run "git push origin $Branch"
}

Write-Host "Done." -ForegroundColor Green
