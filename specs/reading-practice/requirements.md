# Reading Practice Feature Requirements

## Overview

An AI-powered English reading practice feature designed specifically for Japanese speakers. The feature helps users improve their English reading comprehension through AI-generated passages, vocabulary support with Japanese translations, grammar explanations, and comprehension assessments.

## Target Users

- Japanese speakers learning English
- Skill levels: CEFR A1 to C1 (beginner to advanced)
- Use cases: TOEIC preparation, Eiken preparation, general English improvement

## Functional Requirements

### FR-1: Reading Passage Generation

#### FR-1.1: Difficulty Level Selection
- Users can select difficulty level from: A1, A2, B1, B2, C1
- Difficulty affects vocabulary complexity, sentence length, and grammar patterns
- Display estimated reading time and word count

#### FR-1.2: Topic Selection
- Available topics:
  - Daily Life (日常生活)
  - Business (ビジネス)
  - Travel (旅行)
  - News & Current Events (ニュース)
  - Science & Technology (科学技術)
  - Culture & Entertainment (文化・エンタメ)
- Users can select one topic per passage

#### FR-1.3: Passage Generation
- AI generates a passage of 150-500 words based on level and topic
- Passages should be coherent, engaging, and educational
- Include a title for each passage
- Store generated passages for potential re-reading

### FR-2: Vocabulary Support

#### FR-2.1: Word Lookup
- Users can click/tap any word in the passage
- Display popup with:
  - English definition
  - Japanese translation (日本語訳)
  - Part of speech
  - Example sentence
- Popup should be dismissible by clicking outside

#### FR-2.2: Vocabulary List
- Users can save words to a personal vocabulary list
- Saved words persist across sessions
- View all saved words in a dedicated vocabulary page

### FR-3: Grammar Support

#### FR-3.1: Grammar Pattern Focus (Optional)
- Users can optionally select grammar patterns to focus on:
  - Articles (a/an/the)
  - Prepositions (in/on/at/for/to)
  - Present Perfect vs Past Simple
  - Relative Clauses (who/which/that)
  - Passive Voice
  - Conditionals
- When selected, AI emphasizes these patterns in generated passages

#### FR-3.2: Grammar Highlighting
- Highlight selected grammar patterns in the passage
- Click highlighted grammar for Japanese explanation

### FR-4: Comprehension Assessment

#### FR-4.1: Question Generation
- After reading, generate 3-5 comprehension questions
- Question types:
  - Multiple choice (4 options)
  - True/False
  - Fill-in-the-blank
- Questions test understanding, not memorization

#### FR-4.2: Answer Evaluation
- Immediate feedback on each answer
- Show correct answer with explanation
- Explanations available in Japanese

#### FR-4.3: Score Display
- Show score as percentage (e.g., 4/5 = 80%)
- Display which question types were missed

### FR-5: Reading Speed Tracking

#### FR-5.1: Timed Reading Mode
- Optional timer that starts when passage is displayed
- Calculate WPM (words per minute) when user indicates completion
- Do not auto-scroll or pressure user

#### FR-5.2: Speed Benchmarks
- Display target WPM for each level:
  - A1: 50-80 WPM
  - A2: 80-120 WPM
  - B1: 120-180 WPM
  - B2: 180-250 WPM
  - C1: 250+ WPM
- Show user's WPM relative to target

### FR-6: Summary Writing (Optional)

#### FR-6.1: Summary Input
- After comprehension questions, offer optional summary writing
- Text area for user to write summary in English
- Suggested length: 2-4 sentences

#### FR-6.2: AI Evaluation
- AI evaluates summary for:
  - Key points captured
  - Grammar accuracy
  - Vocabulary usage
- Provide feedback in Japanese
- Show model summary for comparison

### FR-7: Progress Tracking

#### FR-7.1: Session History
- Record each reading session with:
  - Date/time
  - Topic and difficulty
  - Comprehension score
  - Reading speed (if timed)
- Display history in dashboard

#### FR-7.2: Statistics
- Total passages read
- Average comprehension score
- Average reading speed trend
- Most practiced topics

## Non-Functional Requirements

### NFR-1: Performance
- Passage generation should complete within 5 seconds
- Word lookup should respond within 500ms
- Page load time under 2 seconds

### NFR-2: Accessibility
- Support keyboard navigation
- Ensure sufficient color contrast
- Screen reader compatible

### NFR-3: Responsive Design
- Mobile-first design
- Support screens from 320px to 1920px width
- Touch-friendly tap targets (minimum 44px)

