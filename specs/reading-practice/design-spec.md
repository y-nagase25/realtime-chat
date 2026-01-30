# Reading Practice Feature - Design Specification

## Document Info

| Item | Value |
|------|-------|
| Version | 1.0 |
| Date | 2026-01-22 |
| Status | In Progress |
| Based on | requirements.md v1.0 |

---

## 1. Overview

### 1.1 Feature Summary

AI-powered English reading practice for Japanese learners featuring:
- Adaptive difficulty (CEFR A1-C1)
- Interactive vocabulary lookup with Japanese translations
- Comprehension assessments
- Reading speed tracking

### 1.2 Design Goals

```mermaid
mindmap
  root((Reading Practice))
    Accessibility
      Keyboard navigation
      Screen reader support
      Touch-friendly (44px targets)
    Usability
      Japanese UI labels
      Clear feedback states
      Progressive disclosure
    Performance
      < 5s passage generation
      < 500ms word lookup
      Skeleton loading states
    Mobile First
      320px minimum width
      Responsive layouts
      Touch gestures
```

---

## 2. User Flow

### 2.1 Main Reading Flow

```mermaid
flowchart TD
    START([User visits /reading]) --> SETTINGS[Settings Selection]

    subgraph SETTINGS_PHASE[Phase 1: Configuration]
        SETTINGS --> LEVEL[Select Level A1-C1]
        LEVEL --> TOPIC[Select Topic]
        TOPIC --> GRAMMAR{Grammar Focus?}
        GRAMMAR -->|Yes| SELECT_GRAMMAR[Select Pattern]
        GRAMMAR -->|No| READY
        SELECT_GRAMMAR --> READY[Ready to Generate]
    end

    READY --> GENERATE[Click 文章を生成]
    GENERATE --> LOADING1[Loading State]
    LOADING1 --> PASSAGE[Display Passage]

    subgraph READING_PHASE[Phase 2: Reading]
        PASSAGE --> READING[User Reads]
        READING --> WORD_CLICK{Word Clicked?}
        WORD_CLICK -->|Yes| POPUP[Show Vocabulary Popup]
        POPUP --> SAVE{Save Word?}
        SAVE -->|Yes| SAVE_WORD[Add to List]
        SAVE -->|No| CLOSE_POPUP[Close Popup]
        SAVE_WORD --> CLOSE_POPUP
        CLOSE_POPUP --> READING
        WORD_CLICK -->|No| FINISH{Finished?}
        FINISH -->|No| READING
        FINISH -->|Yes| DONE_READING[Click 読み終わりました]
    end

    DONE_READING --> QUESTIONS[Show Questions]

    subgraph ASSESSMENT_PHASE[Phase 3: Assessment]
        QUESTIONS --> ANSWER[Answer Questions]
        ANSWER --> SUBMIT[Click 答え合わせ]
        SUBMIT --> RESULTS[Show Results]
        RESULTS --> SUMMARY{Write Summary?}
        SUMMARY -->|Yes| WRITE_SUMMARY[Write Summary]
        WRITE_SUMMARY --> EVALUATE[AI Evaluation]
        EVALUATE --> FEEDBACK[Show Feedback]
        SUMMARY -->|No| NEXT
        FEEDBACK --> NEXT{New Passage?}
    end

    NEXT -->|Yes| SETTINGS
    NEXT -->|No| END([End Session])

    style SETTINGS_PHASE fill:#e1f5fe
    style READING_PHASE fill:#fff3e0
    style ASSESSMENT_PHASE fill:#e8f5e9
```

### 2.2 State Machine

```mermaid
stateDiagram-v2
    [*] --> Idle: Page Load

    Idle --> Generating: Click Generate
    Generating --> Reading: Passage Loaded
    Generating --> Error: API Error

    Error --> Idle: Retry

    Reading --> VocabLookup: Click Word
    VocabLookup --> Reading: Close Popup

    Reading --> Questions: Click Finished

    Questions --> Answering: Start Answering
    Answering --> Results: Submit Answers

    Results --> Summary: Choose Summary
    Results --> Idle: New Passage

    Summary --> SummaryFeedback: Submit Summary
    SummaryFeedback --> Idle: New Passage

    note right of Generating
        Loading spinner
        Button disabled
    end note

    note right of Reading
        Timer running
        Words clickable
    end note
```

