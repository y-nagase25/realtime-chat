/**
 * Wasei-Eigo (和製英語) Dictionary
 *
 * Japanese-English loanwords that have different meanings in Japanese
 * than their original English counterparts. This dictionary helps
 * Japanese learners avoid common misunderstandings.
 */

import type { WaseiEigoEntry } from '@/lib/types/reading';

/**
 * Dictionary of Wasei-Eigo entries
 * Key is the lowercase English word
 */
export const WASEI_EIGO_DICTIONARY: Record<string, WaseiEigoEntry> = {
  mansion: {
    word: 'mansion',
    japaneseUsage: 'マンション',
    japaneseUsageMeaning: 'apartment',
    actualEnglishMeaning: '豪邸、大邸宅',
    warningJa:
      '日本語の「マンション」は英語では "apartment" や "condominium" です。英語の "mansion" は大きな豪邸を意味します。',
  },
  claim: {
    word: 'claim',
    japaneseUsage: 'クレーム',
    japaneseUsageMeaning: 'complaint',
    actualEnglishMeaning: '主張する、請求する',
    warningJa:
      '日本語の「クレーム」（苦情）は英語では "complaint" です。英語の "claim" は主張や請求を意味します。',
  },
  smart: {
    word: 'smart',
    japaneseUsage: 'スマート',
    japaneseUsageMeaning: 'slim/stylish',
    actualEnglishMeaning: '賢い、頭が良い',
    warningJa:
      '日本語の「スマート」（細い、スタイリッシュ）は英語では "slim" や "stylish" です。英語の "smart" は主に「賢い」を意味します。',
  },
  naive: {
    word: 'naive',
    japaneseUsage: 'ナイーブ',
    japaneseUsageMeaning: 'sensitive',
    actualEnglishMeaning: '世間知らず、単純',
    warningJa:
      '日本語の「ナイーブ」（繊細な）は英語では "sensitive" です。英語の "naive" は世間知らず、経験不足を意味し、やや否定的なニュアンスがあります。',
  },
  tension: {
    word: 'tension',
    japaneseUsage: 'テンション',
    japaneseUsageMeaning: 'excitement/energy',
    actualEnglishMeaning: '緊張、張力',
    warningJa:
      '日本語の「テンションが高い」（元気、ハイ）は英語では "excited" や "energetic" です。英語の "tension" は緊張や張力を意味します。',
  },
  fight: {
    word: 'fight',
    japaneseUsage: 'ファイト',
    japaneseUsageMeaning: 'encouragement (Go for it!)',
    actualEnglishMeaning: '戦い、喧嘩',
    warningJa:
      '日本語の「ファイト！」（頑張れ！）は英語では "Go for it!" や "Good luck!" です。英語の "fight" は戦いや喧嘩を意味します。',
  },
  service: {
    word: 'service',
    japaneseUsage: 'サービス',
    japaneseUsageMeaning: 'free/bonus/complimentary',
    actualEnglishMeaning: 'サービス、接客',
    warningJa:
      '日本語の「サービス」（無料、おまけ）は英語では "free" や "complimentary" です。英語の "service" は接客やサービス行為を意味します。',
  },
  consent: {
    word: 'consent',
    japaneseUsage: 'コンセント',
    japaneseUsageMeaning: 'electrical outlet',
    actualEnglishMeaning: '同意、承諾',
    warningJa:
      '日本語の「コンセント」（電源プラグ差込口）は英語では "outlet" や "socket" です。英語の "consent" は同意や承諾を意味します。',
  },
  handle: {
    word: 'handle',
    japaneseUsage: 'ハンドル',
    japaneseUsageMeaning: 'steering wheel',
    actualEnglishMeaning: '取っ手、対処する',
    warningJa:
      '日本語の「ハンドル」（車のステアリング）は英語では "steering wheel" です。英語の "handle" は取っ手や対処するを意味します。',
  },
  cunning: {
    word: 'cunning',
    japaneseUsage: 'カンニング',
    japaneseUsageMeaning: 'cheating (on exams)',
    actualEnglishMeaning: 'ずる賢い',
    warningJa:
      '日本語の「カンニング」（試験での不正行為）は英語では "cheating" です。英語の "cunning" はずる賢い、狡猾なを意味します。',
  },
  viking: {
    word: 'viking',
    japaneseUsage: 'バイキング',
    japaneseUsageMeaning: 'buffet (all-you-can-eat)',
    actualEnglishMeaning: 'バイキング（北欧の海賊）',
    warningJa:
      '日本語の「バイキング」（食べ放題）は英語では "buffet" や "all-you-can-eat" です。英語の "Viking" は北欧の海賊を意味します。',
  },
  feminist: {
    word: 'feminist',
    japaneseUsage: 'フェミニスト',
    japaneseUsageMeaning: 'gentleman/chivalrous man',
    actualEnglishMeaning: 'フェミニスト（女性権利主義者）',
    warningJa:
      '日本語の「フェミニスト」（女性に優しい男性）は英語では "gentleman" や "chivalrous" です。英語の "feminist" は女性の権利を支持する人を意味します。',
  },
};

/**
 * Look up a word in the Wasei-Eigo dictionary
 * @param word - The English word to look up (case-insensitive)
 * @returns The Wasei-Eigo entry if found, undefined otherwise
 */
export function lookupWaseiEigo(word: string): WaseiEigoEntry | undefined {
  return WASEI_EIGO_DICTIONARY[word.toLowerCase()];
}

/**
 * Check if a word is in the Wasei-Eigo dictionary
 * @param word - The English word to check (case-insensitive)
 * @returns true if the word is a Wasei-Eigo word
 */
export function isWaseiEigo(word: string): boolean {
  return word.toLowerCase() in WASEI_EIGO_DICTIONARY;
}

/**
 * Get all Wasei-Eigo words as a list
 * @returns Array of all Wasei-Eigo words
 */
export function getAllWaseiEigoWords(): string[] {
  return Object.keys(WASEI_EIGO_DICTIONARY);
}