### NFR-4: Data Persistence
- Vocabulary list persists in local storage
- Progress data persists in local storage
- No user authentication required for MVP

### NFR-5: Localization
- UI labels in Japanese
- Instructions and feedback in Japanese
- English content for reading material only

## Technical Constraints

### TC-1: API Usage
- Use GPT-5 via `/api/text` endpoint for generation and evaluation
- Do NOT use Realtime API
- Implement rate limiting to prevent abuse

### TC-2: Technology Stack
- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- TypeScript strict mode

### TC-3: Code Standards
- Follow Biome linting rules
- Use existing UI components from `/components/ui`
- Follow project path alias conventions (`@/*`)

## Page Structure

```
/reading                    - Main reading practice page
/reading/vocabulary         - Saved vocabulary list (future)
/reading/history           - Reading history dashboard (future)
```

## UI/UX Requirements

### Main Reading Page Layout

```
┌─────────────────────────────────────────────┐
│  Reading Practice / リーディング練習          │
├─────────────────────────────────────────────┤
│  [Level: A1 ▼] [Topic: Daily Life ▼]        │
│  [Grammar Focus: Articles ▼] (optional)      │
│                                             │
│  [Generate Passage / 文章を生成]             │
├─────────────────────────────────────────────┤
│  Title: "A Day at the Coffee Shop"          │
│  Level: A2 | 230 words | ~2 min read        │
│─────────────────────────────────────────────│
│                                             │
│  [Passage text with clickable words]        │
│  Highlighted text = Grammar patterns        │
│                                             │
├─────────────────────────────────────────────┤
│  Reading Time: 2:34 | WPM: 91               │
│  [I finished reading / 読み終わりました]      │
├─────────────────────────────────────────────┤
│  Comprehension Questions / 理解度チェック     │
│                                             │
│  Q1: What did the main character order?     │
│  ○ A) Tea  ○ B) Coffee  ○ C) Juice ○ D) Water│
│  ...                                        │
│                                             │
│  [Check Answers / 答え合わせ]                │
├─────────────────────────────────────────────┤
│  Score: 4/5 (80%)                           │
│  [Write Summary (Optional)]                 │
│  [New Passage / 新しい文章]                  │
└─────────────────────────────────────────────┘
```

### Vocabulary Popup

```
┌────────────────────────────────┐
│  mansion                       │
│  /ˈmænʃən/  noun              │
├────────────────────────────────┤
│  EN: A large impressive house  │
│  JP: 豪邸、大邸宅               │
├────────────────────────────────┤
│  Example:                      │
│  "They live in a mansion       │
│   with 20 rooms."              │
├────────────────────────────────┤
│  [Save to List / 保存]         │
└────────────────────────────────┘
```

## In Scope (MVP)

- [x] Difficulty and topic selection
- [x] AI passage generation
- [x] Basic vocabulary lookup with Japanese translation
- [x] Comprehension question generation and evaluation
- [x] Reading time tracking with WPM calculation
- [x] Basic progress display (current session only)
- [x] Japanese UI labels

## Out of Scope (Future Enhancements)

- User authentication and cloud sync
- Spaced repetition for vocabulary review
- Anki export functionality
- Detailed grammar explanations page
- Leaderboards and gamification
- Audio pronunciation for words
- Passage bookmarking
- Social sharing
- Offline support
- Multiple language support beyond Japanese

## Acceptance Criteria

### AC-1: Passage Generation
- [ ] User can select difficulty level (A1-C1)
- [ ] User can select topic from 6 options
- [ ] Generated passage displays with title and metadata
- [ ] Passage length is appropriate for selected level

### AC-2: Vocabulary Support
- [ ] Clicking a word shows popup with definition and Japanese translation
- [ ] Popup can be dismissed by clicking outside

### AC-3: Comprehension Assessment
- [ ] 3-5 questions generated after passage
- [ ] User can select answers and submit
- [ ] Correct/incorrect feedback shown immediately
- [ ] Final score displayed as percentage

### AC-4: Reading Speed
- [ ] Timer tracks reading duration
- [ ] WPM calculated and displayed after completion
- [ ] Target benchmark shown for comparison

### AC-5: User Experience
- [ ] Page is responsive on mobile devices
- [ ] UI labels are in Japanese
- [ ] Loading states shown during AI generation
- [ ] Error states handled gracefully

## Dependencies

- OpenAI GPT-5 API access
- Existing `/api/text` endpoint
- Existing UI components (Button, Card, etc.)

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-21 | Claude | Initial requirements |
