#!/bin/bash

# Security Scanning Script
# Runs automated security scans on the application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "=========================================="
echo "Security Scanning Script"
echo "=========================================="
echo ""

# Function to print section headers
print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
    echo ""
}

# Function to print success
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check if required tools are installed
check_tools() {
    print_header "Checking Required Tools"
    
    local tools=("npm" "node")
    local missing=()
    
    for tool in "${tools[@]}"; do
        if command -v $tool &> /dev/null; then
            print_success "$tool is installed"
        else
            print_error "$tool is not installed"
            missing+=($tool)
        fi
    done
    
    if [ ${#missing[@]} -gt 0 ]; then
        echo ""
        print_error "Missing tools: ${missing[*]}"
        echo "Please install missing tools and try again."
        exit 1
    fi
    
    echo ""
}

# Run npm audit on backend
audit_backend() {
    print_header "Backend Dependency Audit"
    
    cd backend
    
    if [ -f "package.json" ]; then
        echo "Running npm audit..."
        if npm audit --audit-level=moderate; then
            print_success "Backend audit passed"
        else
            print_warning "Backend audit found vulnerabilities"
        fi
    else
        print_warning "No package.json found in backend"
    fi
    
    cd ..
    echo ""
}

# Run npm audit on frontend
audit_frontend() {
    print_header "Frontend Dependency Audit"
    
    cd frontend
    
    if [ -f "package.json" ]; then
        echo "Running npm audit..."
        if npm audit --audit-level=moderate; then
            print_success "Frontend audit passed"
        else
            print_warning "Frontend audit found vulnerabilities"
        fi
    else
        print_warning "No package.json found in frontend"
    fi
    
    cd ..
    echo ""
}

# Check for outdated packages
check_outdated() {
    print_header "Checking for Outdated Packages"
    
    echo "Backend:"
    cd backend
    npm outdated || echo "No outdated packages or npm outdated not available"
    cd ..
    
    echo ""
    echo "Frontend:"
    cd frontend
    npm outdated || echo "No outdated packages or npm outdated not available"
    cd ..
    
    echo ""
}

# Run SAST with ESLint
run_sast() {
    print_header "Static Application Security Testing"
    
    echo "Backend:"
    cd backend
    if [ -f ".eslintrc.js" ] || [ -f ".eslintrc.json" ]; then
        npm run lint || print_warning "Linting found issues"
    else
        print_warning "No ESLint configuration found"
    fi
    cd ..
    
    echo ""
    echo "Frontend:"
    cd frontend
    if [ -f ".eslintrc.js" ] || [ -f ".eslintrc.json" ] || [ -f ".oxlintrc.json" ]; then
        npm run lint || print_warning "Linting found issues"
    else
        print_warning "No linter configuration found"
    fi
    cd ..
    
    echo ""
}

# Check for secrets in code
check_secrets() {
    print_header "Checking for Secrets in Code"
    
    echo "Scanning for potential secrets..."
    
    # Common secret patterns
    local patterns=(
        "password\s*=\s*['\"]"
        "api_key\s*=\s*['\"]"
        "secret\s*=\s*['\"]"
        "token\s*=\s*['\"]"
        "aws_access_key"
        "private_key"
    )
    
    local found=0
    
    for pattern in "${patterns[@]}"; do
        if grep -r -i "$pattern" backend/src frontend/src --exclude-dir=node_modules 2>/dev/null; then
            print_warning "Found potential secret pattern: $pattern"
            found=1
        fi
    done
    
    if [ $found -eq 0 ]; then
        print_success "No obvious secrets found"
    fi
    
    echo ""
}

# Check file permissions
check_permissions() {
    print_header "Checking File Permissions"
    
    echo "Checking for sensitive files with overly permissive permissions..."
    
    local sensitive_files=(
        ".env"
        "*.key"
        "*.pem"
        "id_rsa"
    )
    
    local issues=0
    
    for file in "${sensitive_files[@]}"; do
        if find . -name "$file" -type f -perm /o=r 2>/dev/null | grep -v node_modules; then
            print_warning "Found readable sensitive file: $file"
            issues=1
        fi
    done
    
    if [ $issues -eq 0 ]; then
        print_success "No permission issues found"
    fi
    
    echo ""
}

# Generate report
generate_report() {
    print_header "Security Scan Report"
    
    echo "Scan completed at: $(date)"
    echo ""
    echo "Summary:"
    echo "- Dependency audits completed"
    echo "- Outdated packages checked"
    echo "- Static analysis performed"
    echo "- Secret scan completed"
    echo "- Permission check completed"
    echo ""
    echo "Review the output above for any issues found."
    echo ""
    echo "For detailed analysis, consider using:"
    echo "- OWASP ZAP for dynamic application security testing"
    echo "- Burp Suite for manual penetration testing"
    echo "- Snyk for advanced dependency scanning"
}

# Main execution
main() {
    check_tools
    audit_backend
    audit_frontend
    check_outdated
    run_sast
    check_secrets
    check_permissions
    generate_report
    
    echo ""
    print_success "Security scan completed"
}

# Run main function
main
