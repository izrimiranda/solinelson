# Script para rodar Frontend React + Backend PHP simultaneamente
# Uso: .\dev.ps1

Write-Host "Iniciando servidores de desenvolvimento..." -ForegroundColor Green
Write-Host ""

# Verificar se esta na pasta correta
if (-not (Test-Path "package.json")) {
    Write-Host "Erro: package.json nao encontrado!" -ForegroundColor Red
    Write-Host "Execute este script na raiz do projeto"
    exit 1
}

if (-not (Test-Path "api")) {
    Write-Host "Erro: pasta /api/ nao encontrada!" -ForegroundColor Red
    exit 1
}

# Atualizar PATH na sessao atual
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

Write-Host "Iniciando PHP Server (porta 8000)..." -ForegroundColor Cyan
$phpJob = Start-Job -ScriptBlock {
    param($path, $location)
    $env:Path = $path
    Set-Location $location
    php -S localhost:8000
} -ArgumentList $env:Path, $PWD

Start-Sleep -Seconds 2

if ($phpJob.State -eq "Running") {
    Write-Host "PHP Server rodando em http://localhost:8000" -ForegroundColor Green
} else {
    Write-Host "Falha ao iniciar PHP Server" -ForegroundColor Red
    Receive-Job -Job $phpJob
    exit 1
}

Write-Host ""
Write-Host "Iniciando Vite Server..." -ForegroundColor Cyan
$viteJob = Start-Job -ScriptBlock {
    param($path, $location)
    $env:Path = $path
    Set-Location $location
    npm run dev
} -ArgumentList $env:Path, $PWD

Start-Sleep -Seconds 3

if ($viteJob.State -eq "Running") {
    Write-Host "Vite Server iniciado" -ForegroundColor Green
    Write-Host ""
    Write-Host "======================================" -ForegroundColor Blue
    Write-Host "SERVIDORES RODANDO!" -ForegroundColor Green
    Write-Host "======================================" -ForegroundColor Blue
    Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
    Write-Host "Backend:  http://localhost:8000" -ForegroundColor Cyan
    Write-Host "======================================" -ForegroundColor Blue
    Write-Host ""
    Write-Host "Pressione Ctrl+C para parar os servidores" -ForegroundColor Yellow
    Write-Host ""
    
    try {
        while ($true) {
            Start-Sleep -Seconds 1
            
            if ($phpJob.State -ne "Running") {
                Write-Host "PHP Server parou inesperadamente" -ForegroundColor Yellow
                Receive-Job -Job $phpJob
            }
            if ($viteJob.State -ne "Running") {
                Write-Host "Vite Server parou inesperadamente" -ForegroundColor Yellow
                Receive-Job -Job $viteJob
            }
            
            if ($phpJob.State -ne "Running" -and $viteJob.State -ne "Running") {
                break
            }
        }
    } finally {
        Write-Host ""
        Write-Host "Parando servidores..." -ForegroundColor Red
        Stop-Job -Job $phpJob -ErrorAction SilentlyContinue
        Remove-Job -Job $phpJob -ErrorAction SilentlyContinue
        Stop-Job -Job $viteJob -ErrorAction SilentlyContinue
        Remove-Job -Job $viteJob -ErrorAction SilentlyContinue
        Write-Host "Servidores finalizados" -ForegroundColor Green
    }
} else {
    Write-Host "Falha ao iniciar Vite Server" -ForegroundColor Red
    Receive-Job -Job $viteJob
    Stop-Job -Job $phpJob -ErrorAction SilentlyContinue
    Remove-Job -Job $phpJob -ErrorAction SilentlyContinue
    exit 1
}