---

## 3. Component Architecture

### 3.1 Component Tree

```mermaid
graph TD
    subgraph Pages
        RP["/reading - ReadingPage"]
    end

    subgraph Components
        RP --> RS[ReadingSettings]
        RP --> PD[PassageDisplay]
        RP --> RT[ReadingTimer]
        RP --> CQ[ComprehensionQuestions]
        RP --> QR[QuestionResults]
        RP --> SW[SummaryWriting]

        RS --> SEL1[Select: Level]
        RS --> SEL2[Select: Topic]
        RS --> SEL3[Select: Grammar]
        RS --> BTN1[Button: Generate]

        PD --> VP[VocabularyPopup]
        PD --> GH[GrammarHighlight]

        CQ --> MCQ[MultipleChoiceQuestion]
        CQ --> TFQ[TrueFalseQuestion]
        CQ --> FBQ[FillInBlankQuestion]

        QR --> SC[ScoreCard]
        QR --> EX[Explanations]
    end

    subgraph UI_Components["/components/ui"]
        SEL1 & SEL2 & SEL3 --> Select
        BTN1 --> Button
        VP --> Card
        SC --> Card
    end

    style Pages fill:#bbdefb
    style Components fill:#c8e6c9
    style UI_Components fill:#fff9c4
```

### 3.2 Component Specifications

| Component | Status | File Path | Description |
|-----------|--------|-----------|-------------|
| ReadingSettings | ✅ Done | `components/reading/ReadingSettings.tsx` | Level/topic/grammar selection form |
| PassageDisplay | 📋 Todo | `components/reading/PassageDisplay.tsx` | Renders passage with interactive words |
| VocabularyPopup | 📋 Todo | `components/reading/VocabularyPopup.tsx` | Word definition popup |
| ComprehensionQuestions | 📋 Todo | `components/reading/ComprehensionQuestions.tsx` | Question form |
| QuestionResults | 📋 Todo | `components/reading/QuestionResults.tsx` | Score and explanations |
| ReadingTimer | 📋 Todo | `components/reading/ReadingTimer.tsx` | Reading time tracker |
| SummaryWriting | 📋 Todo | `components/reading/SummaryWriting.tsx` | Summary input and feedback |

---

## 4. Screen Designs

### 4.1 Main Page Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back                    リーディング練習                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  設定                                                    │   │
│  │  難易度とトピックを選んで文章を生成                        │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │                                                         │   │
│  │  難易度                                                  │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │ A2（初中級）                                  ▼ │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  │                                                         │   │
│  │  トピック                                                │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │ 日常生活                                      ▼ │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  │                                                         │   │
│  │  文法フォーカス（オプション）                             │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │ 選択なし                                      ▼ │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  │                                                         │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │              文章を生成                         │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Passage Display

```
┌─────────────────────────────────────────────────────────────────┐
│  A Day at the Coffee Shop                                       │
│  ─────────────────────────────────────────────────────────────  │
│  A2 • 230 words • 約2分                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Sarah woke up early on Saturday morning. She had a busy day    │
│  ahead. First, she went to the local café for breakfast. She    │
│  ordered a cup of coffee and a croissant. The café was quiet,   │
│  and she enjoyed reading the newspaper.                         │
│                                                                 │
│  After breakfast, she walked to the park nearby. The weather    │
│  was perfect for a walk. She saw many people jogging and        │
│  playing with their dogs. Sarah sat on a bench and watched      │
│  the children playing on the swings.                            │
│                                                                 │
│  In the afternoon, Sarah visited her friend's mansion. It       │
│  was a beautiful apartment in the city center. They had tea     │
│  and talked about their plans for the summer vacation.          │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  ⏱️ 読書時間: 2:34                                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              読み終わりました                            │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 Vocabulary Popup

```mermaid
graph TD
    subgraph Popup["Vocabulary Popup"]
        direction TB
        WORD["<b>mansion</b><br/>/ˈmænʃən/ noun"]
        DIVIDER1["─────────────────"]
        DEF_EN["EN: A large impressive house"]
        DEF_JA["JP: 豪邸、大邸宅"]
        DIVIDER2["─────────────────"]
        EXAMPLE["Example:<br/>They live in a mansion<br/>with 20 rooms."]
        DIVIDER3["─────────────────"]
        SAVE_BTN["[ 保存 ]"]
    end

    style Popup fill:#ffffff,stroke:#e0e0e0,stroke-width:2px
