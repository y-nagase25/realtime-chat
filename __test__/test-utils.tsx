import type React from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { CsrfProvider } from '@/components/providers/CsrfProvider';
import { DailyUsageProvider } from '@/components/providers/DailyUsageProvider';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <CsrfProvider>
      <DailyUsageProvider>{children}</DailyUsageProvider>
    </CsrfProvider>
  );
};

/**
 * Custom render function with AllTheProviders wrapper
 * @param ui React node to render
 * @param options Render options
 * @returns Render result
 *
 * @example
 * const DummyConsumer = () => {
 *   const { usageAmount } = useDailyUsage();
 *   return <div data-testid="usage-text">{usageAmount.total_tokens}</div>;
 * };
 *
 * it('利用量が正しく表示されること', () => {
 *   render(<DummyConsumer />);
 *   expect(screen.getByTestId('usage-text')).toHaveTextContent('1200');
 * });
 */
const customRender = (ui: React.ReactNode, options?: RenderOptions) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// re-export everything
export * from '@testing-library/react';

// override render method
export { customRender as render };
