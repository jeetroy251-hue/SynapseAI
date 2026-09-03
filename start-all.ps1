param(
    [switch]$Install,
    [switch]$NoRedis
)

$root = $PSScriptRoot
$backend = Join-Path $root "backend"
$frontend = Join-Path $root "frontend"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Cortex AI - Project Launcher" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

function Install-Deps {
    Write-Host "[1/5] Installing gateway dependencies..." -ForegroundColor Yellow
    Push-Location (Join-Path $backend "gateway")
    npm install
    Pop-Location

    Write-Host "[2/5] Installing auth service dependencies..." -ForegroundColor Yellow
    Push-Location (Join-Path $backend "services\auth")
    npm install
    Pop-Location

    Write-Host "[3/5] Installing chat service dependencies..." -ForegroundColor Yellow
    Push-Location (Join-Path $backend "services\chat")
    npm install
    Pop-Location

    Write-Host "[4/5] Installing agent service dependencies..." -ForegroundColor Yellow
    Push-Location (Join-Path $backend "services\agent")
    npm install
    Pop-Location

    Write-Host "[5/5] Installing frontend dependencies..." -ForegroundColor Yellow
    Push-Location $frontend
    npm install
    Pop-Location

    Write-Host "All dependencies installed." -ForegroundColor Green
}

function Start-Redis {
    Write-Host "Starting Redis via Docker..." -ForegroundColor Yellow
    docker compose -f (Join-Path $backend "docker-compose.yml") up -d
    if ($LASTEXITCODE -ne 0) {
        Write-Host "WARNING: Docker may not be running. Redis is required for auth/sessions." -ForegroundColor Red
    } else {
        Write-Host "Redis started on port 6379." -ForegroundColor Green
    }
}

function Start-Service {
    param([string]$Name, [string]$Dir, [string]$ScriptPath)

    Write-Host "Starting $Name..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$Dir'; node '$ScriptPath'" -WindowStyle Normal
    Start-Sleep -Seconds 2
    Write-Host "  $Name launched." -ForegroundColor Green
}

if ($Install) {
    Install-Deps
    exit
}

if (-not $NoRedis) {
    Start-Redis
}

Start-Service -Name "Gateway (port 8000)" -Dir (Join-Path $backend "gateway") -ScriptPath (Join-Path $backend "gateway\index.js")
Start-Service -Name "Auth Service (port 8001)" -Dir (Join-Path $backend "services\auth") -ScriptPath (Join-Path $backend "services\auth\index.js")
Start-Service -Name "Chat Service (port 8002)" -Dir (Join-Path $backend "services\chat") -ScriptPath (Join-Path $backend "services\chat\index.js")
Start-Service -Name "Agent Service (port 8003)" -Dir (Join-Path $backend "services\agent") -ScriptPath (Join-Path $backend "services\agent\index.js")

Write-Host "Starting Frontend (port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$frontend'; npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 2
Write-Host "  Frontend launched." -ForegroundColor Green

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  All services launched!" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Frontend : http://localhost:5173"
Write-Host "  Gateway  : http://localhost:8000"
Write-Host "  Auth     : http://localhost:8001"
Write-Host "  Chat     : http://localhost:8002"
Write-Host "  Agent    : http://localhost:8003"
Write-Host "  Redis    : redis://localhost:6379"
Write-Host "==========================================" -ForegroundColor Cyan