```

**Popup Design Details:**

```
┌────────────────────────────────────┐
│  mansion                     [×]   │  ← Header with close button
│  /ˈmænʃən/  noun                   │  ← Pronunciation + POS
├────────────────────────────────────┤
│  EN: A large impressive house      │  ← English definition
│  JP: 豪邸、大邸宅                   │  ← Japanese translation
├────────────────────────────────────┤
│  Example:                          │  ← Example sentence
│  "They live in a mansion           │
│   with 20 rooms."                  │
├────────────────────────────────────┤
│  ┌──────────────────────────────┐  │
│  │      単語を保存              │  │  ← Save button
│  └──────────────────────────────┘  │
└────────────────────────────────────┘

Position: Appears near clicked word
Dismissal: Click outside or × button
Width: 280-320px (responsive)
```

### 4.4 Comprehension Questions

```
┌─────────────────────────────────────────────────────────────────┐
│  理解度チェック                                                  │
│  Comprehension Questions                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Q1. What did Sarah order at the café?                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ○  Tea and a sandwich                                  │   │
│  │  ●  Coffee and a croissant                              │   │
│  │  ○  Juice and a muffin                                  │   │
│  │  ○  Water and a cookie                                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Q2. Sarah visited her friend's apartment in the morning.      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ○  True                                                │   │
│  │  ●  False                                               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Q3. Complete: Sarah sat on a _____ and watched the children.  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  bench                                                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    答え合わせ                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.5 Results Display

```
┌─────────────────────────────────────────────────────────────────┐
│  結果 / Results                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │              🎉  3 / 4 正解                             │   │
│  │                  75%                                    │   │
│  │                                                         │   │
│  │   読書速度: 91 WPM  (目標: 80-120 WPM) ✓               │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ── 解説 ──────────────────────────────────────────────────────  │
│                                                                 │
│  Q1. ✓ 正解                                                    │
│  Coffee and a croissant                                        │
│  解説: 第1段落に "She ordered a cup of coffee and a            │
│  croissant" と書かれています。                                  │
│                                                                 │
│  Q2. ✓ 正解                                                    │
│  False                                                         │
│  解説: Sarahは午後に友人のアパートを訪れました。                  │
│  "In the afternoon, Sarah visited..."                          │
│                                                                 │
│  Q3. ✗ 不正解                                                  │
│  あなたの答え: chair                                           │
│  正解: bench                                                   │
│  解説: "Sarah sat on a bench and watched..."                   │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────┐  ┌───────────────────────┐         │
│  │  要約を書く（任意）   │  │   新しい文章         │         │
│  └───────────────────────┘  └───────────────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Data Flow

### 5.1 API Interaction Flow

```mermaid
sequenceDiagram
    participant U as User
    participant C as Client
    participant G as /api/reading/generate
    participant Q as /api/reading/questions
    participant V as /api/reading/vocabulary
    participant E as /api/reading/evaluate-summary
    participant AI as OpenAI GPT-5

    rect rgb(225, 245, 254)
        Note over U,AI: Phase 1: Passage Generation
        U->>C: Select settings & click Generate
        C->>G: POST {level, topic, grammarFocus?}
        G->>AI: Generate passage prompt
        AI-->>G: Passage JSON
        G-->>C: {success: true, data: Passage}
        C->>U: Display passage
    end

    rect rgb(255, 243, 224)
        Note over U,AI: Phase 2: Vocabulary Lookup
        U->>C: Click word "mansion"
        C->>V: POST {word, context}
        V->>AI: Definition prompt
        AI-->>V: Definition JSON
        V-->>C: {success: true, data: VocabularyEntry}
        C->>U: Show vocabulary popup
    end

    rect rgb(232, 245, 233)
        Note over U,AI: Phase 3: Assessment
        U->>C: Click "読み終わりました"
        C->>Q: POST {passage, level}
        Q->>AI: Questions prompt
        AI-->>Q: Questions JSON
        Q-->>C: {success: true, data: {questions}}
        C->>U: Display questions
        U->>C: Submit answers
        C->>U: Show results (local evaluation)
    end

    rect rgb(243, 229, 245)
        Note over U,AI: Phase 4: Summary (Optional)
        U->>C: Write & submit summary
        C->>E: POST {passage, userSummary}
        E->>AI: Evaluation prompt
        AI-->>E: Feedback JSON
        E-->>C: {success: true, data: SummaryFeedback}
        C->>U: Display feedback in Japanese
    end
