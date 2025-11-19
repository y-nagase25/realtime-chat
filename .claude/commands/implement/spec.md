# Implement from Specification

Implement feature from a detailed specification file.

**Requirements spec file path**: $ARGUMENTS

## Workflow

### Step 1: Read Specification
```bash
cat $ARGUMENTS
```

Parse specification for:
- Feature overview
- Technical requirements
- User stories
- API contracts
- Data models
- UI/UX requirements

### Step 2: Validate Specification

Check for:
- [ ] Clear acceptance criteria
- [ ] Defined inputs/outputs
- [ ] Error handling requirements
- [ ] Performance requirements
- [ ] Security considerations

Ask for clarification if anything is unclear.

### Step 3: Create Design Document

File: `specs/[YYYYMMDDHHMM]_[feature_name]/design.md`

Extract key implementation details from spec (max 2000 chars).

### Step 4: Generate Implementation Checklist

File: `specs/[YYYYMMDDHHMM]_[feature_name]/tasks.md`

Based on spec, create checklist:
- [ ] Data models/types
- [ ] Database schema (if needed)
- [ ] API endpoints (if needed)
- [ ] Business logic
- [ ] UI components
- [ ] Form validation
- [ ] Error handling
- [ ] Loading states
- [ ] Success feedback
- [ ] Tests (if specified)

### Step 5: Implement Step-by-Step

For each checklist item:
1. Show what will be implemented
2. Implement it
3. Verify it works
4. Move to next item

Show progress: `[3/10] Implementing API endpoints...`

### Step 6: Specification Compliance Check

Verify implementation against original spec:
- [ ] All requirements met
- [ ] All user stories covered
- [ ] All edge cases handled
- [ ] Performance requirements met
- [ ] Security requirements met

### Step 7: Final Verification
```bash
npm run lint
npm run build
```

### Step 8: Generate Test Plan

Based on spec, create manual test plan:
```markdown
## Test Plan

### Happy Path
1. Step 1
2. Step 2
3. Expected result

### Error Cases
1. Test invalid input
2. Test network error
3. Test edge cases

### Edge Cases
1. Empty data
2. Maximum values
3. Special characters
```

### Step 9: Summary

Report:
- ✅ Requirements implemented
- 📋 Checklist completion
- 🧪 Test plan
- 📝 Any deviations from spec (with reasons)

---

**Specification**: $ARGUMENTS

**Begin implementation now.**
