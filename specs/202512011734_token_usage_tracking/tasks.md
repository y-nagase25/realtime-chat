# Implementation Tasks: OpenAI API Token Usage Tracking

## Phase 1: Foundation (P0 Requirements)

### 1.1 Environment Setup

- [x] **TASK-001**: Install Supabase client library
  - Run: `npm install @supabase/supabase-js`
  - Verify installation in `package.json`
  - Estimated: 2 minutes

- [x] **TASK-002**: Add Supabase environment variables to `.env`
  - Add `SUPABASE_URL=https://[project-ref].supabase.co`
  - Add `SUPABASE_SERVICE_ROLE_KEY=eyJ...` (or `SUPABASE_ANON_KEY`)
  - Add `.env` to `.gitignore` if not already present
  - Document required variables in README (optional)
  - Estimated: 5 minutes

### 1.2 Database Setup

- [x] **TASK-003**: Create `token_usage` table in Supabase
  - Open Supabase SQL Editor
  - Execute table creation SQL from design spec
  - Verify table appears in Table Editor
  - Estimated: 3 minutes

- [x] **TASK-004**: Create database indexes
  - Execute index creation SQL from design spec
  - Verify indexes in Supabase dashboard
  - Estimated: 2 minutes

- [x] **TASK-005**: Test database schema with manual inserts
  - Run test INSERT statements from design spec
  - Verify data appears correctly
  - Test constraint validation (invalid api_type should fail)
  - Clean up test data
  - Estimated: 5 minutes

### 1.3 TypeScript Type Definitions

- [x] **TASK-006**: Create `lib/types/db.ts`
  - Define `ApiType` enum type
  - Define `TokenUsageInsert` interface
  - Define `TokenUsageRow` interface
  - Define `Database` schema type for Supabase client
  - Estimated: 10 minutes

## Phase 2: Core Implementation (P0 Requirements)

### 2.1 Supabase Client Setup

- [x] **TASK-007**: Create `lib/supabase.ts`
  - Implement `getSupabaseClient()` with singleton pattern
  - Add environment variable validation
  - Configure client options (no session persistence)
  - Add TypeScript type parameter for Database schema
  - Estimated: 15 minutes

- [x] **TASK-008**: Test Supabase client initialization
  - Create simple test script or route
  - Verify client can connect to Supabase
  - Verify environment variables are loaded correctly
  - Test error handling for missing credentials
  - Estimated: 10 minutes

### 2.2 Token Usage Tracking Utility

- [x] **TASK-009**: Create `lib/utils/track-usage.ts`
  - Implement `trackTokenUsage()` base function
  - Add comprehensive error handling (try-catch, logging)
  - Implement fire-and-forget pattern
  - Add JSDoc comments
  - Estimated: 20 minutes

- [x] **TASK-010**: Implement `trackTextGeneration()` helper
  - Create wrapper function for text generation API
  - Map parameters to `TokenUsageInsert` type
  - Add type safety for usage object
  - Estimated: 10 minutes

- [x] **TASK-011**: Implement `trackTranscription()` helper
  - Create wrapper function for Whisper API
  - Map duration and cost to `TokenUsageInsert` type
  - Hard-code model name as 'whisper-1'
  - Estimated: 10 minutes

- [ ] **TASK-012**: Implement `trackRealtimeSession()` helper
  - Create wrapper function for Realtime API
  - Map model name to `TokenUsageInsert` type
  - Set cost to 0 for session creation
  - Estimated: 10 minutes

### 2.3 API Route Modifications

- [ ] **TASK-013**: Update `/api/text/route.ts` for token tracking
  - Import `trackTextGeneration` utility
  - Extract usage data from OpenAI response
  - Calculate total cost as numeric value
  - Call `trackTextGeneration()` with fire-and-forget pattern
  - Verify existing functionality still works
  - Estimated: 15 minutes

- [ ] **TASK-014**: Update `/api/transcribe/route.ts` for token tracking
  - Import `trackTranscription` utility
  - Add audio duration to request (client-side) OR implement server-side extraction
  - Calculate cost using existing `calculateWhisperCost()` function
  - Call `trackTranscription()` with fire-and-forget pattern
  - Verify existing functionality still works
  - Estimated: 20 minutes

- [ ] **TASK-015**: Update `/api/realtime/session/route.ts` for token tracking
  - Import `trackRealtimeSession` utility
  - Extract model name from session response
  - Call `trackRealtimeSession()` with fire-and-forget pattern
  - Verify existing functionality still works
  - Estimated: 10 minutes

