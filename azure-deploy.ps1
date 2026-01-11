# Azure Deployment Script for GAP Information System (PowerShell)
# This script automates the deployment of the application to Azure Container Apps

$ErrorActionPreference = "Stop"

# Configuration
$LOCATION = "southeastasia"
$SUFFIX = (Get-Random -Minimum 10000 -Maximum 99999)

# Note: Some Azure resource names must be globally unique.
$RESOURCE_GROUP = "gap-is-wa-rg"
$CONTAINER_REGISTRY = ("gapcontainerreg{0}" -f $SUFFIX)  # must be lowercase alphanumeric
$DB_SERVER_NAME = ("gap-is-wa-db-{0}" -f $SUFFIX)        # must be globally unique
$DB_ADMIN_USER = "gapuser"
$DB_NAME = "gapdb"
$CONTAINER_ENV = ("gap-is-wa-env-{0}" -f $SUFFIX)
$CONTAINER_APP = ("gap-is-wa-app-{0}" -f $SUFFIX)

function Ensure-AzExtension {
  param(
    [Parameter(Mandatory = $true)][string]$Name
  )

  $installed = az extension list --query "[?name=='$Name'].name" -o tsv 2>$null
  if (-not $installed) {
    Write-Host "Installing Azure CLI extension: $Name" -ForegroundColor Yellow
    az extension add --name $Name | Out-Null
  } else {
    az extension update --name $Name | Out-Null
  }
}

function Ensure-AzProviderRegistered {
  param(
    [Parameter(Mandatory = $true)][string]$Namespace
  )

  $state = az provider show --namespace $Namespace --query registrationState -o tsv 2>$null
  if ($state -ne "Registered") {
    Write-Host "Registering Azure provider: $Namespace" -ForegroundColor Yellow
    az provider register --namespace $Namespace | Out-Null

    for ($i = 0; $i -lt 60; $i++) {
      Start-Sleep -Seconds 5
      $state = az provider show --namespace $Namespace --query registrationState -o tsv 2>$null
      if ($state -eq "Registered") { break }
    }

    if ($state -ne "Registered") {
      throw "Provider $Namespace is not registered yet (state=$state). Try again in a few minutes."
    }
  }
}

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

# Ensure required providers/extensions
Ensure-AzExtension -Name "containerapp"
Ensure-AzProviderRegistered -Namespace "Microsoft.App"
Ensure-AzProviderRegistered -Namespace "Microsoft.OperationalInsights"
Ensure-AzProviderRegistered -Namespace "Microsoft.ContainerRegistry"
Ensure-AzProviderRegistered -Namespace "Microsoft.DBforPostgreSQL"

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

# Optional but recommended app defaults
Write-Host "Please enter DEFAULT_PASSWORD (used when generating user accounts):" -ForegroundColor Yellow
Write-Host "Or press Enter to generate one automatically" -ForegroundColor Yellow
$DEFAULT_PASSWORD = Read-Host
if ([string]::IsNullOrWhiteSpace($DEFAULT_PASSWORD)) {
  $bytes = New-Object byte[] 16
  (New-Object Security.Cryptography.RNGCryptoServiceProvider).GetBytes($bytes)
  $DEFAULT_PASSWORD = [Convert]::ToBase64String($bytes)
  Write-Host "Generated DEFAULT_PASSWORD" -ForegroundColor Green
}
Write-Host ""

Write-Host "Default admin seed (used by prisma db seed):" -ForegroundColor Yellow
$DEFAULT_ADMIN_EMAIL = Read-Host "DEFAULT_ADMIN_EMAIL (default: admin@example.com)"
if ([string]::IsNullOrWhiteSpace($DEFAULT_ADMIN_EMAIL)) { $DEFAULT_ADMIN_EMAIL = "admin@example.com" }

