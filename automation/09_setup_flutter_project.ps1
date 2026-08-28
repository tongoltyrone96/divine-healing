# Post-download automation:
#   1. Extract Flutter SDK zip
#   2. Add to user PATH
#   3. Run flutter create
#   4. Overlay scaffold files (theme, models, router, features, assets)
#   5. flutter pub get
#   6. flutter pub run build_runner build (for Freezed/Riverpod codegen)
#
# ASCII-only for PowerShell 5.1 compatibility.
# Run:
#   powershell -File e:\Tasks\Glide_app\automation\09_setup_flutter_project.ps1

$ErrorActionPreference = 'Stop'

$FlutterZip     = 'C:\src\flutter.zip'
$FlutterHome    = 'C:\src\flutter'
$FlutterBin     = "$FlutterHome\bin"
$ProjectParent  = 'e:\Tasks\Glide_app'
$ProjectRoot    = "$ProjectParent\divine_healing"
$Scaffold       = "$ProjectParent\flutter_app_scaffold"
$OrgId          = 'com.strawberryhope'
$AppName        = 'divine_healing'

Write-Host "=== 1. Extract Flutter SDK ===" -ForegroundColor Cyan
if (-not (Test-Path $FlutterZip)) { throw "Not found: $FlutterZip" }
if (Test-Path $FlutterHome) {
  Write-Host "  Removing existing: $FlutterHome"
  Remove-Item $FlutterHome -Recurse -Force
}
Write-Host "  Expanding archive (1.8 GB, may take 2-4 min)..."
# Use .NET ZipFile for large archives (Expand-Archive is slow on 5.1)
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::ExtractToDirectory($FlutterZip, 'C:\src')
Write-Host "  Done. Flutter at: $FlutterHome"

Write-Host "=== 2. Add Flutter to user PATH ===" -ForegroundColor Cyan
$userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
if ($userPath -notlike "*$FlutterBin*") {
  [Environment]::SetEnvironmentVariable('Path', "$userPath;$FlutterBin", 'User')
  Write-Host "  Added $FlutterBin to user PATH"
  $env:Path += ";$FlutterBin"
} else {
  Write-Host "  Already in PATH"
  $env:Path += ";$FlutterBin"
}

Write-Host "=== 3. Verify Flutter ===" -ForegroundColor Cyan
& "$FlutterBin\flutter.bat" --version

Write-Host "=== 4. flutter doctor (Android SDK warnings OK for M1 web preview) ===" -ForegroundColor Cyan
& "$FlutterBin\flutter.bat" doctor

Write-Host "=== 5. flutter create ===" -ForegroundColor Cyan
if (Test-Path $ProjectRoot) {
  Write-Host "  Project exists. Skipping create. Delete $ProjectRoot to recreate."
} else {
  Push-Location $ProjectParent
  & "$FlutterBin\flutter.bat" create --org $OrgId --project-name $AppName --platforms=android,ios,web,windows $AppName
  Pop-Location
}

Write-Host "=== 6. Overlay scaffold files ===" -ForegroundColor Cyan

# Backup Flutter-generated files that we are overwriting
$backupDir = "$ProjectRoot\_flutter_default_backup"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
if (Test-Path "$ProjectRoot\pubspec.yaml") {
  Copy-Item "$ProjectRoot\pubspec.yaml" "$backupDir\pubspec.yaml"
}
if (Test-Path "$ProjectRoot\lib\main.dart") {
  Copy-Item "$ProjectRoot\lib\main.dart" "$backupDir\main.dart"
}

# Copy pubspec
Copy-Item "$Scaffold\pubspec.yaml" "$ProjectRoot\pubspec.yaml" -Force
Write-Host "  [ok] pubspec.yaml"

# Copy lib/ tree
Copy-Item "$Scaffold\lib\*" "$ProjectRoot\lib\" -Recurse -Force
Write-Host "  [ok] lib/ tree"

# Copy assets
New-Item -ItemType Directory -Path "$ProjectRoot\assets\content" -Force | Out-Null
New-Item -ItemType Directory -Path "$ProjectRoot\assets\images" -Force | Out-Null
New-Item -ItemType Directory -Path "$ProjectRoot\assets\icons" -Force | Out-Null
Copy-Item "$Scaffold\assets\content\*" "$ProjectRoot\assets\content\" -Force
Write-Host "  [ok] assets/content/"

Write-Host "=== 7. flutter pub get ===" -ForegroundColor Cyan
Push-Location $ProjectRoot
& "$FlutterBin\flutter.bat" pub get

Write-Host "=== 8. Code generation (Freezed + Riverpod + JSON) ===" -ForegroundColor Cyan
& "$FlutterBin\flutter.bat" pub run build_runner build --delete-conflicting-outputs

Pop-Location

Write-Host ""
Write-Host "=== DONE ===" -ForegroundColor Green
Write-Host "Next: cd $ProjectRoot ; flutter run -d chrome"
Write-Host "  (chrome = web preview, no Android SDK required)"
