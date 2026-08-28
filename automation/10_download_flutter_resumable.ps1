# Resumable Flutter SDK download with automatic retry loop.
# Uses curl.exe -C - (resume from partial file).
# Safe to re-run — picks up from wherever it left off.
#
# Run:
#   powershell -File e:\Tasks\Glide_app\automation\10_download_flutter_resumable.ps1

$Url  = 'https://storage.googleapis.com/flutter_infra_release/releases/stable/windows/flutter_windows_3.47.1-stable.zip'
$Dest = 'C:\src\flutter.zip'

New-Item -ItemType Directory -Path (Split-Path $Dest) -Force | Out-Null

$maxAttempts = 30
$attempt = 0

while ($attempt -lt $maxAttempts) {
  $attempt++
  $sizeBefore = if (Test-Path $Dest) { (Get-Item $Dest).Length } else { 0 }
  Write-Host "[$attempt/$maxAttempts] Starting/resuming download. Have $([math]::Round($sizeBefore/1MB,1)) MB so far." -ForegroundColor Cyan

  # -C -  : resume from where the file left off
  # -sS   : silent progress but show errors
  # --retry 5 --retry-delay 3 : builtin curl retry per connection
  # --max-time 300 : cap each attempt at 5 min
  $exitCode = 0
  try {
    & curl.exe -C - -L -sS --retry 5 --retry-delay 3 --max-time 300 -o $Dest $Url
    $exitCode = $LASTEXITCODE
  } catch {
    $exitCode = 999
  }

  $sizeAfter = if (Test-Path $Dest) { (Get-Item $Dest).Length } else { 0 }
  $downloaded = $sizeAfter - $sizeBefore
  Write-Host "  Exit: $exitCode. Now at $([math]::Round($sizeAfter/1MB,1)) MB (+$([math]::Round($downloaded/1MB,1)) MB this attempt)"

  if ($exitCode -eq 0) {
    Write-Host "✅ Download complete: $([math]::Round($sizeAfter/1MB,1)) MB" -ForegroundColor Green
    exit 0
  }

  # If no bytes came through, wait longer before retrying (network may be down)
  $waitSec = if ($downloaded -lt 1MB) { 15 } else { 3 }
  Write-Host "  Waiting $waitSec sec before retry..." -ForegroundColor Yellow
  Start-Sleep -Seconds $waitSec
}

Write-Host "❌ Gave up after $maxAttempts attempts. Partial file at $Dest" -ForegroundColor Red
exit 1