$DEFAULT_ADMIN_PASSWORD_SEC = Read-Host "DEFAULT_ADMIN_PASSWORD (press Enter to generate)" -AsSecureString
$DEFAULT_ADMIN_PASSWORD_PLAIN = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($DEFAULT_ADMIN_PASSWORD_SEC))
if ([string]::IsNullOrWhiteSpace($DEFAULT_ADMIN_PASSWORD_PLAIN)) {
  $bytes = New-Object byte[] 16
  (New-Object Security.Cryptography.RNGCryptoServiceProvider).GetBytes($bytes)
  $DEFAULT_ADMIN_PASSWORD_PLAIN = [Convert]::ToBase64String($bytes)
  Write-Host "Generated DEFAULT_ADMIN_PASSWORD" -ForegroundColor Green
}

$DEFAULT_ADMIN_NAME = Read-Host "DEFAULT_ADMIN_NAME (default: System Admin)"
if ([string]::IsNullOrWhiteSpace($DEFAULT_ADMIN_NAME)) { $DEFAULT_ADMIN_NAME = "System Admin" }
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

# Enable admin user for easier Container Apps image pull (good for student/demo environments)
az acr update --name $CONTAINER_REGISTRY --admin-enabled true | Out-Null

$ACR_USERNAME = az acr credential show --name $CONTAINER_REGISTRY --query username -o tsv
$ACR_PASSWORD = az acr credential show --name $CONTAINER_REGISTRY --query "passwords[0].value" -o tsv

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

# Build and Push Migration Image
Write-Host "Building and pushing Prisma migration image..." -ForegroundColor Yellow
az acr build `
  --registry $CONTAINER_REGISTRY `
  --image gap-is-wa-migrate:latest `
  --file Dockerfile.migrate `
  .
Write-Host "✓ Migration image built and pushed" -ForegroundColor Green
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
  --database-name $DB_NAME `
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
$DATABASE_URL = "postgresql://$($DB_ADMIN_USER):$($DB_PASSWORD_PLAIN)@$($DB_HOST):5432/$DB_NAME?sslmode=require"

# Run Prisma migrations/seeds via Container Apps Job (one-off)
$MIGRATE_JOB = "$CONTAINER_APP-migrate"
Write-Host "Creating migration job: $MIGRATE_JOB" -ForegroundColor Yellow
az containerapp job create `
  --name $MIGRATE_JOB `
  --resource-group $RESOURCE_GROUP `
  --environment $CONTAINER_ENV `
  --trigger-type Manual `
  --replica-timeout 1800 `
  --replica-retry-limit 1 `
  --image "$CONTAINER_REGISTRY.azurecr.io/gap-is-wa-migrate:latest" `
  --registry-server "$CONTAINER_REGISTRY.azurecr.io" `
  --registry-username $ACR_USERNAME `
  --registry-password $ACR_PASSWORD `
  --cpu 0.5 `
  --memory 1.0Gi `
  --env-vars "DATABASE_URL=$DATABASE_URL" "DEFAULT_ADMIN_EMAIL=$DEFAULT_ADMIN_EMAIL" "DEFAULT_ADMIN_PASSWORD=$DEFAULT_ADMIN_PASSWORD_PLAIN" "DEFAULT_ADMIN_NAME=$DEFAULT_ADMIN_NAME" | Out-Null

Write-Host "Starting migration job..." -ForegroundColor Yellow
az containerapp job start --name $MIGRATE_JOB --resource-group $RESOURCE_GROUP | Out-Null
Write-Host "✓ Migration job started (check logs if needed)" -ForegroundColor Green
Write-Host ""

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
  --registry-username $ACR_USERNAME `
  --registry-password $ACR_PASSWORD `
  --cpu 0.5 `
  --memory 1.0Gi `
  --min-replicas 0 `
  --max-replicas 3 `
  --env-vars "NODE_ENV=production" "DATABASE_URL=$DATABASE_URL" "NEXTAUTH_SECRET=$NEXTAUTH_SECRET" "DEFAULT_PASSWORD=$DEFAULT_PASSWORD" "DEFAULT_ADMIN_EMAIL=$DEFAULT_ADMIN_EMAIL" "DEFAULT_ADMIN_PASSWORD=$DEFAULT_ADMIN_PASSWORD_PLAIN" "DEFAULT_ADMIN_NAME=$DEFAULT_ADMIN_NAME" "POSTGRES_SSL=true"
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
