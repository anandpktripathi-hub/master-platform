# Git Workflow Guide for `master-platform`

This guide provides step-by-step commands and an optional PowerShell script to upload/update files, commit and push using the email `anandpktripathi@gmail.com`, handle merges from feature branches, and set up a lightweight CI/CD with GitHub Actions.

## Prerequisites
- Install Git: https://git-scm.com/downloads
- Ensure you have write access to `https://github.com/anandpktripathi-hub/master-platform`.
- From your project folder, run commands in PowerShell (Windows) or Bash (macOS/Linux).

## One-time repository setup (if needed)
```bash
# Inside your local project directory
git init

# Add remote
git remote add origin https://github.com/anandpktripathi-hub/master-platform.git

# Configure identity for this repo (local-only)
git config user.email "anandpktripathi@gmail.com"
git config user.name "Anand Tripathi"

# Ensure main is the default local branch
git branch -M main
```

## Upload or update files
```bash
# Add all changes (new, modified, deleted)
git add -A

# Or add specific files
git add path/to/file1 path/to/file2

# Commit with a descriptive message
git commit -m "feat: add X and update Y"

# Push to main (first push sets upstream)
git push -u origin main
```

## Feature branch workflow (recommended)
```bash
# Create and switch to a feature branch
git checkout -b feature/my-change

# Work, stage, and commit
git add -A
git commit -m "feat: implement my change"

# Push the feature branch
git push -u origin feature/my-change
```
Open a Pull Request on GitHub and request review. After approval:

```bash
# (Option A) Merge locally then push
git checkout main
git fetch origin
git pull --rebase origin main
git merge --no-ff feature/my-change
# Resolve conflicts if prompted, then:
#   git add <fixed files>
#   git merge --continue
git push origin main

# (Option B) Rebase feature onto main then merge via PR
git checkout feature/my-change
git fetch origin
git rebase origin/main
# Resolve conflicts as needed:
#   git status
#   git add <fixed files>
#   git rebase --continue
#   git rebase --abort  (to cancel)
git push -u origin feature/my-change --force-with-lease
```

## Keep your branch updated with main
```bash
git fetch origin
git checkout feature/my-change
git rebase origin/main
# or, if you prefer merging:
git merge origin/main
```

## Mix/port individual commits between branches (cherry-pick)
```bash
# Identify the commit SHA you want to port: git log
# Apply it onto current branch
git cherry-pick <commit-sha>
# Resolve conflicts then continue:
#   git add <fixed files>
#   git cherry-pick --continue
```

## Handle conflicts quickly
```bash
# See what’s conflicted
git status

# Edit conflicted files, keep the intended code, then:
git add <file1> <file2>

# Continue the operation (merge or rebase)
git merge --continue
# or
git rebase --continue
```

## Push updates safely
```bash
# Make sure main is up to date before pushing
git checkout main
git fetch origin
git pull --rebase origin main

# Push your changes
git push origin main
```

## Optional: GitHub Actions CI/CD
Add the following files under `.github/workflows/` in the repository. These run automatically in GitHub.

1) Basic CI to run minimal checks, and Node tests when a `package.json` is present:
```yaml
# .github/workflows/basic-ci.yml
name: Basic CI
on:
  push:
    branches: [ "main", "feature/**" ]
  pull_request:
    branches: [ "main" ]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node (used only if package.json exists)
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Show repo status
        run: |
          echo "Commit: $GITHUB_SHA"
          echo "Branch: $GITHUB_REF"
          ls -la
      - name: Run Node tests if present
        run: |
          if [ -f package.json ]; then
            echo "Detected Node project. Running tests..."
            npm ci
            npm test --if-present
          else
            echo "No package.json, skipping Node tests."
          fi
```

2) Auto-merge PRs labeled `automerge` (respects branch protections):
```yaml
# .github/workflows/automerge.yml
name: Auto Merge PRs
on:
  pull_request:
    types: [labeled, opened, reopened, synchronize, ready_for_review]

jobs:
  automerge:
    if: contains(github.event.pull_request.labels.*.name, 'automerge')
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
    steps:
      - uses: actions/github-script@v7
        with:
          script: |
            const pr = context.payload.pull_request;
            await github.rest.pulls.merge({
              owner: context.repo.owner,
              repo: context.repo.repo,
              pull_number: pr.number,
              merge_method: 'squash'
            });
```

Tip: Enable branch protection on `main` (Require status checks to pass) so automerge only happens after CI succeeds.

## Using the PowerShell helper script
A ready-to-use script is provided at `scripts/git-workflow.ps1` to automate common steps.

Examples:
```powershell
# Initialize repo, set identity, and set upstream to main
./scripts/git-workflow.ps1 -Init -RepoUrl "https://github.com/anandpktripathi-hub/master-platform.git" -Email "anandpktripathi@gmail.com" -Name "Anand Tripathi" -Branch main

# Stage all changes and commit
./scripts/git-workflow.ps1 -CommitMessage "feat: initial setup"

# Push to main
./scripts/git-workflow.ps1 -Push -Branch main

# Create a feature branch
./scripts/git-workflow.ps1 -FeatureBranch "feature/my-change"

# Rebase feature onto main and push
./scripts/git-workflow.ps1 -FeatureBranch "feature/my-change" -Rebase -Branch main

# Merge feature into main (after review)
./scripts/git-workflow.ps1 -FeatureBranch "feature/my-change" -Merge -Branch main
```

