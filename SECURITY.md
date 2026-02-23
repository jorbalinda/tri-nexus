# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Currently supported versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of tri-nexus seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### Please do the following:

1. **Do NOT** open a public GitHub issue
2. Email your findings to the repository maintainers
3. Include as much information as possible:
   - Type of vulnerability
   - Full paths of source file(s) related to the vulnerability
   - Location of the affected source code (tag/branch/commit or direct URL)
   - Step-by-step instructions to reproduce the issue
   - Proof-of-concept or exploit code (if possible)
   - Impact of the issue, including how an attacker might exploit it

### What to expect:

- Acknowledgment of your report within 48 hours
- Regular updates on the progress of addressing the vulnerability
- Credit for the discovery (unless you prefer to remain anonymous)
- Notification when the vulnerability is fixed

## Automated Security Scanning

This project uses automated security scanning via GitHub Actions:

- **Dependency Scanning**: Checks for known vulnerabilities in npm packages
- **Static Code Analysis**: CodeQL and Semgrep scan the codebase
- **Secret Detection**: TruffleHog prevents accidental credential commits
- **Weekly Scans**: Automated scans run every Monday

## Security Best Practices

When contributing to this project:

1. **Keep dependencies updated**: Run `npm audit` regularly
2. **No secrets in code**: Never commit API keys, passwords, or tokens
3. **Input validation**: Always validate and sanitize user inputs
4. **Authentication**: Use secure authentication patterns
5. **Environment variables**: Use `.env` files for sensitive configuration (never committed)
6. **HTTPS only**: All external API calls should use HTTPS
7. **TypeScript strict mode**: Enable strict type checking

## Security Features

- Supabase authentication with Row Level Security (RLS)
- Server-side API routes for sensitive operations
- Environment variable protection
- Content Security Policy headers
- CORS configuration

## Known Security Considerations

- This application handles sensitive athlete data - always follow data protection best practices
- Race plans and workout data should be protected by RLS policies
- API routes should validate user authentication and authorization

## Dependencies

Security vulnerabilities in dependencies are automatically detected by:
- GitHub Dependabot
- npm audit (in CI/CD)
- Snyk scanning (when configured)

Dependency updates are reviewed and applied regularly.

## Disclosure Policy

When we receive a security bug report, we will:

1. Confirm the problem and determine affected versions
2. Audit code to find any similar problems
3. Prepare fixes for all supported versions
4. Release new security patch versions as soon as possible

## Comments on This Policy

If you have suggestions on how this process could be improved, please submit a pull request.

