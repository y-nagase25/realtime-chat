import { EXCEEDED_USAGE_LIMIT_MSG } from '@/lib/constants';
import { test, expect } from '@playwright/test';

// マイク権限と偽の音声入力を有効化
test.use({
  permissions: ['microphone'],
  launchOptions: {
    args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
  },
});

test.describe('スピーキング機能 - 使用制限チェック', () => {
  test('制限を超えていない場合、書き起こし結果が正常に表示される', async ({ page }) => {
    // 1. APIモックの設定
    // /api/transcribe へのリクエストをインターセプトし、成功レスポンスを返す
    await page.route('/api/transcribe', async (route) => {
      // 実際には checkUsageLimit などが走るところを、強制的に成功結果を返すことでシミュレート
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          transcription: { text: 'Hello world, this is a test.' }, // 想定される正常なレスポンス
        }),
      });
    });

    // 2. ページへのアクセス
    // 実際に質問が表示されるように待機（データロードが必要な場合があるため）
    await page.goto('/speaking');

    // 質問が表示されるのを待つ (データがない場合に備えてタイムアウト長め推奨だが、モックAPIを使うのが本来はベスト)
    // ここでは画面上の最初の「録音開始」ボタンを探す
    const recordButton = page.getByTestId('start-recording');
    await expect(recordButton).toBeVisible();

    // 3. 録音操作の実行
    await recordButton.click();

    // 録音中状態（停止ボタン表示）を確認
    const stopButton = page.getByTestId('stop-recording');
    await expect(stopButton).toBeVisible();

    // 少し待ってから停止（実際の録音時間を模倣）
    await page.waitForTimeout(1000);
    await stopButton.click();

    // 4. 結果の検証
    // APIモックが高速なため、スピナーの表示チェックは省略し、最終結果を確認

    // モックした結果が表示されるか確認
    await expect(page.getByText('Hello world, this is a test.')).toBeVisible();

    // 採点ボタンが表示されていることも確認（次のステップに進める状態）
    await expect(page.getByRole('button', { name: /採点する/i })).toBeVisible();
  });

  // 制限オーバーの場合のテスト
  test('制限を超えている場合、エラーが表示される', async ({ page }) => {
    await page.route('/api/transcribe', async (route) => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Daily usage limit exceeded' }),
      });
    });

    await page.goto('/speaking');

    const recordButton = page.getByTestId('start-recording');
    await expect(recordButton).toBeVisible();

    await recordButton.click();

    const stopButton = page.getByTestId('stop-recording');
    await expect(stopButton).toBeVisible();

    await page.waitForTimeout(1000);
    await stopButton.click();

    // エラーメッセージの表示確認
    const errorMessage = page.getByTestId('audio-recorder-error-message');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText(EXCEEDED_USAGE_LIMIT_MSG);
  });
});