### 2.4 Cost Calculation Updates

- [ ] **TASK-016**: Update `calculateCost()` in `/api/text/route.ts` to handle cached tokens
  - Add cached token cost calculation
  - Update return type to include `cachedCost`
  - Verify cached token pricing is correct (90% discount)
  - Test with cached token usage data
  - Estimated: 15 minutes

## Phase 3: Testing & Validation (P0 Requirements)

### 3.1 Manual Testing

- [ ] **TASK-017**: Test `/api/text` endpoint
  - Call endpoint via browser or Postman
  - Check Supabase dashboard for new record
  - Verify all fields populated correctly (tokens, cost, model)
  - Verify cost calculation matches expected value
  - Estimated: 10 minutes

- [ ] **TASK-018**: Test `/api/transcribe` endpoint
  - Upload audio file via test client
  - Check Supabase dashboard for new record
  - Verify audio_duration_seconds and cost are correct
  - Verify model_name is 'whisper-1'
  - Estimated: 10 minutes

- [ ] **TASK-019**: Test `/api/realtime/session` endpoint
  - Call endpoint to create session
  - Check Supabase dashboard for new record
  - Verify model_name and api_type are correct
  - Verify cost_usd is 0
  - Estimated: 10 minutes

- [ ] **TASK-020**: Test error handling - Invalid Supabase credentials
  - Temporarily set invalid `SUPABASE_URL` or key
  - Call all three API endpoints
  - Verify API responses still work (fire-and-forget)
  - Check logs for proper error messages
  - Restore valid credentials
  - Estimated: 15 minutes

- [ ] **TASK-021**: Test error handling - Database write failure
  - Create scenario where DB write fails (permissions, network)
  - Verify API endpoints continue to work
  - Verify errors are logged with proper context
  - Estimated: 10 minutes

### 3.2 Data Validation

- [ ] **TASK-022**: Verify no sensitive data in database
  - Query recent records in Supabase dashboard
  - Check metadata field doesn't contain API keys or secrets
  - Verify only expected data is stored
  - Estimated: 5 minutes

- [ ] **TASK-023**: Verify cost calculations match expected values
  - Calculate expected costs manually for test requests
  - Compare with `cost_usd` values in database
  - Check for rounding errors or calculation bugs
  - Estimated: 10 minutes

- [ ] **TASK-024**: Verify timestamps are correct
  - Check `created_at` values in database
  - Verify timezone is UTC (TIMESTAMPTZ)
  - Ensure timestamps match request times
  - Estimated: 5 minutes

### 3.3 Performance Validation

- [ ] **TASK-025**: Measure API response time impact
  - Record baseline response times (before tracking)
  - Record response times with tracking enabled
  - Verify impact is < 50ms (or 0ms with fire-and-forget)
  - Document results
  - Estimated: 15 minutes

- [ ] **TASK-026**: Test concurrent requests
  - Send 10-20 concurrent requests to each endpoint
  - Verify all requests complete successfully
  - Check Supabase dashboard for all records
  - Verify no rate limiting or connection issues
  - Estimated: 15 minutes

## Phase 4: Polish & Documentation (P1 Requirements)

### 4.1 Enhanced Metadata (P1)

- [ ] **TASK-027**: Add request metadata to tracking calls (optional)
  - Extract user agent from request headers
  - Extract IP address (if available via headers)
  - Generate or extract session ID
  - Add metadata to `trackTokenUsage()` calls
  - Test metadata appears correctly in database
  - Estimated: 20 minutes

### 4.2 Code Quality

- [ ] **TASK-028**: Add comprehensive error logging
  - Review all error catch blocks
  - Ensure structured logging format is used consistently
  - Add timestamps to log messages
  - Test log output readability
  - Estimated: 10 minutes

- [ ] **TASK-029**: Code review and refactoring
  - Review all new code for consistency
  - Check TypeScript types are correctly applied
  - Verify JSDoc comments are complete
  - Follow project code style (Biome)
  - Estimated: 15 minutes

- [ ] **TASK-030**: Run linter and formatter
  - Run `npm run lint` to check for issues
  - Run `npm run format` to format code
  - Fix any linting warnings or errors
  - Estimated: 5 minutes

### 4.3 Documentation

