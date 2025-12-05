# Token Usage Tracking Feature - Specification Overview

**Feature ID**: 202512011734_token_usage_tracking
**Created**: 2025-12-01
**Status**: Ready for Implementation

## Quick Links

- [Requirements Document](./requirements.md) - Full feature requirements and acceptance criteria
- [Design Document](./design.md) - Technical design and architecture
- [Task Checklist](./tasks.md) - Step-by-step implementation tasks

## Executive Summary

This feature implements automatic tracking of OpenAI API token consumption to Supabase database. All three API endpoints (Text Generation, Whisper Transcription, and Realtime Session) will record usage data including token counts, costs, and model information.

### Key Benefits

- **Cost Monitoring**: Track API spending across all OpenAI services
- **Usage Analytics**: Identify which models and APIs consume the most tokens
- **Historical Data**: Build foundation for future cost optimization and forecasting
- **Non-Invasive**: Zero impact on existing API functionality (fire-and-forget pattern)

## Scope

### In Scope ✅

- Automatic tracking for `/api/text`, `/api/transcribe`, `/api/realtime/session`
- Database table with token counts, costs, model names, timestamps
- Fire-and-forget pattern (tracking failures don't affect API)
- Supabase integration with connection pooling
- Cost calculation based on OpenAI pricing

### Out of Scope ❌

- User authentication/authorization
- Frontend UI dashboard
- Analytics endpoints
- Real-time alerts
- Multi-tenant support

## Technical Overview

### New Files

```
lib/
├── supabase.ts              # Supabase client (singleton)
├── types/
│   └── database.ts          # TypeScript types for DB schema
└── utils/
    └── track-usage.ts       # Token tracking utilities
```

### Modified Files

```
app/api/
├── text/route.ts            # Add tracking call
├── transcribe/route.ts      # Add tracking call
└── realtime/session/route.ts # Add tracking call
```

### Database Schema

**Table**: `token_usage`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `created_at` | TIMESTAMPTZ | API call timestamp |
| `api_type` | TEXT | API type enum |
| `model_name` | TEXT | OpenAI model used |
| `input_tokens` | INTEGER | Input tokens (nullable) |
| `output_tokens` | INTEGER | Output tokens (nullable) |
| `cached_tokens` | INTEGER | Cached tokens (nullable) |
| `audio_duration_seconds` | DECIMAL | Audio duration (nullable) |
| `cost_usd` | DECIMAL | Calculated cost |
| `metadata` | JSONB | Additional data (nullable) |

## Implementation Phases

### Phase 1: Foundation (~27 min)
- Install dependencies
- Configure environment variables
- Create database table and indexes
- Define TypeScript types

### Phase 2: Core Implementation (~145 min)
- Implement Supabase client
- Create tracking utility functions
- Update API routes
- Fix cost calculation for cached tokens

### Phase 3: Testing & Validation (~120 min)
- Manual testing of all endpoints
- Error handling verification
- Performance validation
- Data accuracy checks

### Phase 4: Polish & Documentation (~70 min)
- Enhanced metadata tracking (optional)
- Code quality improvements
- Documentation updates

**Total Estimated Time**: ~6 hours for core implementation (P0)

## Prerequisites

Before starting implementation:

1. ✅ **Supabase Project**: Configured with database access
2. ✅ **Environment Variables**: `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` available
3. ✅ **Database Permissions**: Ability to create tables and indexes
4. ✅ **npm Access**: Install `@supabase/supabase-js`

## Success Criteria

The feature is complete when:

- [ ] Database table created with correct schema
- [ ] All three API endpoints record token usage
- [ ] Cost calculations are accurate
- [ ] Tracking failures don't break API functionality
- [ ] No sensitive data in database
- [ ] Manual testing confirms data appears in Supabase

## Risk Mitigation

### Risk: Database write failures
**Mitigation**: Fire-and-forget pattern ensures API continues working

### Risk: Performance impact
**Mitigation**: Async writes, connection pooling, target < 50ms impact

### Risk: Incorrect cost calculations
**Mitigation**: Reuse existing logic, verify against OpenAI pricing

### Risk: Sensitive data exposure
**Mitigation**: Validate all data before insertion, no API keys in metadata

## Next Steps

1. **Review Documents**: Read through requirements, design, and tasks
2. **Environment Setup**: Install dependencies and configure Supabase
3. **Database Setup**: Create table and indexes in Supabase SQL Editor
4. **Start Implementation**: Begin with Phase 1 tasks
5. **Test Incrementally**: Verify each phase before moving to next

## Questions?

If you encounter issues during implementation:

1. Check the [Design Document](./design.md) for technical solutions
2. Review the [Requirements Document](./requirements.md) for acceptance criteria
3. Follow the [Task Checklist](./tasks.md) for step-by-step guidance

## Document Versions

| Document | Version | Last Updated |
|----------|---------|--------------|
| Requirements | 1.0 | 2025-12-01 |
| Design | 1.0 | 2025-12-01 |
| Tasks | 1.0 | 2025-12-01 |
| README | 1.0 | 2025-12-01 |
