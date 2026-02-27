param(
  [Parameter(Mandatory = $true)]
  [string]$SourcePath,

  [Parameter(Mandatory = $true)]
  [string]$Version,

  [string]$OutputDir = "artifacts"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $SourcePath)) {
  throw "SourcePath not found: $SourcePath"
}

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

$safeVersion = $Version -replace "[^a-zA-Z0-9._-]", "-"
$versionedZip = Join-Path $OutputDir ("BassProgram-" + $safeVersion + ".zip")
$latestZip = Join-Path $OutputDir "BassProgram-Alpha-0.1-Lite.zip"
$tempRoot = Join-Path $env:TEMP ("bassprogram-package-" + [guid]::NewGuid().ToString("N"))

New-Item -ItemType Directory -Force -Path $tempRoot | Out-Null

try {
  if ((Get-Item $SourcePath).PSIsContainer) {
    Copy-Item -Recurse -Force -Path (Join-Path $SourcePath "*") -Destination $tempRoot
  }
  else {
    $sourceFile = Get-Item $SourcePath
    Copy-Item -Force -Path $sourceFile.FullName -Destination (Join-Path $tempRoot $sourceFile.Name)
  }

  $notesPath = Join-Path $tempRoot "RELEASE_NOTES.txt"
  $notes = @(
    "BassProgram release package",
    "Version: $Version",
    "Generated: $(Get-Date -Format o)",
    ""
  )
  Set-Content -Path $notesPath -Value $notes

  if (Test-Path $versionedZip) { Remove-Item -Force $versionedZip }
  if (Test-Path $latestZip) { Remove-Item -Force $latestZip }

  Compress-Archive -Path (Join-Path $tempRoot "*") -DestinationPath $versionedZip -Force
  Copy-Item -Force -Path $versionedZip -Destination $latestZip

  Write-Host "Created: $versionedZip"
  Write-Host "Updated latest alias: $latestZip"
}
finally {
  if (Test-Path $tempRoot) {
    Remove-Item -Recurse -Force $tempRoot
  }
}