- [ ] **TASK-031**: Update project README (optional)
  - Document new environment variables
  - Add section about token usage tracking
  - Link to database schema documentation
  - Estimated: 10 minutes

- [ ] **TASK-032**: Add code comments for maintainability
  - Comment complex logic sections
  - Add TODO comments for future enhancements
  - Document fire-and-forget pattern rationale
  - Estimated: 10 minutes

## Phase 5: Nice-to-Have Enhancements (P2 Requirements)

### 5.1 Database Indexes (Already Done in Phase 1)

- [x] **TASK-004**: Create indexes on created_at, api_type, model_name
  - Completed in Phase 1.2

### 5.2 Batch Writing (Future Enhancement)

- [ ] **TASK-033**: Implement in-memory queue for batch writes (OPTIONAL)
  - Create queue data structure
  - Implement batch insertion logic
  - Add flush interval timer (every N seconds)
  - Test with high-volume scenarios
  - Estimated: 60+ minutes
  - **Note**: Skip for MVP, only implement if needed for scale

## Testing Checklist Summary

### Functional Testing
- [ ] `/api/text` records token usage correctly
- [ ] `/api/transcribe` records audio duration and cost
- [ ] `/api/realtime/session` records session creation
- [ ] All API endpoints work when tracking fails
- [ ] Cost calculations are accurate
- [ ] No sensitive data leaked to database

### Non-Functional Testing
- [ ] Response time impact < 50ms (or 0ms)
- [ ] Handles 100+ concurrent requests
- [ ] Error logging is comprehensive
- [ ] TypeScript types prevent runtime errors

### Database Testing
- [ ] Table schema matches specification
- [ ] Constraints prevent invalid data
- [ ] Indexes improve query performance
- [ ] JSONB metadata field works correctly

## Deployment Checklist

- [ ] All P0 tasks completed and tested
- [ ] Database table and indexes created in production Supabase
- [ ] Environment variables configured in production
- [ ] Code merged to main branch
- [ ] Deploy application
- [ ] Monitor logs for tracking errors
- [ ] Verify data appears in production Supabase dashboard
- [ ] Update documentation

## Rollback Plan

If issues occur post-deployment:

1. **Remove tracking calls** from API routes (comment out or delete)
2. **Redeploy application**
3. **Keep database table** (data preserved for analysis)
4. **Fix issues** in development environment
5. **Re-enable tracking** after verification

## Task Summary

| Phase | Total Tasks | Estimated Time |
|-------|-------------|----------------|
| Phase 1: Foundation | 6 tasks | ~27 minutes |
| Phase 2: Core Implementation | 10 tasks | ~145 minutes |
| Phase 3: Testing & Validation | 10 tasks | ~120 minutes |
| Phase 4: Polish & Documentation | 6 tasks | ~70 minutes |
| Phase 5: Nice-to-Have | 1 task (optional) | 60+ minutes |

**Total P0 Tasks**: 26 tasks (~362 minutes / ~6 hours)
**Total P1 Tasks**: 4 tasks (~70 minutes / ~1.2 hours)
**Total P2 Tasks**: 1 task (optional) (~60 minutes / ~1 hour)

## Priority Breakdown

### Must Complete (P0)
- All Phase 1 tasks (Foundation)
- All Phase 2 tasks (Core Implementation)
- All Phase 3 tasks (Testing & Validation)

### Should Complete (P1)
- TASK-027: Enhanced metadata tracking
- TASK-028 to TASK-032: Code quality and documentation

### Nice to Have (P2)
- TASK-033: Batch writing (only if needed for scale)

## Next Steps

1. Review this task list with stakeholders
2. Set up development environment (install dependencies)
3. Create database table in Supabase
4. Begin Phase 1 implementation
5. Test incrementally after each phase
6. Deploy to production after P0 completion

## Notes

- **Audio Duration**: For TASK-014, recommend starting with client-side duration calculation (simpler). Can migrate to server-side parsing later if needed.
- **Fire-and-Forget**: The fire-and-forget pattern is critical for non-blocking behavior. Don't await tracking calls in API routes.
- **Error Handling**: All tracking errors should be logged but never thrown. API functionality is the priority.
- **Testing**: Manual testing is sufficient for MVP. Automated tests can be added later as needed.

## Revision History

| Date | Version | Author | Changes |
|------|---------|--------|---------|
| 2025-12-01 | 1.0 | Claude Code | Initial task breakdown |
