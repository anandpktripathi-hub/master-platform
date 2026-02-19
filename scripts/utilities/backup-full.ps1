param(
  [string]$OutputDir = "backup",
  [string]$BaseName = "project-backup",
  [switch]$IncludeGitFolder
)

$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\.." )).Path
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$outDirPath = Join-Path $repoRoot $OutputDir

if (-not (Test-Path -LiteralPath $outDirPath)) {
  New-Item -ItemType Directory -Path $outDirPath | Out-Null
}

$zipPath = Join-Path $outDirPath ("{0}-{1}.zip" -f $BaseName, $timestamp)

$excluded = @(
  "node_modules",
  "dist",
  "build",
  ".cache",
  "coverage"
)

# Always exclude .git unless explicitly requested.
if (-not $IncludeGitFolder) {
  $excluded += ".git"
}

Write-Host "Creating backup zip: $zipPath"
Write-Host "Repo root: $repoRoot"
Write-Host "Excluded top-level folders (by name match): $($excluded -join ', ')"

# Collect files (including normally ignored by git). Exclude by folder name anywhere in path.
$files = Get-ChildItem -LiteralPath $repoRoot -Recurse -File -Force |
  Where-Object {
    $full = $_.FullName
    foreach ($ex in $excluded) {
      if ($full -match ([regex]::Escape([IO.Path]::DirectorySeparatorChar + $ex + [IO.Path]::DirectorySeparatorChar))) { return $false }
    }
    return $true
  }

# Create zip
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::Open($zipPath, 'Create')
try {
  foreach ($f in $files) {
    $relative = $f.FullName.Substring($repoRoot.Length).TrimStart([IO.Path]::DirectorySeparatorChar)
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $f.FullName, $relative, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
  }
} finally {
  $zip.Dispose()
}

Write-Host "Done. Files in zip: $($files.Count)"