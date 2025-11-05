#!/bin/bash

# Azure Deployment Script for GAP Information System
# This script automates the deployment of the application to Azure Container Apps

set -e  # Exit on error

# Configuration
RESOURCE_GROUP="gap-is-wa-rg"
LOCATION="southeastasia"
CONTAINER_REGISTRY="gapcontainerreg"
DB_SERVER_NAME="gap-is-wa-db"
DB_ADMIN_USER="gapuser"
CONTAINER_ENV="gap-is-wa-env"
CONTAINER_APP="gap-is-wa-app"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  GAP IS-WA Azure Deployment Script${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo -e "${RED}Error: Azure CLI is not installed${NC}"
    echo "Please install: https://learn.microsoft.com/cli/azure/install-azure-cli"
    exit 1
fi

# Check if logged in
echo -e "${YELLOW}Checking Azure login status...${NC}"
if ! az account show &> /dev/null; then
    echo -e "${YELLOW}Not logged in. Please login to Azure...${NC}"
    az login
fi

echo -e "${GREEN}✓ Logged in to Azure${NC}"
echo ""

# Prompt for database password
echo -e "${YELLOW}Please enter a secure password for PostgreSQL (min 8 characters):${NC}"
read -s DB_PASSWORD
echo ""

# Prompt for NextAuth secret
echo -e "${YELLOW}Please enter a NEXTAUTH_SECRET (min 32 characters):${NC}"
echo -e "${YELLOW}Or press Enter to generate one automatically${NC}"
read NEXTAUTH_SECRET
if [ -z "$NEXTAUTH_SECRET" ]; then
    NEXTAUTH_SECRET=$(openssl rand -base64 32)
    echo -e "${GREEN}Generated NEXTAUTH_SECRET${NC}"
fi
echo ""

# Create Resource Group
echo -e "${YELLOW}Creating Resource Group: $RESOURCE_GROUP${NC}"
az group create \
  --name "$RESOURCE_GROUP" \
  --location "$LOCATION"
echo -e "${GREEN}✓ Resource Group created${NC}"
echo ""

# Create Container Registry
echo -e "${YELLOW}Creating Container Registry: $CONTAINER_REGISTRY${NC}"
az acr create \
  --resource-group "$RESOURCE_GROUP" \
  --name "$CONTAINER_REGISTRY" \
  --sku Basic
echo -e "${GREEN}✓ Container Registry created${NC}"
echo ""

# Build and Push Docker Image
echo -e "${YELLOW}Building and pushing Docker image...${NC}"
az acr build \
  --registry "$CONTAINER_REGISTRY" \
  --image gap-is-wa:latest \
  .
echo -e "${GREEN}✓ Docker image built and pushed${NC}"
echo ""

# Create Container Apps Environment
echo -e "${YELLOW}Creating Container Apps Environment: $CONTAINER_ENV${NC}"
az containerapp env create \
  --name "$CONTAINER_ENV" \
  --resource-group "$RESOURCE_GROUP" \
  --location "$LOCATION"
echo -e "${GREEN}✓ Container Apps Environment created${NC}"
echo ""

# Create PostgreSQL Flexible Server
echo -e "${YELLOW}Creating PostgreSQL Database: $DB_SERVER_NAME${NC}"
az postgres flexible-server create \
  --name "$DB_SERVER_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --location "$LOCATION" \
  --admin-user "$DB_ADMIN_USER" \
  --admin-password "$DB_PASSWORD" \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --storage-size 32 \
  --version 15 \
  --public-access 0.0.0.0 \
  --yes
echo -e "${GREEN}✓ PostgreSQL Database created${NC}"
echo ""

# Construct DATABASE_URL
DB_HOST="${DB_SERVER_NAME}.postgres.database.azure.com"
DATABASE_URL="postgresql://${DB_ADMIN_USER}:${DB_PASSWORD}@${DB_HOST}:5432/postgres?sslmode=require"

# Deploy Container App
echo -e "${YELLOW}Deploying Container App: $CONTAINER_APP${NC}"
az containerapp create \
  --name "$CONTAINER_APP" \
  --resource-group "$RESOURCE_GROUP" \
  --environment "$CONTAINER_ENV" \
  --image "${CONTAINER_REGISTRY}.azurecr.io/gap-is-wa:latest" \
  --target-port 3000 \
  --ingress external \
  --registry-server "${CONTAINER_REGISTRY}.azurecr.io" \
  --cpu 0.5 \
  --memory 1.0Gi \
  --min-replicas 0 \
  --max-replicas 3 \
  --env-vars \
    NODE_ENV=production \
    DATABASE_URL="$DATABASE_URL" \
    NEXTAUTH_SECRET="$NEXTAUTH_SECRET" \
    POSTGRES_SSL=true
echo -e "${GREEN}✓ Container App deployed${NC}"
echo ""

# Get the application URL
echo -e "${YELLOW}Getting application URL...${NC}"
APP_URL=$(az containerapp show \
  --name "$CONTAINER_APP" \
  --resource-group "$RESOURCE_GROUP" \
  --query properties.configuration.ingress.fqdn \
  --output tsv)

# Update NEXTAUTH_URL
echo -e "${YELLOW}Updating NEXTAUTH_URL...${NC}"
az containerapp update \
  --name "$CONTAINER_APP" \
  --resource-group "$RESOURCE_GROUP" \
  --set-env-vars NEXTAUTH_URL="https://${APP_URL}"
echo -e "${GREEN}✓ NEXTAUTH_URL updated${NC}"
echo ""

# Summary
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment Complete! 🎉${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${GREEN}Application URL:${NC} https://${APP_URL}"
echo -e "${GREEN}Resource Group:${NC} $RESOURCE_GROUP"
echo -e "${GREEN}Location:${NC} $LOCATION"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Visit your application at: https://${APP_URL}"
echo "2. Run database migrations (if needed)"
echo "3. Monitor your application in Azure Portal"
echo "4. Set up custom domain (optional)"
echo ""
echo -e "${YELLOW}Important:${NC}"
echo "- Save your DATABASE_URL and NEXTAUTH_SECRET securely"
echo "- Monitor your Azure credit usage in Azure Portal"
echo "- Set up budget alerts to avoid unexpected charges"
echo ""
echo -e "${GREEN}Happy deploying! 🚀${NC}"
