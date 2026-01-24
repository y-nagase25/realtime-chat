import { test, expect } from 'vitest';

function add(a: number, b: number) {
  return a + b;
}

function curriedAdd(a: number) {
  return (b: number) => a + b;
}

test('adds 1 + 2 to equal 3', () => {
  expect(add(1, 2)).toBe(3);
});

test('adds 1 + 2 to equal 3', () => {
  expect(curriedAdd(1)(2)).toBe(3);
});

test('adds 5 + 2 to equal 7', () => {
  const add5 = curriedAdd(5);
  expect(add5(2)).toBe(7);
});
