# Ship: Review and Create PR

Complete workflow: Review changes → Fix issues → Create PR

**Context**: $ARGUMENTS

## Workflow

### Phase 1: Safety Checks

1. Verify branch:
```bash
git branch --show-current
git status
```

Stop if:
- On `main` branch
- Uncommitted changes exist

2. Fetch latest main:
```bash
git fetch origin main
```

3. Check for conflicts:
```bash
git diff main...HEAD
```

### Phase 2: Automated Verification

Run all checks:
```bash
pnpm lint
pnpm build
```

If any fail:
- Show errors
- Ask if I should fix them
- Fix if approved
- Re-run checks

### Phase 3: Code Review

Analyze changes:
```bash
git diff main...HEAD
```

Review for:
- Code quality issues
- Security vulnerabilities
- Performance problems
- Missing error handling
- TypeScript issues

Generate review report.

### Phase 4: Fix Issues (if needed)

If issues found:
1. List all issues with severity
2. Ask which to fix now
3. Fix approved issues
4. Commit fixes
5. Re-run verification

### Phase 5: Generate PR Content

Create PR title and description:

**Title format**: `[type]: [concise description]`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `docs`: Documentation
- `style`: Styling changes
- `test`: Test additions
- `chore`: Maintenance

**Description**: Based on commits and changes

### Phase 6: Create PR
```bash
gh pr create \
  --title "[generated title]" \
  --body "[generated description]" \
  --base main \
  --assignee @me
```

### Phase 7: Post-PR Actions

1. Show PR URL
2. Suggest next steps:
   - Request reviewers
   - Link to Vercel preview
   - Monitor CI/CD

## User Context
$ARGUMENTS

---

**Start shipping now.**