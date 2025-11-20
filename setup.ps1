<#
One-stop setup script for SubPoly repository (PowerShell)

Usage:
  .\setup.ps1

What it does:
  - Checks for Node and npm
  - Installs backend dependencies and runs tests
  - Installs frontend dependencies and builds the site
  - Checks for wrangler and prints guidance
#>

function Abort($msg) {
    Write-Error $msg
    exit 1
}

Write-Host "Starting SubPoly setup..."

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Abort "Node.js 未检测到。请安装 Node.js v18+ 并重试。"
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Abort "npm 未检测到。请安装 Node.js（包含 npm）并重试。"
}

Write-Host "Node:" (node -v)
Write-Host "npm:" (npm -v)

$root = Split-Path -Parent $MyInvocation.MyCommand.Definition

$backend = Join-Path $root 'workers\poly-workers'
if (Test-Path $backend) {
    Write-Host "\n== 后端: $backend =="
    Push-Location $backend
    Write-Host "安装后端依赖..."
    npm install
    if (Test-Path package.json -and (Get-Content package.json | Select-String 'test')) {
        Write-Host "运行后端测试..."
        npm test || Write-Warning "后端测试失败，请查看上方输出。"
    }
    Pop-Location
} else {
    Write-Warning "未找到后端目录: $backend"
}

$frontend = Join-Path $root 'page\poly-page'
if (Test-Path $frontend) {
    Write-Host "\n== 前端: $frontend =="
    Push-Location $frontend
    Write-Host "安装前端依赖..."
    npm install
    Write-Host "构建前端..."
    npm run build --if-present || Write-Warning "前端构建可能失败，请查看日志。"
    Pop-Location
} else {
    Write-Warning "未找到前端目录: $frontend"
}

Write-Host "\n== wrangler 检查 =="
if (Get-Command wrangler -ErrorAction SilentlyContinue) {
    Write-Host "wrangler 已安装：" (wrangler --version)
    Write-Host "你现在可运行 wrangler d1/create 或 wrangler deploy 等命令进行 Cloudflare 操作。"
} else {
    Write-Warning "wrangler 未安装。若需部署至 Cloudflare Workers，请安装 wrangler: `npm i -g wrangler` 并进行 `wrangler login`。"
}

Write-Host "\nSetup 完成。查看输出以确认所有步骤均成功。"
