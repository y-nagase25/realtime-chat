/**
 * Japanese labels for speaking practice UI
 */
export const SPEAKING_LABELS = {
  // ScoringResults
  result: '結果',
  answer: '模範解答',
  goodPoints: '良かった点',
  areasForImprovement: '改善点',

  // TranscriptDisplay
  yourResponse: 'あなたの回答',
  evaluating: '評価中...',
  scoreMyResponse: 'この回答を採点する',

  // Attempt
  transcript: '書き起こしテキスト',
  history: '会話履歴',

  // SessionStatistics
  sessionStatistics: 'セッション統計',
  totalAttempts: '合計回答数',
  averageScore: '平均スコア',
  bestScore: '最高スコア',
  latestScore: '最新スコア',

  // AudioRecorder
  startRecording: '録音を開始',
  stopRecording: '録音を停止',
  recording: '録音中...',

  // SpeakingPractice
  tryAgain: 'もう一度試す',
  transcribing: '音声を書き起こし中...',
  tryAnotherQuestion: '別の質問を試す',

  // Page
  speakingPractice: 'AI Speaking Practice',
  noQuestionsAvailable: '利用可能な質問がありません。',
  phrase: '日常会話フレーズ',
  description: 'スピーキング練習したい日常会話フレーズを選択してください。',
  difficultyLevel: 'レベル',
  noQuestionsFound: '該当するフレーズが見つかりませんでした。',
  clear: 'リセット',
} as const;
