# Extract Custom Hook

Extract stateful logic from a React component into a custom hook.

**Target**: $ARGUMENTS

## Process

1. Analyze the component and identify stateful logic:
   - useState, useEffect, useCallback, useMemo
   - Related helper functions
   
2. Create hook file:
   - Path: `lib/hooks/use[Name].ts`
   - Export interface for hook return type
   - Export hook function with proper TypeScript types

3. Extract logic:
   - Move state declarations
   - Move effect hooks
   - Move related functions
   - Return object with state and handlers

4. Update component:
   - Import the hook
   - Replace extracted logic with hook usage
   - Simplify component code

5. Verify:
   - Run type-check
   - Test component behavior

**Example**:
```tsx
// Before
const [user, setUser] = useState(null);
useEffect(() => { fetchUser(); }, []);

// After  
const { user, isLoading } = useUserData();
```

Show the extracted hook and updated component.