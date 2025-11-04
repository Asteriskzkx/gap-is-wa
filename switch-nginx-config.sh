#!/bin/bash

# Script to switch between local and Azure nginx configuration

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Nginx Config Switcher${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check current config
if [ -L "nginx.conf.active" ]; then
    CURRENT=$(readlink nginx.conf.active)
    echo -e "${GREEN}Current config:${NC} $CURRENT"
else
    echo -e "${YELLOW}No active config symlink found${NC}"
fi

echo ""
echo "Select configuration:"
echo "  1) Local Development (with SSL)"
echo "  2) Azure Production (without SSL)"
echo "  3) Show current config"
echo "  4) Exit"
echo ""
read -p "Enter choice [1-4]: " choice

case $choice in
    1)
        echo -e "${YELLOW}Switching to Local Development config...${NC}"
        cp nginx.conf docker-compose.yml.bak 2>/dev/null || true
        echo -e "${GREEN}✓ Using nginx.conf (with SSL)${NC}"
        echo -e "${GREEN}✓ Start with: docker-compose up -d${NC}"
        echo -e "${GREEN}✓ Access: https://localhost${NC}"
        ;;
    2)
        echo -e "${YELLOW}Switching to Azure Production config...${NC}"
        cp nginx.azure.conf docker-compose.yml.bak 2>/dev/null || true
        echo -e "${GREEN}✓ Using nginx.azure.conf (without SSL)${NC}"
        echo -e "${GREEN}✓ Test with: docker-compose -f docker-compose.azure.yml up -d${NC}"
        echo -e "${GREEN}✓ Access: http://localhost:8080${NC}"
        ;;
    3)
        echo -e "${BLUE}Current nginx.conf content:${NC}"
        head -n 20 nginx.conf
        echo ""
        echo -e "${BLUE}Current nginx.azure.conf content:${NC}"
        head -n 20 nginx.azure.conf
        ;;
    4)
        echo -e "${GREEN}Exiting...${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Done!${NC}"
echo -e "${BLUE}========================================${NC}"