```

### 5.2 Client State Management

```mermaid
graph LR
    subgraph PageState["Page State (useState)"]
        PHASE["phase: 'settings' | 'reading' | 'questions' | 'results' | 'summary'"]
        LOADING["isLoading: boolean"]
        ERROR["error: string | null"]
    end

    subgraph ContentState["Content State"]
        SETTINGS["settings: ReadingSettingsValue"]
        PASSAGE["passage: Passage | null"]
        QUESTIONS["questions: ComprehensionQuestion[]"]
        ANSWERS["userAnswers: Map<string, Answer>"]
        TIMER["readingTime: number"]
    end

    subgraph DerivedState["Derived State"]
        SCORE["score: number (computed)"]
        WPM["wordsPerMinute: number (computed)"]
    end

    SETTINGS --> PASSAGE
    PASSAGE --> QUESTIONS
    PASSAGE --> TIMER
    QUESTIONS --> ANSWERS
    ANSWERS --> SCORE
    TIMER --> WPM
```

---

## 6. Responsive Breakpoints

```mermaid
graph TD
    subgraph Mobile["Mobile (320px - 767px)"]
        M1[Full-width cards]
        M2[Stacked layout]
        M3[Bottom sheet popups]
        M4[Large touch targets]
    end

    subgraph Tablet["Tablet (768px - 1023px)"]
        T1[2-column where appropriate]
        T2[Side panel popups]
        T3[Larger fonts]
    end

    subgraph Desktop["Desktop (1024px+)"]
        D1[Centered content max-w-4xl]
        D2[Floating popups]
        D3[Keyboard shortcuts]
    end
```

### Layout Specifications

| Breakpoint | Container Width | Font Size Base | Popup Style |
|------------|-----------------|----------------|-------------|
| < 640px | 100% - 32px | 14px | Bottom sheet |
| 640-767px | 100% - 48px | 14px | Bottom sheet |
| 768-1023px | 720px | 16px | Floating |
| 1024px+ | 896px (max-w-4xl) | 16px | Floating |

---

## 7. Accessibility Specifications

### 7.1 Keyboard Navigation

```mermaid
graph LR
    subgraph TabOrder["Tab Order"]
        T1[Level Select] --> T2[Topic Select]
        T2 --> T3[Grammar Select]
        T3 --> T4[Generate Button]
        T4 --> T5[Passage Words]
        T5 --> T6[Finished Button]
        T6 --> T7[Question Options]
        T7 --> T8[Submit Button]
    end
```

### 7.2 ARIA Labels

| Component | ARIA Label (Japanese) |
|-----------|----------------------|
| Level Select | 難易度を選択 |
| Topic Select | トピックを選択 |
| Grammar Select | 文法フォーカスを選択 |
| Generate Button | 文章を生成 |
| Timer | 読書時間 |
| Score | 正解数 |

### 7.3 Color Contrast

| Element | Foreground | Background | Ratio |
|---------|------------|------------|-------|
| Body text | #1a1a1a | #ffffff | 17.4:1 |
| Secondary text | #6b7280 | #ffffff | 5.0:1 |
| Error text | #dc2626 | #ffffff | 5.9:1 |
| Success text | #16a34a | #ffffff | 4.5:1 |

---

## 8. Loading & Error States

### 8.1 Loading States

```mermaid
graph TD
    subgraph Skeleton["Skeleton Loading"]
        S1["┌────────────────────┐<br/>│ ████████████       │<br/>│ ██████             │<br/>└────────────────────┘"]
    end

    subgraph Spinner["Button Spinner"]
        S2["┌──────────────┐<br/>│ ◌ 生成中...   │<br/>└──────────────┘"]
    end

    subgraph Progress["Progress Indicator"]
        S3["Generating passage...<br/>━━━━━━━━━━░░░░░░░░░░"]
    end
