# Security Checklist for Developers

## Before Committing

- [ ] No API keys, tokens, or passwords in code
- [ ] Sensitive config in `.env` files (not committed)
- [ ] Run `npm audit` and fix vulnerabilities
- [ ] No console.logs with sensitive data
- [ ] Input validation on all user inputs
- [ ] SQL injection prevention (use parameterized queries)
- [ ] XSS prevention (sanitize outputs)

## Before Creating a Pull Request

- [ ] All tests pass
- [ ] No ESLint security warnings
- [ ] TypeScript strict mode enabled
- [ ] Review Dependabot alerts
- [ ] Check for newly added dependencies

## When Adding Dependencies

```bash
# Check package before installing
npm info <package-name>

# Install and audit
npm install <package-name>
npm audit

# Fix vulnerabilities
npm audit fix
```

## Common Security Issues to Avoid

### ❌ DON'T
```typescript
// Hardcoded secrets
const API_KEY = "sk_live_123456789"

// Direct SQL queries
db.query(`SELECT * FROM users WHERE id = ${userId}`)

// Unvalidated user input
const userInput = req.body.data
await saveToDatabase(userInput)

// Exposing sensitive data
console.log("User password:", password)
```

### ✅ DO
```typescript
// Use environment variables
const API_KEY = process.env.NEXT_PUBLIC_API_KEY

// Use parameterized queries (Supabase)
const { data } = await supabase
  .from('users')
  .select()
  .eq('id', userId)

// Validate and sanitize input
const schema = z.object({
  email: z.string().email(),
  name: z.string().max(100)
})
const validData = schema.parse(req.body)

// Never log sensitive data
console.log("User logged in:", { userId: user.id })
```

## Environment Variables

Never commit these to git:
- API keys
- Database credentials
- OAuth secrets
- JWT secrets
- Third-party service tokens

Always use `.env.local` for sensitive values.

## Supabase Security

```typescript
// ✅ Use Row Level Security (RLS)
// Enable RLS on all tables
// Create policies for each user role

// ✅ Server-side operations for sensitive data
// Use API routes for write operations
// Validate user permissions server-side

// ✅ Use Supabase Auth
// Don't implement custom auth
// Use built-in session management
```

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [npm audit docs](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [Supabase Security](https://supabase.com/docs/guides/auth)

## Quick Commands

```bash
# Run security audit
npm audit

# Fix fixable vulnerabilities
npm audit fix

# Check for outdated packages
npm outdated

# Run type checking
npx tsc --noEmit

# Run linter
npm run lint
```

## Getting Help

If you discover a security vulnerability:
1. Do NOT create a public issue
2. Report privately to maintainers
3. See SECURITY.md for full details

