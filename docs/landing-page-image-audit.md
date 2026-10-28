# IELTS Learning Platform — Landing Page Image Audit & Asset Manifest

**Document Version:** 1.0.0  
**Audit Date:** October 28, 2026  
**Auditor:** Principal Frontend Engineer & UI/UX Architect  
**Design System Baseline:** Cambridge Teal (`#28665F`), Nunito Typography, Education SaaS Human-Centric Aesthetic  
**Asset Storage Directory:** `public/images/landing/`

---

## 1. Executive Summary & Design Principles

To elevate the IELTS Learning Platform from synthetic placeholder mockups to an authentic, high-credibility educational platform, all generic flat screenshots, repetitive pastel cards, and AI-generated concepts have been superseded by **curated, high-resolution authentic photography**.

### Key Architecture Guidelines Enforced:
1. **Human-Centric & Real Study Context:** Every photograph portrays genuine learners, focused study environments, academic materials, or authentic examination settings.
2. **Zero Fake Screenshots:** Feature demonstrations (Audio Player, True/False/Not Given reading drills, Writing Coach criteria breakdown, 3D Flashcards with Web Speech API, and Computer-Delivered IELTS simulation) remain **100% interactive React/HTML components** rather than static rasterized PNGs.
3. **No Layout Shift & High Performance:** All images are optimized (WebP/JPEG, 43 KB – 243 KB), rendered with explicit aspect ratios (`aspect-[16/10]`, `aspect-[16/9]`, `aspect-[4/3]`, `aspect-[1/1]`), lazy-loaded below the fold, and accompanied by meaningful `alt` text.
4. **Legally Cleared & Open License:** 100% of external assets are curated under the **Unsplash Open License** (free for commercial and personal use, no copyright restrictions).

---

## 2. Comprehensive Asset Manifest & Section Mapping

| Section # & Name | Asset Filename | Source / Photographer / Unsplash ID | License | Dimensions / Weight | Image Content & Purpose | Status |
|---|---|---|---|---|---|---|
| **Section 1: Hero Section** | `hero-student-study.jpg` | Brooke Cagle (`photo-1523240795612-9a054b0db644`) | Unsplash Free License | 1200×800 (157.4 KB) | Group of focused university students studying in a bright modern campus lounge with laptops and notebooks. Visual anchor for initial trust. | **Active & Verified** |
| **Section 2 & 3: Step 1 (Placement)** | `method-placement-test.jpg` | Unsplash (`photo-1488190211105-8b0e65b80b4e`) | Unsplash Free License | 800×500 (70.4 KB) | Student taking an online diagnostic placement exam on laptop with desk notes. Demonstrates the initial diagnostic process. | **Active & Verified** |
| **Section 2 & 3: Step 2 (Roadmap)** | `method-roadmap-plan.jpg` | Unsplash (`photo-1501504905252-473c47e087f8`) | Unsplash Free License | 800×533 (66.8 KB) | Student structuring a weekly study schedule and learning milestones with notes. Illustrates the personalized roadmap. | **Active & Verified** |
| **Section 2 & 3: Step 3 (Practice)** | `method-deliberate-practice.jpg` | Unsplash (`photo-1497633762265-9d179a990aa6`) | Unsplash Free License | 800×533 (43.4 KB) | Deliberate academic study session with textbooks and laptop. Represents question-by-question deliberate practice. | **Active & Verified** |
| **Section 2 & 3: Step 4 (Coaching)** | `method-ai-coaching.jpg` | Unsplash (`photo-1531482615713-2afd69097998`) | Unsplash Free License | 800×533 (82.8 KB) | Academic mentor and student in interactive feedback review session. Represents criteria-based remediation and polish. | **Active & Verified** |
| **Section 4: Skill — Listening** | `skill-listening-real.jpg` | Malte Helmhold (`photo-1590650153855-d9e808231d41`) | Unsplash Free License | 1000×667 (81.8 KB) | Learner wearing premium over-ear headphones, intently focused on audio comprehension. Accompanies the live React audio player. | **Active & Verified** |
| **Section 4: Skill — Reading** | `skill-reading-real.jpg` | Aaron Burden (`photo-1456513080510-7bf3a84b82f8`) | Unsplash Free License | 1000×667 (80.5 KB) | Academic researcher analyzing complex texts with pen and highlighter. Accompanies the split-screen reading passage drill. | **Active & Verified** |
| **Section 4: Skill — Writing** | `skill-writing-real.jpg` | Scott Graham (`photo-1455390582262-044cdead277a`) | Unsplash Free License | 1000×667 (71.0 KB) | Hands drafting structured essay outline with laptop and handwritten notes. Accompanies the Task 2 writing score widget. | **Active & Verified** |
| **Section 4: Skill — Speaking** | `skill-speaking-real.jpg` | Christina @ wocintechchat.com (`photo-1573496359142-b8d87734a5a2`) | Unsplash Free License | 1000×667 (187.8 KB) | Confident woman speaking naturally in an interview consultation. Accompanies the Part 2 Candidate Task Card preview. | **Active & Verified** |
| **Section 6: Writing Coach** | `writing-coach-study.jpg` | Glenn Carstens-Peters (`photo-1516321318423-f06f85e504b3`) | Unsplash Free License | 1000×667 (84.2 KB) | Student analyzing digital writing corrections on screen. Paired with interactive Draft (6.0) vs Polished (8.0) comparison. | **Active & Verified** |
| **Section 7: 3D Flashcards** | `vocabulary-notes-study.jpg` | Green Chameleon (`photo-1434030216411-0b793f4b4173`) | Unsplash Free License | 1000×667 (77.0 KB) | Clean morning flatlay of vocabulary notebook, stationery and flashcards. Paired with real 3D flip card & Web Speech API audio. | **Active & Verified** |
| **Section 9: CDI Simulation** | `cdi-exam-room.jpg` | Kendal (`photo-1498243691581-b145c3f54a5a`) | Unsplash Free License | 1000×667 (126.1 KB) | Official university computer testing laboratory with partitioned candidate rows. Paired with live CDI timer & 40-question palette. | **Active & Verified** |
| **Section 10: Habit & Progress** | `student-progress-celebrate.jpg` | Brooke Cagle (`photo-1522202176988-66273c2fd55f`) | Unsplash Free License | 1000×667 (110.8 KB) | Diverse study group smiling, tracking milestones and sharing study gains. Accompanies the 14-day streak and weekly hours chart. | **Active & Verified** |
| **Section 13: Final CTA** | `cta-learner-confidence.jpg` | Priscilla Du Preez (`photo-1517486808906-6ca8b3f04846`) | Unsplash Free License | 1200×800 (243.6 KB) | Confident, optimistic student carrying study materials, ready for IELTS success. Paired with the primary conversion CTAs. | **Active & Verified** |

