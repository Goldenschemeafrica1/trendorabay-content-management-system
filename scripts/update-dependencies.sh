#!/bin/bash

# Dependency Update and Security Scan Script
# This script checks for outdated dependencies, runs security audits, and provides update recommendations

echo "=========================================="
echo "Dependency Update & Security Scan Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check for npm-check-updates
if ! command_exists ncu; then
    echo -e "${YELLOW}npm-check-updates not found. Installing globally...${NC}"
    npm install -g npm-check-updates
fi

# Backend section
echo -e "${BLUE}=== BACKEND DEPENDENCIES ===${NC}"
cd backend

echo -e "${YELLOW}Checking for outdated packages...${NC}"
npm outdated

echo ""
echo -e "${YELLOW}Running security audit...${NC}"
npm audit

echo ""
echo -e "${YELLOW}Checking for major version updates...${NC}"
ncu

# Frontend section
echo ""
echo -e "${BLUE}=== FRONTEND DEPENDENCIES ===${NC}"
cd ../frontend

echo -e "${YELLOW}Checking for outdated packages...${NC}"
npm outdated

echo ""
echo -e "${YELLOW}Running security audit...${NC}"
npm audit

echo ""
echo -e "${YELLOW}Checking for major version updates...${NC}"
ncu

# Return to root
cd ..

echo ""
echo "=========================================="
echo -e "${GREEN}Scan Complete!${NC}"
echo "=========================================="
echo ""
echo "Summary of actions:"
echo "1. Review the outdated packages listed above"
echo "2. Run 'npm audit fix' in backend/ or frontend/ to auto-fix vulnerabilities"
echo "3. For major updates, use 'ncu -u' to update package.json, then 'npm install'"
echo "4. Always test your application after updating dependencies"
echo ""
echo "To update all packages to latest versions:"
echo "  backend: cd backend && ncu -u && npm install"
echo "  frontend: cd frontend && ncu -u && npm install"
echo ""
