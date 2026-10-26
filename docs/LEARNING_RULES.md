# IELTS LEARNING PLATFORM — LEARNING RULES & CORE OPERATIONAL SPECIFICATION

> **Version:** 2.0.0  
> **Status:** Production System Specification  
> **Central Architecture Level:** Domain Engine (`src/services/learningRules/`)  
> **Configuration Source:** [`src/services/learningRules/config.ts`](file:///d:/Work/Freelance/Ielts_learning/src/services/learningRules/config.ts)  
> **Target Audience:** Principal Architects, Full-Stack Engineers, Product Designers, IELTS Curriculum Specialists

---

## 1. Overview & Architectural Axioms

The **IELTS Learning Platform Rules Engine** provides a centralized, deterministic, and evidence-based business logic layer governing all learner interactions across **Dashboard, Learning Path, Practice Hub, Mock Tests, Statistics, and AI Tutor**.

### Foundational Principles

1. **Pedagogical Determinism over Randomness:** All review intervals, task priorities, and mastery metrics are computed from mathematical formulas (SuperMemo SM-2, multi-factor prioritization) rather than random selection.
2. **Explainable AI (XAI) & Action Rationales:** Every recommended learning task displays an explicit reason explaining *why* it was selected (e.g. *"Recurring preposition error detected in 2 recent essays"* or *"5 academic collocations due for memory consolidation"*).
3. **No False Claims of Exam Leakage:** The engine never claims to predict specific real IELTS exam questions. Prioritization is strictly based on lexical academic utility in the Academic Word List (AWL) and Cambridge English Corpus, CEFR alignment, and learner weaknesses.
4. **Single Source of Truth for Progress:** Learner mastery percentages are identical across Dashboard, Learning Path, and Statistics pages, derived from a shared composite formula.
5. **Cognitive Load & Time-Budget Respect:** Daily study plans adhere strictly to learner-configured daily time budgets (30–90 minutes). When days are missed, tasks are gracefully redistributed rather than stacked into an impossible debt backlog.
6. **Strict Role-Based Access Control:** Learner and administrator capabilities are completely decoupled at the data and API layers using the principle of least privilege.

---

## 2. Vocabulary Intelligence & Contextual Selection Rules

### 2.1 Metadata Schema

All vocabulary entries follow the schema defined in [`src/types/learningRules.ts`](file:///d:/Work/Freelance/Ielts_learning/src/types/learningRules.ts):

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique identifier (e.g., `voc-illustrate`). |
| `word` | `string` | Academic headword or phrase. |
| `partOfSpeech` | `'noun' \| 'verb' \| 'adjective' \| 'adverb' \| 'phrase'` | Grammatical category. |
| `ipa` | `string` | International Phonetic Alphabet (IPA) pronunciation. |
| `contextualDefinition` | `string` | Vietnamese meaning tailored to academic IELTS context. |
| `example` | `string` | Authentic sentence illustrating academic usage. |
| `collocations` | `string[]` | 3–6 high-frequency academic collocations. |
| `topic` | `string` | Topic domain (e.g., *Environment*, *Technology*, *Urban Life*). |
| `cefrLevel` | `'B2' \| 'C1' \| 'C2'` | CEFR band classification. |
| `importanceIndex` | `number (1–100)` | Objective corpus frequency score in AWL and Cambridge tests. |
| `source` | `string` | Authoritative academic citation. |
| `srs` | `SRSItemState` | Current Spaced Repetition memory state. |
| `lapses` | `number` | Count of times the learner blacked out on this item. |

### 2.2 Prioritization Formula

Vocabulary items are dynamically prioritized using a weighted linear combination configured in [`LEARNING_RULES_CONFIG.vocabIntelligence`](file:///d:/Work/Freelance/Ielts_learning/src/services/learningRules/config.ts):

$$\text{PriorityScore} = (W_{\text{imp}} \cdot S_{\text{imp}}) + (W_{\text{gap}} \cdot S_{\text{gap}}) + (W_{\text{srs}} \cdot S_{\text{srs}}) + (W_{\text{lapse}} \cdot S_{\text{lapse}}) + B_{\text{topic}}$$

Where:
* $S_{\text{imp}} = \text{importanceIndex} \times 0.35$ ($W_{\text{imp}} = 0.35$)
* $S_{\text{gap}} = \max\left(0, 100 - |\text{targetBand} - \text{difficultyBand}| \times 25\right) \times 0.25$ ($W_{\text{gap}} = 0.25$)
* $S_{\text{srs}} = \begin{cases} 30, & \text{if SRS review is due} \\ 0, & \text{otherwise} \end{cases}$
* $S_{\text{lapse}} = \min(15, \text{lapses} \times 5)$
* $B_{\text{topic}} = 15$ bonus points if the word directly matches the upcoming lesson or practice topic.

### 2.3 Topic Alignment Before Practice

When a learner launches a practice session (Reading passage, Writing prompt, or Speaking cue card), the engine triggers `vocabIntelligenceService.getVocabForUpcomingTopic(topic)` to recommend 3–5 high-yield collocations for pre-study, priming lexical retrieval during the productive task.

---

## 3. Flashcards & Spaced Repetition System (Calibrated SM-2)

### 3.1 Explicit 4-Point Rating Scale

> [!IMPORTANT]
> **Anti-Cheating & Passive Viewing Rule:** Merely flipping a flashcard to view the definition **must never** automatically mark the item as remembered or mutate SRS intervals. Only explicit learner selection of one of the 4 calibrated rating buttons persists an SRS state change.

| Rating | Value ($q$) | Action / Consequence |
| :--- | :---: | :--- |
| `Again` (Quên hẳn) | 1 | Resets repetition count to 0, sets interval $I = 1\text{ day}$, penalizes Ease Factor by $-0.20$, increments `lapses`. |
| `Hard` (Khó nhớ) | 2 | Slows interval growth ($I = \max(1, \lfloor I \times 1.2 \rfloor)$), reduces Ease Factor by $-0.15$. |
| `Good` (Nhớ tốt) | 3 | Normal SM-2 progression ($I_n = I_{n-1} \times EF$), standard adjustment. |
| `Easy` (Rất dễ) | 4 | Boosted interval ($I_n = \lfloor I_{n-1} \times EF \times 1.3 \rfloor$), increases Ease Factor by $+0.15$. |

### 3.2 Ease Factor Floor and Clamping

$$EF' = \max\left(1.3, EF + \left(0.1 - (4 - q) \times (0.08 + (4 - q) \times 0.02)\right)\right)$$

* The Ease Factor is strictly bounded below by $EF_{\min} = 1.3$ ([`LEARNING_RULES_CONFIG.srs.minimumEaseFactor`](file:///d:/Work/Freelance/Ielts_learning/src/services/learningRules/config.ts)) to prevent review congestion death spirals.
* An item reaches `mastered` status when:
  $$\text{repetition} \ge 4 \quad \text{AND} \quad \text{intervalDays} \ge 21 \quad \text{AND} \quad \text{lapses} \le 1$$

---

## 4. Adaptive Learning & Recommendation Engine

The Adaptive Recommendation Engine ([`src/services/learningRules/adaptiveEngine.ts`](file:///d:/Work/Freelance/Ielts_learning/src/services/learningRules/adaptiveEngine.ts)) determines the single most impactful activity for the learner's current session.

### 4.1 Decision Hierarchy

```
[1. Critical Systemic Errors] (Priority 4 in Error Bank) -> Immediate drill
      |
[2. Due SRS Flashcards] (>= 10 cards due today) -> Memory consolidation
      |
[3. Core Sequential Lesson] (Next lesson in current Phase & Week)
      |
[4. Stale Mock Test Diagnostic] (No full simulation in >= 14 days)
      |
[5. Weakest Skill Practice] (Skill with lowest band in recent logs)
```

### 4.2 Stability & Anti-Thrashing Guarantee

> [!CAUTION]
> The engine **must never** rewrite a learner's curriculum or declare a skill deficient based on a single mistake or isolated bad exercise score. A minimum of 2 confirmed mistake occurrences of the exact same category is strictly required before adapting recommendations.

---

## 5. Error Bank & Diagnostic Remediation

### 5.1 Mistake Keying & Multi-Skill Ingestion

The Error Bank ([`src/services/learningRules/errorBankService.ts`](file:///d:/Work/Freelance/Ielts_learning/src/services/learningRules/errorBankService.ts)) captures mistakes across all 6 skill domains:

$$\text{ErrorKey} = (\text{skill}, \text{questionType}, \text{errorType})$$

* **Listening:** Spelling errors, singular/plural `-s` omissions, numerical transcription errors.
* **Reading:** Confusion between `FALSE` and `NOT GIVEN`, negative qualifier misinterpretation, keyword matching traps.
* **Writing:** Unnatural collocations, run-on sentences, missing overview, article omissions (`the/a`).
* **Speaking:** Short answers in Part 2, hesitation pauses, repeated basic adjectives (`good`, `bad`).
* **Grammar:** Subject-verb agreement, inversion structures, conditional clause tense mixing.
* **Vocabulary:** Confusing false friends, incorrect prepositions following nouns/verbs.

### 5.2 Systemic Error Cluster Threshold

A pattern is classified as a **Systemic Error Cluster** if and only if:
$$\text{occurrenceCount} \ge 2 \quad \text{AND} \quad \text{resolved} = \text{false}$$

When triggered:
1. An **Alert Banner** appears on the Dashboard.
2. A direct remediation URL is generated pointing to targeted practice drills.
3. The cluster is marked `resolved` only after the learner completes a 5-question targeted drill with $\ge 80\%$ accuracy.

---

## 6. Daily Study Plan Engine & Missed-Day Rebalancing

### 6.1 Time Budget Allocations

Learners select a daily study budget: **30, 45, 60, or 90 minutes**. The Daily Plan Engine ([`src/services/learningRules/dailyPlanEngine.ts`](file:///d:/Work/Freelance/Ielts_learning/src/services/learningRules/dailyPlanEngine.ts)) constructs a balanced task list:

1. **SRS Flashcards (10–15 mins):** Prevents memory decay.
2. **Error Remediation Drill (10–15 mins):** Targets active systemic clusters.
3. **Curriculum Lesson (20–30 mins):** Sequential progress along the learning path.
4. **Productive Writing/Speaking Practice (15–20 mins):** Active language output.

### 6.2 Missed-Day Graceful Rebalancing

When a learner misses one or more study days:
* **Anti-Overwhelm Ceiling:** The engine caps today's workload at $\text{Budget} \times 1.15$ maximum. It **never** multiplies study time to $200\%$ or $300\%$.
* **Overdue Card Truncation:** Overdue flashcards are truncated to the top 20 highest-priority items; remainder are gracefully scheduled for subsequent days.
* **Rebalancing Badge:** The UI displays a supportive *"Đã tái cân bằng"* badge to eliminate streak anxiety.

---

## 7. Guided Practice Operational Rules

Guided Practice scaffolds multi-step language generation modeled after Band7Writing:

### 7.1 Writing Task 1 Guided Scaffold (6 Steps)

1. **Step 1: Warm-up:** Identify chart type, axes, units of measurement, and timeframe.
2. **Step 2: Understand the Chart:** Identify the highest point, lowest point, and primary trajectories.
3. **Step 3: Introduction:** Paraphrase the prompt using academic introductory clauses.
4. **Step 4: Overview:** Summarize 2 key macro-trends.  
   > [!IMPORTANT]
   > **Task Achievement Golden Rule:** The Overview **must never** contain specific data numbers or percentages. Including specific figures in the Overview penalizes Task Achievement.
5. **Step 5: Body Paragraph 1:** Group and compare the first set of categories with exact data points.
6. **Step 6: Body Paragraph 2:** Contrast the remaining details, state the end-period figures, and review the draft.

### 7.2 Writing Task 2 Guided Scaffold (5 Steps)

1. **Step 1: Prompt Analysis:** Identify the topic, direct questions, and essay type (Opinion, Both Views, Problem/Solution).
2. **Step 2: Brainstorming & Stance:** Select 2 core arguments and establish a clear position.
3. **Step 3: Introduction & Thesis Statement:** Hook + paraphrase prompt + clear thesis statement.
4. **Step 4: Body Paragraphs:** Topic sentence $\to$ explanation $\to$ concrete academic example $\to$ concluding link.
5. **Step 5: Conclusion & Proofreading:** Reiterate stance, synthesize main points, verify spelling and grammar.

---

## 8. Game-Based Learning Pedagogy

Interactive games reinforce academic reflexes through genuine pedagogical mechanisms:

### 8.1 Sentence Garden (Sentence Upgrader)

* **Pedagogical Goal:** Transform everyday A2/B1 sentences into Band 7.5–8.0 academic sentences.
* **4-Mission Scaffold:**
  * Mission 1: Sound Formal (Upgrade quantifiers: *"A lot of"* $\to$ *"A substantial proportion of"*).
  * Mission 2: Academic Verbs (Upgrade common verbs: *"use cars"* $\to$ *"rely on private motor vehicles"*).
  * Mission 3: Precise Context (Upgrade vague nouns: *"in big cities"* $\to$ *"in densely populated metropolitan areas"*).
  * Mission 4: Complex Syntax (Add subordinate/concessive clauses: *"Despite the extensive development of mass transit, ..."*).
* **Completion Rule:** A garden flower blooms only upon successfully completing all 4 missions.

### 8.2 Spot & Fix (Grammar Slip Hunter)

* **Pedagogical Goal:** Build rapid error-detection reflexes for IELTS Grammatical Range & Accuracy.
* **Mechanics:** 60-second timer; clickable word tokens containing 3 subtle errors (Subject-verb agreement, adverb usage, countable/uncountable nouns).
* **Scoring Rule:** Correct selections award $+10$ points; clicking correct words deducts $-2$ seconds from the timer.

---

## 9. Exam Session & Attempt State Machine

The Exam Room enforces strict integrity rules ([`src/context/ExamSessionContext.tsx`](file:///d:/Work/Freelance/Ielts_learning/src/context/ExamSessionContext.tsx)):

### 9.1 Attempt State Machine

```
[not_started]
      |  (startAttempt)
      v
[in_progress]  -----------------------+
   |        |                         |
   | (time) | (submitFullExam)        | (abandonAttempt)
   v        v                         v
[expired] [completed]            [abandoned]
```

### 9.2 Anti-Reentry & Terminal State Protection

* Attempts in `completed`, `abandoned`, or `expired` states are **strictly terminal**.
* Learners **cannot re-enter, edit answers, or resume** a finalized attempt under any circumstances.
* Clicking on a completed test in the catalog navigates exclusively to the **Result Summary Page** ([`/app/mock-tests/:testId/result`](file:///d:/Work/Freelance/Ielts_learning/src/pages/mock-tests/MockTestPages.tsx)).

### 9.3 Accidental Page Reload Recovery

* If a learner accidentally refreshes the browser during an active exam:
  * The session state is restored from `localStorage`.
  * The timer is synchronized with the absolute timestamp `activeExpiresAt`.
  * If $\text{now} < \text{activeExpiresAt}$, the session resumes smoothly without data loss.

### 9.4 Official Cambridge Band Rounding

$$\text{RawMean} = \frac{\text{Listening} + \text{Reading} + \text{Writing} + \text{Speaking}}{4}$$

$$\text{FractionalPart} = \text{RawMean} - \lfloor\text{RawMean}\rfloor$$

$$\text{OverallBand} = \begin{cases} 
\lfloor\text{RawMean}\rfloor, & \text{if } \text{FractionalPart} < 0.25 \\
\lfloor\text{RawMean}\rfloor + 0.5, & \text{if } 0.25 \le \text{FractionalPart} < 0.75 \\
\lceil\text{RawMean}\rceil, & \text{if } \text{FractionalPart} \ge 0.75
\end{cases}$$

---

## 10. Unified Progress & Single Source of Truth

To guarantee consistency across Dashboard, Learning Path, and Statistics, progress percentages are computed by [`calculateUnifiedProgress()`](file:///d:/Work/Freelance/Ielts_learning/src/services/learningRules/adaptiveEngine.ts):

$$\text{Progress} = (P_{\text{lessons}} \times 0.35) + (P_{\text{drills}} \times 0.25) + (P_{\text{vocab}} \times 0.20) + (P_{\text{mocks}} \times 0.20)$$

* Under no circumstances may an individual page create a localized progress calculation that diverges from this composite formula.

---

## 11. Roles & Permissions Authorization Matrix

Enforces the principle of least privilege configured in [`LEARNING_RULES_CONFIG.permissions`](file:///d:/Work/Freelance/Ielts_learning/src/services/learningRules/config.ts):

| Permission Key | Learner | Content Creator | Teacher / Examiner | System Admin |
| :--- | :---: | :---: | :---: | :---: |
| `read:own_profile` | Yes | Yes | Yes | Yes |
| `update:own_profile` | Yes | Yes | Yes | Yes |
| `submit:practice_exercise` | Yes | No | No | No |
| `start:mock_attempt` | Yes | No | No | No |
| `manage:users` | No | No | No | Yes |
| `manage:content` | No | Yes (Drafts) | No | Yes |
| `grade:writing_tasks` | No | No | Yes | Yes |
| `manage:roles` | No | No | No | Yes |
| `read:audit_logs` | No | No | No | Yes |

* Access control is enforced server-side; UI button visibility serves solely as an ergonomic convenience.

---

## 12. Verification & Testing Matrix

The system includes automated tests in [`src/services/learningRules/__tests__/learningRules.test.ts`](file:///d:/Work/Freelance/Ielts_learning/src/services/learningRules/__tests__/learningRules.test.ts):

1. **SM-2 Engine Tests:** Interval growth, ease factor lower bound clamp ($EF \ge 1.3$), memory lapse recovery, and due date checks.
2. **Vocabulary Intelligence Tests:** Multi-factor scoring, topic alignment bonus, and high-utility word filtering.
3. **Error Bank Tests:** Deduplication, severity priority escalation, and systemic cluster detection threshold ($\ge 2$).
4. **Daily Plan Tests:** Time budget capping, task prioritization order, and missed-day rebalancing ceiling ($1.15\times$).
5. **Scoring Rules Tests:** Multi-variant answers, parenthetical handling `(a) library`, number words `15` $\leftrightarrow$ `fifteen`, and Cambridge band rounding.
6. **Progress Engine Tests:** Single source of truth composite weighting.
