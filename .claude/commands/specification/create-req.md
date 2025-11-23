# Create Requirements

Generate a detailed requirements specification from user input.

**User Input**: $ARGUMENTS

## Workflow

### Step 1: Parse User Input
Analyze the user's request to identify:
- Core functionality needed
- User goals and objectives
- Technical constraints mentioned
- Performance expectations

### Step 2: Clarify Requirements
If the input is vague or incomplete, ask specific questions:
- What is the primary use case?
- Who are the target users?
- What are the success criteria?
- Are there any technical constraints?
- What's the expected timeline?

### Step 3: Generate Requirements Document

Create file: `specs/[YYYYMMDDHHMM]_[feature_name]/requirements.md`

Structure:
```markdown
# Feature Requirements

## Overview
Brief description of the feature (2-3 sentences)

## User Stories
As a [user type], I want to [action] so that [benefit]

## Functional Requirements
### Must Have (P0)
- REQ-001: [Requirement description]
- REQ-002: [Requirement description]

### Should Have (P1)
- REQ-003: [Requirement description]

### Nice to Have (P2)
- REQ-004: [Requirement description]

## Technical Requirements
### Data Models
- Entity definitions
- Relationships
- Validation rules

### API Contracts
- Endpoints needed
- Request/response formats
- Error codes

### UI/UX Requirements
- Key screens/components
- User interactions
- Responsive requirements

## Non-Functional Requirements
### Performance
- Response time targets
- Concurrent user support

### Security
- Authentication requirements
- Authorization rules
- Data protection needs

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Out of Scope
- Items explicitly not included

## Dependencies
- External systems
- Third-party libraries
- Prerequisites
```

### Step 4: Validate Requirements
Review the generated requirements for:
- Completeness
- Clarity
- Feasibility
- Testability
- Consistency

### Step 5: Summary
Output:
- ✅ Requirements document created: `specs/[YYYYMMDDHHMM]_[feature_name]/requirements.md`
- 📋 Total requirements: X functional, Y technical
- 🎯 Priority breakdown: X P0, Y P1, Z P2
- Next step: Run `create-spec` to generate design and tasks