---

## 3. UI/UX Interaction Preservation Audit

Every dynamic React capability on the landing page has been preserved and verified:
1. **Interactive 3D Flashcard (`DEMO_FLASHCARDS`)**:
   - 3D CSS perspective card flip (`transform-style: preserve-3d`).
   - Web Speech API integration (`window.speechSynthesis`) for British/American pronunciation.
   - Forward/backward navigation between sample cards.
   - Spaced Repetition (SM-2) interval metadata badge.
2. **Interactive Writing Coach**:
   - Live interactive state toggle: "Bản nháp học viên (Band 6.0)" vs "Bản nâng cấp Writing Coach (Band 8.0)".
   - Real-time sentence transition with smooth CSS fade animation.
   - 4-Criteria Cambridge band score breakdown (Task Response, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy).
3. **Interactive 4-Skill Workspace Tabs**:
   - Seamless switching between Listening, Reading, Writing, Speaking.
   - Functional mini audio player widget with duration indicator and play button.
   - Cambridge 18 Reading passage True/False/Not Given interactive validation.
   - Speaking Part 2 Candidate Task Card with live countdown indicator and recording simulation.
4. **FAQ Accordion**:
   - Single-open accordion toggle with smooth chevron rotation and accessible focus outlines.

---

## 4. Technical Performance & Accessibility Verification

- **Production Build:** `npm run build` completed cleanly without errors in `2.51s`.
- **Test Suite:** 37/37 unit and integration tests passed (`npx vitest run`).
- **Responsive Compatibility:** Checked across mobile (<640px), tablet (768px–1024px), and desktop (1280px–1920px). Zero horizontal scroll or overflowing media.
- **Accessibility:** All `<img>` tags carry descriptive Vietnamese `alt` attributes explaining context, subject matter, and educational intent.
- **Network Optimization:** Total download footprint of all 14 images is under 1.5 MB combined, ensuring snappy First Contentful Paint (FCP) and optimal Largest Contentful Paint (LCP).
