# Implement from Tasks

Execute implementation based on task checklist.

**Task file**: $ARGUMENTS

## Workflow

### Step 1: Load Tasks
```bash
cat $ARGUMENTS
```
Parse checklist to identify:
- Total tasks
- Completed tasks (marked [x])
- Next pending task
- Task phases and priorities

### Step 2: Task Execution Loop

For each pending task:

#### a. Announce Task
```
[3/15] Implementing data models...
```

#### b. Implement
- Show relevant code being created/modified
- Follow design specifications
- Apply best practices

#### c. Verify
Quick check that implementation works:
- Syntax validation
- Type checking (if TypeScript)
- Basic functionality test

#### d. Update Progress
Mark task complete in both:
- $ARGUMENTS: Change `- [ ]` to `- [x]`

#### e. Handle Blockers
If blocked:
- Suggest resolution
- Move to next non-blocked task if possible

### Step 3: Phase Completion

After each phase:
```bash
# Quick validation
npm run lint
```

Report phase status:
```
✅ Phase 1: Foundation - Complete (4/4 tasks)
🏗️ Phase 2: Core Features - In Progress (2/6 tasks)
```

### Step 4: Continuous Feedback

Every 5 tasks or phase completion:
- Show overall progress bar
- Estimate remaining work
- Check if build still passes

### Step 5: Final Verification

When all tasks complete:
```bash
npm run lint
npm run build
```

### Step 6: Completion Report

Generate summary:
```markdown
## Implementation Complete

### Statistics
- Total tasks: X
- Files created: Z
- Files modified: W

### Deliverables
- Feature: [name]
- Location: [path]
- Entry point: [file]

### Testing
Manual test checklist available in specs/*/test-plan.md(if exists)

### Next Steps
1. Run application and test feature
2. Review code quality
3. Submit for review
```

### Error Recovery
If implementation fails:
- Suggest fixes
- Option to retry or skip
