# Design Specification: Audio Recording Timeout

## Architecture Overview

This feature adds automatic timeout functionality to the existing `useRecording` hook. The implementation is entirely contained within the hook's existing timer effect, requiring no architectural changes or new components.

### Data Flow
```
Recording starts
  ↓
Timer effect starts (existing)
  ↓
Every 100ms: Update duration state
  ↓
Check: duration >= maxDuration? ──Yes──> Call stopRecording()
  ↓ No                                      ↓
Continue recording                    Cleanup & create blob
```

### Affected Components
- `lib/hooks/use-recording.ts` - Add timeout logic
- `components/speaking/AudioRecorder.tsx` - No changes (passes through maxDuration prop)

## Component Design

### Hook Layer: `useRecording`

#### Modified Interface
```typescript
export interface UseRecordingReturn {
  isRecording: boolean;
  audioLevel: number;
  duration: number;
  audioBlob: Blob | null;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  resetRecording: () => void;
}

// New parameter
export interface UseRecordingOptions {
  maxDuration?: number; // in milliseconds, default: 10000
}

export function useRecording(options?: UseRecordingOptions): UseRecordingReturn
```

#### Implementation Strategy

**Location**: Modify existing timer effect (lines 35-52 in `use-recording.ts`)

**Current behavior**:
- Timer updates duration every 100ms while recording
- No automatic stop mechanism

**New behavior**:
- Timer updates duration every 100ms while recording
- Check if `duration >= maxDuration`
- If true, call `stopRecording()` to trigger cleanup

**Key considerations**:
1. Use `stopRecording()` callback from within effect - need to ensure it's available
2. Prevent infinite loops or double-stopping
3. Ensure cleanup happens exactly once

### Presentation Layer

No changes required. The `AudioRecorder` component will:
- Continue working with existing UI
- Optionally accept and pass through `maxDuration` prop to hook
- No visual changes needed

## Implementation Details

### Core Logic Addition

**File**: `lib/hooks/use-recording.ts`

**Changes**:
1. Add optional `options` parameter to hook function
2. Extract `maxDuration` with default value of 10000ms
3. Modify timer effect to include timeout check

**Pseudocode**:
```typescript
export function useRecording(options?: { maxDuration?: number }) {
  const maxDuration = options?.maxDuration ?? 10000;

  // existing state and refs...

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        setDuration(elapsed);

        // NEW: Auto-stop logic
        if (elapsed >= maxDuration) {
          stopRecording();
        }
      }, 100);
    } else {
      // existing cleanup...
    }

    return () => {
      // existing cleanup...
    };
  }, [isRecording, maxDuration, stopRecording]);

  // rest of hook...
}
```

### Edge Cases Handling

#### Case 1: Manual stop before timeout
- **Scenario**: User clicks stop at 8 seconds
- **Behavior**: `isRecording` becomes false, timer effect cleanup runs, auto-stop never triggers
- **Result**: Normal manual stop behavior

#### Case 2: Manual stop at exactly timeout
- **Scenario**: User clicks stop at same moment as timeout (race condition)
- **Behavior**: `stopRecording()` may be called twice
- **Protection**: `stopRecording()` already checks `isRecording` state and `mediaRecorderRef.current` existence
- **Result**: First call succeeds, second call is no-op

#### Case 3: Timer precision
- **Scenario**: Timer checks at 9.9s and 10.0s
- **Behavior**: At 10.0s check, `elapsed >= 10000` is true
- **Result**: Stops within 100ms tolerance as specified

## Performance Considerations

### Timer Overhead
- **Impact**: Negligible - adds one conditional check per 100ms interval
- **Optimization**: None needed - single comparison is O(1)

### Memory Management
- **No new timers**: Uses existing timer infrastructure
- **No new state**: Reuses existing duration state
- **Cleanup**: Handled by existing cleanup logic

### Browser Compatibility
- All logic uses existing APIs already in use
- No new browser features required
- Works wherever MediaRecorder API is supported

## Error Handling Strategy

### Error Scenarios

#### 1. stopRecording() fails
- **Unlikely**: Already protected with null checks
- **Handling**: Existing error handlers catch MediaRecorder errors
- **User experience**: Error state already displayed in UI

#### 2. Timer cleanup race condition
- **Protection**: React's effect cleanup automatically clears interval
- **Additional safety**: Manual cleanup in effect cleanup function
- **Result**: No memory leaks

### Recovery Mechanisms
- Auto-stop uses same cleanup path as manual stop
- All existing error handling and recovery applies
- No new failure modes introduced

## Testing Strategy

### Unit Testing Approach
Test the `useRecording` hook with React Testing Library:

```typescript
describe('useRecording timeout', () => {
  it('should stop recording after maxDuration', async () => {
    const { result } = renderHook(() => useRecording({ maxDuration: 1000 }));

    await act(async () => {
      await result.current.startRecording();
    });

    // Wait for timeout
    await waitFor(() => {
      expect(result.current.isRecording).toBe(false);
    }, { timeout: 1500 });

    expect(result.current.audioBlob).not.toBeNull();
  });

  it('should use default maxDuration of 10000ms', () => {
    // Test default behavior
  });

  it('should allow manual stop before timeout', async () => {
    // Test manual stop at 5s with 10s timeout
  });
});
```

### Manual Testing Checklist
1. Start recording, wait 10 seconds, verify auto-stop
2. Start recording, manually stop at 5 seconds, verify normal behavior
3. Start recording, manually stop at 9.9 seconds, verify no double-stop
4. Verify audio blob is created correctly after auto-stop
5. Verify no console errors or warnings
6. Test in Chrome, Firefox, Safari, Edge

### Performance Validation
- Monitor timer precision with console.log
- Verify stop occurs within 100ms of 10s threshold
- Check for memory leaks with browser DevTools
- Confirm no performance degradation during recording

## Configuration Management

### P1 Requirement: Configurable Timeout

**Current approach**: Pass `maxDuration` as option to hook

**Future enhancement options**:
1. Environment variable: `NEXT_PUBLIC_MAX_RECORDING_DURATION`
2. User preferences stored in database
3. Feature flags for A/B testing different durations
4. Context provider for global configuration

**Recommendation**: Start with hook parameter, add environment variable support if needed later.

## Security Considerations

### No New Security Concerns
- Feature only adds timeout logic
- No new user input handling
- No new API endpoints
- No data persistence changes

### Existing Security Maintained
- Audio recording permissions unchanged
- MediaStream handling unchanged
- Audio blob creation unchanged

## Migration & Rollout

### Zero-Migration Required
- Backward compatible change
- Default behavior: 10s timeout active
- Existing components work without modification
- No database changes needed

### Rollout Strategy
1. Deploy code with default 10s timeout
2. Monitor user behavior and feedback
3. Adjust default if needed via configuration
4. No feature flag needed - low risk change

## Future Enhancements

### Post-MVP Improvements (Not in Current Scope)
1. **User notification**: Toast message when auto-stopped
2. **Visual countdown**: Show remaining time in UI
3. **Warning state**: Visual indicator at 8-9 seconds
4. **Analytics**: Track timeout frequency and average duration
5. **Per-user settings**: Custom timeout durations
6. **Dynamic timeouts**: Different limits for different exercise types

### Technical Debt
None introduced - clean implementation using existing patterns.
