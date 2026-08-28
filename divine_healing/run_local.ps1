# Helper to run / build Flutter with env vars loaded from .env.
#
# Usage:
#   .\run_local.ps1                  # runs on Chrome (dev)
#   .\run_local.ps1 build web        # release web build
#   .\run_local.ps1 build apk        # Android release
#
# The .env file is gitignored — copy .env.example and fill in real values.

param(
  [Parameter(Position=0, ValueFromRemainingArguments=$true)]
  [string[]]$FlutterArgs = @('run', '-d', 'chrome')
)

$envPath = Join-Path $PSScriptRoot '.env'
if (-not (Test-Path $envPath)) {
  Write-Host "No .env file. Running in M1 local-only mode (no Supabase)." -ForegroundColor Yellow
  & 'C:/src/flutter/bin/flutter.bat' @FlutterArgs
  exit $LASTEXITCODE
}

$defines = @()
Get-Content $envPath | ForEach-Object {
  $line = $_.Trim()
  if ($line -eq '' -or $line.StartsWith('#')) { return }
  $kv = $line -split '=', 2
  if ($kv.Count -ne 2) { return }
  $key = $kv[0].Trim()
  $value = $kv[1].Trim()
  if ($value -eq '') { return }
  $defines += "--dart-define=$key=$value"
}

Write-Host "Loaded $($defines.Count) env vars from .env" -ForegroundColor Green
& 'C:/src/flutter/bin/flutter.bat' @FlutterArgs @defines
