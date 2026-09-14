<#
  One-shot installer for PdfRenderService.

  Run this once on any machine, from any PowerShell (elevated or not —
  it will relaunch itself elevated automatically if needed).

  Safe to re-run any time — e.g. after `git pull`, after editing
  server.js, or if you just want to reset the service to a known state.

  Usage:
    Right-click install.ps1 -> "Run with PowerShell"
  or from a terminal:
    .\install.ps1
#>

$ErrorActionPreference = 'Stop'

# ---------------------------------------------------------------------
# 1. Self-elevate if not already running as Administrator.
#    Managing a Windows Service always requires elevation - rather than
#    failing partway through with a permissions error, just relaunch
#    this same script elevated and exit the current window.
# ---------------------------------------------------------------------
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "Not running as Administrator - relaunching an elevated window..." -ForegroundColor Yellow
    $scriptPath = $MyInvocation.MyCommand.Path
    Start-Process powershell -Verb RunAs -ArgumentList @(
        "-NoExit",
        "-ExecutionPolicy", "Bypass",
        "-File", "`"$scriptPath`""
    )
    exit
}

Set-Location $PSScriptRoot
Write-Host "Working directory: $PSScriptRoot" -ForegroundColor DarkGray

# ---------------------------------------------------------------------
# 2. Install npm dependencies. This also downloads Chromium into
#    .chrome-cache/ (per .puppeteerrc.cjs) - project-local, so it
#    doesn't matter which Windows account runs this or the service.
# ---------------------------------------------------------------------
Write-Host ""
Write-Host "==> Installing npm dependencies (downloads Chromium, ~150-300MB, can take a few minutes)..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) { throw "npm install failed" }

if (-not (Test-Path ".\node_modules\node-windows")) {
    Write-Host "==> Installing node-windows..." -ForegroundColor Cyan
    npm install node-windows
    if ($LASTEXITCODE -ne 0) { throw "npm install node-windows failed" }
}

# ---------------------------------------------------------------------
# 3. Remove any existing service registration first, so this script
#    can be safely re-run (e.g. after editing server.js) without
#    leaving a stale/duplicate service behind.
# ---------------------------------------------------------------------
Write-Host ""
Write-Host "==> Checking for an existing PdfRenderService..." -ForegroundColor Cyan
$existing = Get-Service -Name PdfRenderService -ErrorAction SilentlyContinue
if ($existing) {
    Write-Host "    Found existing service - removing it first so the reinstall is clean..."
    Stop-Service PdfRenderService -Force -ErrorAction SilentlyContinue
    node uninstall-service.js
    Start-Sleep -Seconds 2
    Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
} else {
    Write-Host "    None found - fresh install."
}

# ---------------------------------------------------------------------
# 4. Install and start the service.
# ---------------------------------------------------------------------
Write-Host ""
Write-Host "==> Installing PdfRenderService..." -ForegroundColor Cyan
node install-service.js
Start-Sleep -Seconds 3

# ---------------------------------------------------------------------
# 5. Verify.
# ---------------------------------------------------------------------
Write-Host ""
Write-Host "==> Verifying service status..." -ForegroundColor Cyan
$svc = Get-Service -Name PdfRenderService -ErrorAction SilentlyContinue
if ($svc -and $svc.Status -eq 'Running') {
    Write-Host "    Status: Running" -ForegroundColor Green
} else {
    Write-Host "    Status: $($svc.Status) - something may be wrong, check the 'daemon' folder for logs." -ForegroundColor Red
}

Write-Host ""
Write-Host "==> Checking health endpoint..." -ForegroundColor Cyan
$healthy = $false
for ($i = 0; $i -lt 5; $i++) {
    try {
        $resp = Invoke-RestMethod -Uri "http://127.0.0.1:4488/health" -TimeoutSec 5
        if ($resp.ok -eq $true) { $healthy = $true; break }
    } catch {
        Start-Sleep -Seconds 2
    }
}

Write-Host ""
if ($healthy) {
    Write-Host "PdfRenderService is installed and running at http://127.0.0.1:4488" -ForegroundColor Green
} else {
    Write-Host "Service did not respond to a health check after several tries." -ForegroundColor Red
    Write-Host "Check the 'daemon' folder for logs, or run 'node server.js' manually to see the raw error." -ForegroundColor Red
}

Write-Host ""
Read-Host "Press Enter to close this window"
