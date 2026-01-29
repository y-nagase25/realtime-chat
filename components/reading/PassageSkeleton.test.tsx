import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { PassageSkeleton } from './PassageSkeleton';

describe('PassageSkeleton', () => {
  afterEach(() => {
    cleanup();
  });

  it('should render the skeleton container', () => {
    render(<PassageSkeleton />);

    expect(screen.getByTestId('passage-skeleton')).toBeInTheDocument();
  });

  it('should render a title skeleton', () => {
    render(<PassageSkeleton />);

    expect(screen.getByTestId('skeleton-title')).toBeInTheDocument();
  });

  it('should render metadata skeletons', () => {
    render(<PassageSkeleton />);

    expect(screen.getByTestId('skeleton-metadata')).toBeInTheDocument();
  });

  it('should render paragraph line skeletons', () => {
    render(<PassageSkeleton />);

    const lines = screen.getAllByTestId(/^skeleton-line-/);
    expect(lines.length).toBeGreaterThanOrEqual(5);
  });

  it('should have animate-pulse class on skeleton elements', () => {
    render(<PassageSkeleton />);

    const title = screen.getByTestId('skeleton-title');
    expect(title).toHaveClass('animate-pulse');
  });
});
