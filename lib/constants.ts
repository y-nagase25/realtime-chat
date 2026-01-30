export const APP_NAME = 'AI-GO';

export const NAV_ITEMS = [
  { label: 'Reading', description: 'リーディング問題の自動生成と採点・解説', href: '/reading' },
  { label: 'Speaking', description: '文字起こしを活用したスピーキング練習', href: '/speaking' },
  { label: 'History', description: '過去の利用履歴', href: '/history' },
];

export const TOTAL_TOKEN_LIMIT_PER_DAY = 50000;
export const WHISPER_SECONDS_LIMIT_PER_DAY = 60;
export const EXCEEDED_USAGE_LIMIT_MSG =
  '本日の利用制限を超えました。時間を空けてから再度お試しください。';

export const RECORDING_MAX_DURATION = 10 * 1000;
