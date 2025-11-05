# Azure Deployment Script for GAP Information System (PowerShell)
# This script automates the deployment of the application to Azure Container Apps

$ErrorActionPreference = "Stop"

# Configuration
$RESOURCE_GROUP = "gap-is-wa-rg"
$LOCATION = "southeastasia"
$CONTAINER_REGISTRY = "gapcontainerreg"
$DB_SERVER_NAME = "gap-is-wa-db"
$DB_ADMIN_USER = "gapuser"
$CONTAINER_ENV = "gap-is-wa-env"
$CONTAINER_APP = "gap-is-wa-app"

Write-Host "========================================" -ForegroundColor Green
Write-Host "  GAP IS-WA Azure Deployment Script" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Check if Azure CLI is installed
try {
    az version | Out-Null
} catch {
    Write-Host "Error: Azure CLI is not installed" -ForegroundColor Red
    Write-Host "Please install: https://learn.microsoft.com/cli/azure/install-azure-cli"
    exit 1
}

# Check if logged in
Write-Host "Checking Azure login status..." -ForegroundColor Yellow
try {
    az account show | Out-Null
    Write-Host "✓ Logged in to Azure" -ForegroundColor Green
} catch {
    Write-Host "Not logged in. Please login to Azure..." -ForegroundColor Yellow
    az login
}
Write-Host ""

# Prompt for database password
$DB_PASSWORD = Read-Host "Please enter a secure password for PostgreSQL (min 8 characters)" -AsSecureString
$DB_PASSWORD_PLAIN = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($DB_PASSWORD))
Write-Host ""

# Prompt for NextAuth secret
Write-Host "Please enter a NEXTAUTH_SECRET (min 32 characters):" -ForegroundColor Yellow
Write-Host "Or press Enter to generate one automatically" -ForegroundColor Yellow
$NEXTAUTH_SECRET = Read-Host
if ([string]::IsNullOrWhiteSpace($NEXTAUTH_SECRET)) {
    $bytes = New-Object byte[] 32
    (New-Object Security.Cryptography.RNGCryptoServiceProvider).GetBytes($bytes)
    $NEXTAUTH_SECRET = [Convert]::ToBase64String($bytes)
    Write-Host "Generated NEXTAUTH_SECRET" -ForegroundColor Green
}
Write-Host ""

# Create Resource Group
Write-Host "Creating Resource Group: $RESOURCE_GROUP" -ForegroundColor Yellow
az group create `
  --name $RESOURCE_GROUP `
  --location $LOCATION
Write-Host "✓ Resource Group created" -ForegroundColor Green
Write-Host ""

# Create Container Registry
Write-Host "Creating Container Registry: $CONTAINER_REGISTRY" -ForegroundColor Yellow
az acr create `
  --resource-group $RESOURCE_GROUP `
  --name $CONTAINER_REGISTRY `
  --sku Basic
Write-Host "✓ Container Registry created" -ForegroundColor Green
Write-Host ""

# Build and Push Docker Image
Write-Host "Building and pushing Docker image..." -ForegroundColor Yellow
az acr build `
  --registry $CONTAINER_REGISTRY `
  --image gap-is-wa:latest `
  .
Write-Host "✓ Docker image built and pushed" -ForegroundColor Green
Write-Host ""

# Create Container Apps Environment
Write-Host "Creating Container Apps Environment: $CONTAINER_ENV" -ForegroundColor Yellow
az containerapp env create `
  --name $CONTAINER_ENV `
  --resource-group $RESOURCE_GROUP `
  --location $LOCATION
Write-Host "✓ Container Apps Environment created" -ForegroundColor Green
Write-Host ""

# Create PostgreSQL Flexible Server
Write-Host "Creating PostgreSQL Database: $DB_SERVER_NAME" -ForegroundColor Yellow
az postgres flexible-server create `
  --name $DB_SERVER_NAME `
  --resource-group $RESOURCE_GROUP `
  --location $LOCATION `
  --admin-user $DB_ADMIN_USER `
  --admin-password $DB_PASSWORD_PLAIN `
  --sku-name Standard_B1ms `
  --tier Burstable `
  --storage-size 32 `
  --version 15 `
  --public-access 0.0.0.0 `
  --yes
Write-Host "✓ PostgreSQL Database created" -ForegroundColor Green
Write-Host ""

# Construct DATABASE_URL
$DB_HOST = "$DB_SERVER_NAME.postgres.database.azure.com"
$DATABASE_URL = "postgresql://$($DB_ADMIN_USER):$($DB_PASSWORD_PLAIN)@$($DB_HOST):5432/postgres?sslmode=require"

# Deploy Container App
Write-Host "Deploying Container App: $CONTAINER_APP" -ForegroundColor Yellow
az containerapp create `
  --name $CONTAINER_APP `
  --resource-group $RESOURCE_GROUP `
  --environment $CONTAINER_ENV `
  --image "$CONTAINER_REGISTRY.azurecr.io/gap-is-wa:latest" `
  --target-port 3000 `
  --ingress external `
  --registry-server "$CONTAINER_REGISTRY.azurecr.io" `
  --cpu 0.5 `
  --memory 1.0Gi `
  --min-replicas 0 `
  --max-replicas 3 `
  --env-vars `
    NODE_ENV=production `
    DATABASE_URL="$DATABASE_URL" `
    NEXTAUTH_SECRET="$NEXTAUTH_SECRET" `
    POSTGRES_SSL=true
Write-Host "✓ Container App deployed" -ForegroundColor Green
Write-Host ""

# Get the application URL
Write-Host "Getting application URL..." -ForegroundColor Yellow
$APP_URL = az containerapp show `
  --name $CONTAINER_APP `
  --resource-group $RESOURCE_GROUP `
  --query properties.configuration.ingress.fqdn `
  --output tsv

# Update NEXTAUTH_URL
Write-Host "Updating NEXTAUTH_URL..." -ForegroundColor Yellow
az containerapp update `
  --name $CONTAINER_APP `
  --resource-group $RESOURCE_GROUP `
  --set-env-vars NEXTAUTH_URL="https://$APP_URL"
Write-Host "✓ NEXTAUTH_URL updated" -ForegroundColor Green
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Deployment Complete! 🎉" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Application URL: " -NoNewline -ForegroundColor Green
Write-Host "https://$APP_URL"
Write-Host "Resource Group: " -NoNewline -ForegroundColor Green
Write-Host $RESOURCE_GROUP
Write-Host "Location: " -NoNewline -ForegroundColor Green
Write-Host $LOCATION
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Visit your application at: https://$APP_URL"
Write-Host "2. Run database migrations (if needed)"
Write-Host "3. Monitor your application in Azure Portal"
Write-Host "4. Set up custom domain (optional)"
Write-Host ""
Write-Host "Important:" -ForegroundColor Yellow
Write-Host "- Save your DATABASE_URL and NEXTAUTH_SECRET securely"
Write-Host "- Monitor your Azure credit usage in Azure Portal"
Write-Host "- Set up budget alerts to avoid unexpected charges"
Write-Host ""
Write-Host "Happy deploying! 🚀" -ForegroundColor Green