```

### 8.2 Error States

| Error Type | Japanese Message | Action |
|------------|------------------|--------|
| Network error | ネットワークエラーが発生しました | 再試行ボタン |
| API rate limit | リクエスト制限に達しました。しばらくお待ちください | 待機時間表示 |
| Invalid response | 文章の生成に失敗しました | 再試行ボタン |
| Session timeout | セッションがタイムアウトしました | ページ再読込 |

---

## 9. Animation Specifications

### 9.1 Transitions

| Element | Property | Duration | Easing |
|---------|----------|----------|--------|
| Popup appear | opacity, transform | 150ms | ease-out |
| Popup dismiss | opacity, transform | 100ms | ease-in |
| Button hover | background-color | 150ms | ease |
| Card expand | height | 200ms | ease-in-out |
| Score reveal | scale, opacity | 300ms | spring |

### 9.2 Micro-interactions

```mermaid
graph LR
    A[Word Click] -->|Scale 0.95| B[Press State]
    B -->|Scale 1.0 + Popup| C[Popup Visible]

    D[Correct Answer] -->|Green flash| E[Check Icon]
    F[Wrong Answer] -->|Red shake| G[X Icon]
```

---

## 10. Implementation Priority

```mermaid
gantt
    title Implementation Phases
    dateFormat  YYYY-MM-DD
    section Phase 1
    API Routes (Done)           :done, p1a, 2026-01-20, 2d
    Types & Constants (Done)    :done, p1b, 2026-01-20, 1d
    section Phase 2
    ReadingSettings (Done)      :done, p2a, 2026-01-22, 1d
    PassageDisplay              :active, p2b, 2026-01-23, 2d
    VocabularyPopup             :p2c, after p2b, 1d
    section Phase 3
    ComprehensionQuestions      :p3a, after p2c, 2d
    QuestionResults             :p3b, after p3a, 1d
    section Phase 4
    ReadingTimer                :p4a, after p3b, 1d
    SummaryWriting              :p4b, after p4a, 1d
    section Phase 5
    Polish & Testing            :p5a, after p4b, 2d
```

---

## Appendix A: Component Props Reference

### ReadingSettings

```typescript
type ReadingSettingsProps = {
  onSubmit: (settings: ReadingSettingsValue) => void;
  isLoading?: boolean;
  defaultValue?: Partial<ReadingSettingsValue>;
};

type ReadingSettingsValue = {
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  topic: 'daily-life' | 'business' | 'travel' | 'news' | 'science' | 'culture';
  grammarFocus?: 'articles' | 'prepositions' | 'present-perfect' |
                 'relative-clauses' | 'passive-voice' | 'conditionals';
};
```

### PassageDisplay

```typescript
type PassageDisplayProps = {
  passage: Passage;
  onWordClick: (word: string, context: string) => void;
  onFinishReading: () => void;
  highlightGrammar?: boolean;
};
```

### VocabularyPopup

```typescript
type VocabularyPopupProps = {
  word: string;
  entry: VocabularyEntry | null;
  isLoading: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onSave: () => void;
};
```

### ComprehensionQuestions

```typescript
type ComprehensionQuestionsProps = {
  questions: ComprehensionQuestion[];
  onSubmit: (answers: Map<string, Answer>) => void;
  isSubmitting: boolean;
};
```

---

## Appendix B: Color Palette

| Name | Hex | Usage |
|------|-----|-------|
| Primary | #2563eb | Buttons, links |
| Primary Hover | #1d4ed8 | Button hover |
| Success | #16a34a | Correct answers |
| Error | #dc2626 | Wrong answers |
| Warning BG | #fffbeb | Warning background |
| Muted | #6b7280 | Secondary text |
| Border | #e5e7eb | Card borders |

---

*End of Design Specification*
