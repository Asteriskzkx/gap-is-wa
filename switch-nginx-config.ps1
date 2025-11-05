# PowerShell Script to switch between local and Azure nginx configuration

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Blue
Write-Host "  Nginx Config Switcher" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""

# Check if nginx config files exist
if (-not (Test-Path "nginx.conf")) {
    Write-Host "Error: nginx.conf not found!" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "nginx.azure.conf")) {
    Write-Host "Error: nginx.azure.conf not found!" -ForegroundColor Red
    exit 1
}

Write-Host "Available configurations:" -ForegroundColor Green
Write-Host "  1) Local Development (with SSL)" -ForegroundColor Yellow
Write-Host "     - Uses nginx.conf" -ForegroundColor Gray
Write-Host "     - HTTPS enabled on port 443" -ForegroundColor Gray
Write-Host "     - SSL certificates required" -ForegroundColor Gray
Write-Host ""
Write-Host "  2) Azure Production (without SSL)" -ForegroundColor Yellow
Write-Host "     - Uses nginx.azure.conf" -ForegroundColor Gray
Write-Host "     - HTTP only on port 80" -ForegroundColor Gray
Write-Host "     - Azure handles SSL/TLS" -ForegroundColor Gray
Write-Host ""
Write-Host "  3) Show config differences" -ForegroundColor Yellow
Write-Host "  4) Exit" -ForegroundColor Yellow
Write-Host ""

$choice = Read-Host "Enter choice [1-4]"

switch ($choice) {
    "1" {
        Write-Host "`nSwitching to Local Development config..." -ForegroundColor Yellow
        Write-Host "✓ Using nginx.conf (with SSL)" -ForegroundColor Green
        Write-Host "✓ Start with: docker-compose up -d" -ForegroundColor Green
        Write-Host "✓ Access: https://localhost" -ForegroundColor Green
        Write-Host ""
        Write-Host "Notes:" -ForegroundColor Cyan
        Write-Host "- Make sure SSL certificates exist in ssl/ folder" -ForegroundColor Gray
        Write-Host "- If not, run: openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ssl/server.key -out ssl/server.crt -subj '/C=TH/ST=Bangkok/L=Bangkok/O=Development/OU=IT/CN=localhost'" -ForegroundColor Gray
    }
    "2" {
        Write-Host "`nSwitching to Azure Production config..." -ForegroundColor Yellow
        Write-Host "✓ Using nginx.azure.conf (without SSL)" -ForegroundColor Green
        Write-Host "✓ Test with: docker-compose -f docker-compose.azure.yml up -d" -ForegroundColor Green
        Write-Host "✓ Access: http://localhost:8080" -ForegroundColor Green
        Write-Host ""
        Write-Host "Notes:" -ForegroundColor Cyan
        Write-Host "- This simulates Azure environment locally" -ForegroundColor Gray
        Write-Host "- No SSL certificates needed" -ForegroundColor Gray
        Write-Host "- Azure handles HTTPS in production" -ForegroundColor Gray
    }
    "3" {
        Write-Host "`nKey Differences:" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "nginx.conf (Local):" -ForegroundColor Yellow
        Write-Host "- Listens on ports 80 and 443" -ForegroundColor Gray
        Write-Host "- SSL/TLS configuration included" -ForegroundColor Gray
        Write-Host "- Redirects HTTP to HTTPS" -ForegroundColor Gray
        Write-Host "- Requires SSL certificates" -ForegroundColor Gray
        Write-Host ""
        Write-Host "nginx.azure.conf (Azure):" -ForegroundColor Yellow
        Write-Host "- Listens on port 80 only" -ForegroundColor Gray
        Write-Host "- No SSL/TLS configuration" -ForegroundColor Gray
        Write-Host "- No HTTP to HTTPS redirect" -ForegroundColor Gray
        Write-Host "- Trusts Azure Load Balancer IPs" -ForegroundColor Gray
        Write-Host "- Forwards X-Forwarded-Proto header" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Checking file sizes..." -ForegroundColor Cyan
        $localSize = (Get-Item "nginx.conf").Length
        $azureSize = (Get-Item "nginx.azure.conf").Length
        Write-Host "nginx.conf: $localSize bytes" -ForegroundColor Gray
        Write-Host "nginx.azure.conf: $azureSize bytes" -ForegroundColor Gray
    }
    "4" {
        Write-Host "`nExiting..." -ForegroundColor Green
        exit 0
    }
    default {
        Write-Host "`nInvalid choice" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Blue
Write-Host "Done!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""
Write-Host "Need help? Check:" -ForegroundColor Cyan
Write-Host "- NGINX_AZURE_GUIDE.md for detailed explanations" -ForegroundColor Gray
Write-Host "- AZURE_DEPLOYMENT.md for deployment guide" -ForegroundColor Gray
