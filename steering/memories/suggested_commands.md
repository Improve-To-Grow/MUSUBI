# Suggested Commands

Frequently used commands for musubi-sdd.

## Package Management

```bash
# Install dependencies
npm install

# Add new dependency
npm install <package>

# Update dependencies
npm update
```

## Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test <file>

# Run with coverage
npm run test:coverage
```

## Code Quality

```bash
# Lint
npm run lint

# Format
npm run format

# Type check (if TypeScript)
npm run type-check
```

## Code Navigation

Symbol questions go to the code index before grep (`CLAUDE.md` "Code Navigation").

```bash
musubi-code refs <Name>          # definition, exports, every reference ("No definition named" = absent)
musubi-code callers <Name>       # functions that call or instantiate it
musubi-code symbols <file>       # what a file defines and exports
musubi-code deps <file>          # what a file loads
musubi-code dependents <file>    # what loads a file
musubi-code status               # index state and roots
```

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/<feature-name>

# Commit with conventional commits
git commit -m "feat: add new feature"

# Push and create PR
git push -u origin feature/<feature-name>
```

---

_Add your frequently used commands here_