## Step-by-step script usage

Initialize and connect to remote with identity:

```powershell
& "$PWD\scripts\git-workflow.ps1" -Init -Owner "anandpktripathi-hub" -Repo "master-platform" -Branch main -Email "anandpktripathi@gmail.com" -Name "Anand Tripathi"
```

Stage, commit, push to main:

```powershell
& "$PWD\scripts\git-workflow.ps1" -CommitMessage "feat: add/update files"
& "$PWD\scripts\git-workflow.ps1" -Push -Branch main
```

Create/switch feature branch, make changes, commit and push:

```powershell
& "$PWD\scripts\git-workflow.ps1" -FeatureBranch "feature/my-change"
# edit files...
& "$PWD\scripts\git-workflow.ps1" -CommitMessage "feat: implement my change"
& "$PWD\scripts\git-workflow.ps1" -FeatureBranch "feature/my-change" -Rebase -Branch main
```

Open a PR and apply `automerge` label (GitHub CLI preferred):

```powershell
& "$PWD\scripts\git-workflow.ps1" -OpenPR -FeatureBranch "feature/my-change" -Owner "anandpktripathi-hub" -Repo "master-platform" -PrTitle "feat: my change" -PrBody "Automated PR" -PrLabel "automerge"
```

Open a PR via REST API (if `gh` is unavailable):

```powershell
# Create a Personal Access Token (classic) with 'repo' scope
$env:GITHUB_TOKEN = "YOUR_PAT_TOKEN"
& "$PWD\scripts\git-workflow.ps1" -OpenPR -FeatureBranch "feature/my-change" -Owner "anandpktripathi-hub" -Repo "master-platform" -PrTitle "feat: my change" -PrBody "Automated PR" -PrLabel "automerge" -GithubToken $env:GITHUB_TOKEN
```

Dry-run mode (prints actions without executing):

```powershell
& "$PWD\scripts\git-workflow.ps1" -Init -Owner "anandpktripathi-hub" -Repo "master-platform" -Branch main -Email "anandpktripathi@gmail.com" -Name "Anand Tripathi" -DryRun
& "$PWD\scripts\git-workflow.ps1" -CommitMessage "feat: dry-run commit" -DryRun
& "$PWD\scripts\git-workflow.ps1" -Push -Branch main -DryRun
& "$PWD\scripts\git-workflow.ps1" -FeatureBranch "feature/automation-dry-run" -DryRun
& "$PWD\scripts\git-workflow.ps1" -OpenPR -FeatureBranch "feature/automation-dry-run" -Owner "anandpktripathi-hub" -Repo "master-platform" -PrTitle "feat: automation dry-run" -PrBody "This is a dry-run demonstration" -PrLabel "automerge" -DryRun
```

### One-command auto-sync to main (non-interactive)

Automatically pull latest `main`, stage all changes, commit, auto-resolve conflicts, and push:

```powershell
# Prefer keeping local changes during conflicts
& "$PWD\scripts\git-workflow.ps1" -SyncMain -Owner "anandpktripathi-hub" -Repo "master-platform" -Branch main -AutoResolve ours -AutoCommitMessage "chore: sync local changes"

# Prefer remote changes during conflicts
& "$PWD\scripts\git-workflow.ps1" -SyncMain -Owner "anandpktripathi-hub" -Repo "master-platform" -Branch main -AutoResolve theirs -AutoCommitMessage "chore: sync local changes"

# Dry-run preview
& "$PWD\scripts\git-workflow.ps1" -SyncMain -Owner "anandpktripathi-hub" -Repo "master-platform" -Branch main -AutoResolve ours -AutoCommitMessage "chore: sync local changes" -DryRun
```

Note: Auto-resolving with `ours` keeps local edits; `theirs` prefers remote updates. For complex conflicts (renames/deletes), the script attempts a best-effort resolution and completes the merge.

## Branch protection & secure PAT usage

- Enable branch protection on `main`:
  - Require status checks to pass (Basic CI job).
  - Require pull request reviews if desired.
  - Disallow direct pushes to `main` for stricter control.
- For REST-based PR creation:
  - Use a minimal-scope PAT (`repo`) stored as a secret.
  - Prefer environment variables (e.g., `GITHUB_TOKEN`) and avoid committing tokens.
  - Rotate tokens regularly and revoke if exposed.

With these settings, the `automerge` workflow only completes after CI passes and protections are satisfied.

## Troubleshooting
- "nothing to commit": You may have no changes staged; run `git add -A`.
- "updates were rejected": Remote has new commits; run `git pull --rebase origin main` then retry `git push`.
- Merge/rebase conflicts: Fix files, `git add`, then `git merge --continue` or `git rebase --continue`.
- Wrong identity on commits: Re-run `git config user.email "anandpktripathi@gmail.com"` and `git config user.name "Anand Tripathi"` in the repo.
