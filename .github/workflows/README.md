# GitHub Actions Security Workflows

This directory contains automated security scanning workflows for the tri-nexus project.

## Workflows

### 1. Security Vulnerability Scan (`security-scan.yml`)

This comprehensive workflow runs on every push to the main branch and includes:

#### **Dependency Scan**
- Runs `npm audit` to check for known vulnerabilities in dependencies
- Generates a JSON report for detailed analysis
- Uploads audit reports as artifacts for review

#### **CodeQL Analysis**
- Performs static code analysis using GitHub's CodeQL
- Scans for security vulnerabilities and code quality issues
- Uses extended security queries for thorough analysis
- Results are uploaded to GitHub Security tab

#### **Dependency Review** (Pull Requests only)
- Reviews dependency changes in pull requests
- Fails on moderate or higher severity vulnerabilities
- Blocks GPL-3.0 and AGPL-3.0 licenses

#### **Secret Scanning**
- Uses TruffleHog to detect accidentally committed secrets
- Scans for API keys, passwords, tokens, etc.
- Only reports verified secrets to reduce false positives

#### **Security Summary**
- Provides a consolidated summary of all security scans
- Shows pass/fail status for each security check

### 2. SAST Security Scan (`sast-scan.yml`)

Static Application Security Testing workflow that includes:

#### **ESLint Security Analysis**
- Runs ESLint with security-focused plugins
- Detects common security anti-patterns in JavaScript/TypeScript

#### **TypeScript Strict Mode Check**
- Ensures TypeScript strict mode compliance
- Catches potential type-related bugs that could lead to vulnerabilities

#### **Semgrep Scan**
- Runs Semgrep with multiple security rulesets:
  - General security audit rules
  - React-specific security patterns
  - TypeScript best practices
  - OWASP Top 10 vulnerabilities
  - XSS prevention patterns
- Uploads results in SARIF format to GitHub Security

#### **Snyk Scan** (requires SNYK_TOKEN secret)
- Scans for vulnerabilities in dependencies and code
- Checks all project manifests
- Alerts on medium severity and above

## Triggers

Both workflows are triggered by:
- **Push to main branch**: Runs all security checks automatically
- **Pull Requests to main**: Runs checks before merging
- **Weekly Schedule** (security-scan.yml only): Runs every Monday at 9:00 AM UTC

## Setup Requirements

### Required GitHub Permissions

The workflows require the following permissions (already configured):
- `contents: read` - Read repository contents
- `security-events: write` - Upload security findings
- `actions: read` - Access workflow run information

### Optional: Snyk Integration

To enable Snyk scanning:

1. Sign up for a free Snyk account at https://snyk.io
2. Get your Snyk API token from your account settings
3. Add it as a GitHub secret named `SNYK_TOKEN`:
   - Go to Repository Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `SNYK_TOKEN`
   - Value: Your Snyk API token

If `SNYK_TOKEN` is not configured, the Snyk scan will be skipped.

## Viewing Results

### Security Tab
- Navigate to the **Security** tab in your GitHub repository
- View **Code scanning alerts** for CodeQL and Semgrep findings
- Check **Dependabot alerts** for dependency vulnerabilities

### Actions Tab
- View detailed workflow runs and logs
- Download npm audit reports from artifacts
- Review security scan summaries

### Pull Requests
- Security checks will appear as status checks
- Dependency review will comment on PRs with new vulnerabilities
- Failed checks will prevent merging (if required)

## Best Practices

1. **Review all security alerts promptly**
2. **Don't disable security checks** unless absolutely necessary
3. **Keep dependencies up to date** regularly
4. **Address high-severity issues** before merging to main
5. **Review the weekly scan results** to catch newly disclosed vulnerabilities

## Troubleshooting

### npm audit fails with vulnerabilities
- Review the audit report artifact
- Update vulnerable dependencies: `npm audit fix`
- For breaking changes, manually update in package.json

### CodeQL analysis fails
- Check the build logs in the Actions tab
- Ensure the project builds successfully
- May need to adjust autobuild configuration

### False positives
- Review findings in the Security tab
- Dismiss false positives with justification
- Consider adjusting rule configurations

## Customization

You can customize these workflows by:
- Adjusting severity thresholds (`moderate`, `high`, `critical`)
- Adding/removing security tools
- Modifying schedule frequency
- Adding notifications (Slack, email, etc.)

## Additional Security Tools

Consider adding these tools for enhanced security:

- **Trivy**: Container vulnerability scanning (if using Docker)
- **OWASP Dependency-Check**: Additional dependency analysis
- **SonarCloud**: Code quality and security analysis
- **GitLeaks**: Additional secret scanning

## Resources

- [GitHub Advanced Security](https://docs.github.com/en/code-security)
- [CodeQL Documentation](https://codeql.github.com/docs/)
- [Semgrep Rules](https://semgrep.dev/explore)
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [Snyk Documentation](https://docs.snyk.io/)

