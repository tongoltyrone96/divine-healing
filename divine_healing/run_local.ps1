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

# Only keys the app actually declares in lib/config/env.dart are forwarded.
# .env also holds STRIPE_SECRET_KEY (a LIVE key) for the server-side scripts
# under data/, and that must never be handed to a client build: a single
# String.fromEnvironment('STRIPE_SECRET_KEY') added later would bake it into
# a bundle that anyone can download. Keep this list in sync with Env.
$allowed = @(
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'REVENUECAT_IOS_KEY',
  'REVENUECAT_ANDROID_KEY'
)

$defines = @()
$skipped = @()
Get-Content $envPath | ForEach-Object {
  $line = $_.Trim()
  if ($line -eq '' -or $line.StartsWith('#')) { return }
  $kv = $line -split '=', 2
  if ($kv.Count -ne 2) { return }
  $key = $kv[0].Trim()
  $value = $kv[1].Trim()
  if ($value -eq '') { return }
  if ($allowed -notcontains $key) { $script:skipped += $key; return }
  $script:defines += "--dart-define=$key=$value"
}

Write-Host "Loaded $($defines.Count) client-safe env vars from .env" -ForegroundColor Green
if ($skipped.Count -gt 0) {
  Write-Host "Withheld from the build (server-side only): $($skipped -join ', ')" -ForegroundColor DarkGray
}
# The Android build runs under WSL (see automation/wsl/), and its `pub get`
# rewrites .dart_tool/package_config.json with Linux paths into ~/.pub-cache.
# Those do not exist here, so resolve again for Windows before building.
& 'C:/src/flutter/bin/flutter.bat' pub get

& 'C:/src/flutter/bin/flutter.bat' @FlutterArgs @defines
