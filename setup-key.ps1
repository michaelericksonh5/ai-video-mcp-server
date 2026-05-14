# AI Video Generator -- Secure API Key Setup
# Run this script to safely configure your fal.ai or Gemini API key.
# Your key is read securely and never echoed to the terminal.

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("fal", "gemini", "both")]
    [string]$Provider = "fal"
)

$configPath = "$env:APPDATA\Claude\claude_desktop_config.json"
$pluginPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$distPath = Join-Path $pluginPath "dist\index.js"

Write-Host ""
Write-Host "=== AI Video Generator -- API Key Setup ===" -ForegroundColor Cyan
Write-Host ""

# Read key(s) securely
$falKey = $null
$geminiKey = $null

if ($Provider -eq "fal" -or $Provider -eq "both") {
    Write-Host "Enter your fal.ai API key (starts with key_):" -ForegroundColor Yellow
    Write-Host "Get one at: https://fal.ai/dashboard/keys" -ForegroundColor Gray
    $falSecure = Read-Host -AsSecureString "FAL_KEY"
    $falKey = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($falSecure)
    )
    if (-not $falKey.StartsWith("key_")) {
        Write-Host "Warning: fal.ai keys usually start with 'key_'. Double-check your key." -ForegroundColor Yellow
    }
}

if ($Provider -eq "gemini" -or $Provider -eq "both") {
    Write-Host ""
    Write-Host "Enter your Google Gemini API key:" -ForegroundColor Yellow
    Write-Host "Get one at: https://aistudio.google.com/app/apikey" -ForegroundColor Gray
    $geminiSecure = Read-Host -AsSecureString "GEMINI_API_KEY"
    $geminiKey = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($geminiSecure)
    )
}

# Load or create config
Write-Host ""
Write-Host "Updating Claude Desktop config..." -ForegroundColor Cyan

if (Test-Path $configPath) {
    $config = Get-Content $configPath -Raw | ConvertFrom-Json
} else {
    Write-Host "Config file not found, creating: $configPath" -ForegroundColor Yellow
    $config = [PSCustomObject]@{ mcpServers = [PSCustomObject]@{} }
    New-Item -ItemType Directory -Force (Split-Path $configPath) | Out-Null
}

if (-not $config.mcpServers) {
    $config | Add-Member -NotePropertyName "mcpServers" -NotePropertyValue ([PSCustomObject]@{})
}

# Build env block
$env = [PSCustomObject]@{}
if ($falKey) {
    $env | Add-Member -NotePropertyName "FAL_KEY" -NotePropertyValue $falKey
}
if ($geminiKey) {
    $env | Add-Member -NotePropertyName "GEMINI_API_KEY" -NotePropertyValue $geminiKey
}

# Build the ai-video server block
$serverBlock = [PSCustomObject]@{
    command = "node"
    args    = @($distPath.Replace("\", "\\"))
    env     = $env
}

# Add or replace the ai-video entry
if ($config.mcpServers | Get-Member -Name "ai-video" -ErrorAction SilentlyContinue) {
    $config.mcpServers."ai-video" = $serverBlock
} else {
    $config.mcpServers | Add-Member -NotePropertyName "ai-video" -NotePropertyValue $serverBlock
}

# Write back
$config | ConvertTo-Json -Depth 10 | Set-Content $configPath -Encoding UTF8

# Clear key variables from memory
$falKey = $null
$geminiKey = $null
[System.GC]::Collect()

Write-Host ""
Write-Host "Done! Config saved to:" -ForegroundColor Green
Write-Host "  $configPath" -ForegroundColor Gray
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Restart Claude Desktop" -ForegroundColor White
Write-Host "  2. Ask Claude: 'Check my video API keys'" -ForegroundColor White
Write-Host ""
Write-Host "SECURITY: Your key was never displayed or written to any log." -ForegroundColor Green
