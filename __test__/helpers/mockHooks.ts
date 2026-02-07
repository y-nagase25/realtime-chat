// __test__/helpers/mockHooks.ts

export const createMockUseCounter = (overrides = {}) => {
  return {
    count: 0,
    increment: vi.fn(),
    decrement: vi.fn(),
    reset: vi.fn(),
    ...overrides,
  };
};
