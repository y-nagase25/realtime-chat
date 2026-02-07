import { describe, it, expect } from 'vitest';
import { ApiError, CsrfError, RateLimitError } from './errors';

describe('ApiError', () => {
  it('should create an instance with status and default message', () => {
    const error = new ApiError(404);
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(404);
    expect(error.message).toBe('API Error: 404');
    expect(error.name).toBe('ApiError');
  });

  it('should create an instance with status and custom message', () => {
    const error = new ApiError(500, 'Internal Server Error');
    expect(error.status).toBe(500);
    expect(error.message).toBe('Internal Server Error');
  });
});

describe('CsrfError', () => {
  it('should create an instance with default message', () => {
    const error = new CsrfError();
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(CsrfError);
    expect(error.message).toBe('CSRF token validation failed');
    expect(error.name).toBe('CsrfError');
  });

  it('should create an instance with custom message', () => {
    const error = new CsrfError('Invalid CSRF token');
    expect(error.message).toBe('Invalid CSRF token');
  });
});

describe('RateLimitError', () => {
  it('should create an instance with retryAfter and default message', () => {
    const retryAfter = 60;
    const error = new RateLimitError(retryAfter);
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(RateLimitError);
    expect(error.retryAfter).toBe(retryAfter);
    expect(error.message).toBe(`Rate limit exceeded. Retry after ${retryAfter} seconds.`);
    expect(error.name).toBe('RateLimitError');
  });

  it('should create an instance with retryAfter and custom message', () => {
    const retryAfter = 30;
    const error = new RateLimitError(retryAfter, 'Too many requests');
    expect(error.retryAfter).toBe(retryAfter);
    expect(error.message).toBe('Too many requests');
  });
});
