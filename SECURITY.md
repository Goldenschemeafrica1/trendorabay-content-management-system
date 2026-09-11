# Security Maintenance Guide

## Dependency Management

### Regular Security Audits

Run security audits regularly to identify and fix vulnerabilities in dependencies.

#### Backend
```bash
cd backend
npm audit              # Check for vulnerabilities
npm audit fix          # Auto-fix vulnerabilities (safe updates)
npm audit fix --force  # Force fix (may include breaking changes)
```

#### Frontend
```bash
cd frontend
npm audit              # Check for vulnerabilities
npm audit fix          # Auto-fix vulnerabilities (safe updates)
npm audit fix --force  # Force fix (may include breaking changes)
```

### Outdated Dependencies

Check for outdated packages to keep dependencies up to date.

#### Backend
```bash
cd backend
npm outdated           # List outdated packages
npm update             # Update packages (minor/patch versions)
```

#### Frontend
```bash
cd frontend
npm outdated           # List outdated packages
npm update             # Update packages (minor/patch versions)
```

### Automated Dependency Update Script

Use the provided script to check both backend and frontend dependencies at once:

```bash
./scripts/update-dependencies.sh
```

This script will:
- Check for outdated packages in both backend and frontend
- Run security audits on both
- Show major version updates available
- Provide update recommendations

### Major Version Updates

For major version updates (which may include breaking changes), use `npm-check-updates`:

```bash
# Install globally if not already installed
npm install -g npm-check-updates

# Check for updates
ncu

# Update package.json to latest versions
ncu -u

# Install the updated packages
npm install
```

**⚠️ Always test your application thoroughly after updating dependencies, especially major versions.**

## CI/CD Security Checks

### GitHub Actions Workflow

A GitHub Actions workflow is provided to automatically run security checks on every push and pull request.

**File:** `.github/workflows/security.yml`

The workflow will:
- Run `npm audit` on both backend and frontend
- Check for outdated dependencies
- Fail the build if critical vulnerabilities are found
- Create issues for security alerts

### Running Security Checks Locally

Before pushing code, run the security checks locally:

```bash
# Backend
cd backend
npm audit
npm outdated

# Frontend
cd frontend
npm audit
npm outdated
```

## Security Best Practices

### 1. Regular Updates
- Run dependency checks at least once a month
- Address critical vulnerabilities immediately
- Keep development and production dependencies in sync

### 2. Lock Files
- Commit `package-lock.json` (backend) and `package-lock.json` (frontend) to version control
- This ensures consistent dependency versions across environments
- Use `npm ci` instead of `npm install` in production for faster, reliable builds

### 3. Vulnerability Monitoring
- Enable GitHub Dependabot for automated dependency updates
- Subscribe to security advisories for your dependencies
- Review security bulletins for Node.js and Express

### 4. Dependency Hygiene
- Remove unused dependencies regularly
- Prefer packages with active maintenance
- Check package health (downloads, issues, last update) before adding

### 5. Testing After Updates
- Always run full test suite after dependency updates
- Test critical user flows
- Check for breaking changes in major version updates

## Security Scripts Reference

### Backend Scripts
- `npm run audit` - Check for vulnerabilities
- `npm run audit:fix` - Auto-fix vulnerabilities
- `npm run audit:fix:force` - Force fix vulnerabilities
- `npm run outdated` - List outdated packages
- `npm run update` - Update packages
- `npm run update:check` - Check for major updates

### Frontend Scripts
- `npm run audit` - Check for vulnerabilities
- `npm run audit:fix` - Auto-fix vulnerabilities
- `npm run audit:fix:force` - Force fix vulnerabilities
- `npm run outdated` - List outdated packages
- `npm run update` - Update packages
- `npm run update:check` - Check for major updates

## Emergency Response

If a critical vulnerability is discovered:

1. **Immediate Action**
   - Run `npm audit` to identify affected packages
   - Check the vulnerability severity and impact
   - Review the security advisory details

2. **Mitigation**
   - Apply `npm audit fix` if available
   - If no fix available, consider:
     - Downgrading to a safe version
     - Implementing a workaround
     - Disabling the affected functionality temporarily

3. **Communication**
   - Notify stakeholders of the vulnerability
   - Document the issue and resolution
   - Update audit logs with the incident

4. **Prevention**
   - Review how the vulnerable package was introduced
   - Add security checks to prevent similar issues
   - Update dependency review process

## Resources

- [npm Audit Documentation](https://docs.npmjs.com/cli/v9/commands/npm-audit)
- [npm-check-updates](https://github.com/raineorshine/npm-check-updates)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [OWASP Dependency Check](https://owasp.org/www-project-dependency-check/)
- [GitHub Dependabot](https://docs.github.com/en/code-security/dependabot)
