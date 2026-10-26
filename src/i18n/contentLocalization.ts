import { LearningPath, LearningPhase, WeekPlan, Lesson, LessonStep } from '@/types/learningPath'
import { MockTest } from '@/types/mockTest'

export interface LocalizedContent<T> {
  vi: T
  en: T
}

// Translations for Phases
const phaseTranslations: Record<string, { title: { vi: string; en: string }; description: { vi: string; en: string } }> = {
  'phase-01': {
    title: {
      vi: 'Giai đoạn 1: Nền tảng & Kỹ thuật xử lý dạng bài',
      en: 'Phase 1: Foundations & Task-type Mastery',
    },
    description: {
      vi: 'Củng cố ngữ pháp học thuật, kỹ thuật Skimming & Scanning, phương pháp nghe note-taking và cấu trúc đoạn văn IELTS Writing Task 2.',
      en: 'Consolidate academic grammar, Skimming & Scanning techniques, listening note-taking methods, and IELTS Writing Task 2 paragraph structure.',
    },
  },
  'phase-02': {
    title: {
      vi: 'Giai đoạn 2: Tăng tốc kỹ năng & Xử lý đề thi chuyên sâu',
      en: 'Phase 2: Skill Acceleration & In-depth Exam Practice',
    },
    description: {
      vi: 'Luyện tập Reading Section 3 học thuật, Listening Section 4 bài giảng, phản xạ Speaking Part 3 và tư duy phản biện cho Writing Task 2.',
      en: 'Practice academic Reading Section 3, lecture-based Listening Section 4, spontaneous Speaking Part 3, and critical argumentation for Writing Task 2.',
    },
  },
  'phase-03': {
    title: {
      vi: 'Giai đoạn 3: Thực chiến phòng thi & Tinh chỉnh Band điểm',
      en: 'Phase 3: Real Exam Simulation & Band Score Polishing',
    },
    description: {
      vi: 'Giải các bộ đề thi thử hoàn chỉnh dưới áp lực thời gian thực, rà soát lỗi sai hệ thống và hoàn thiện phong thái thi.',
      en: 'Complete full-length timed mock exams under authentic test conditions, diagnose recurring error patterns, and refine exam stamina.',
    },
  },
}

// Translations for Weeks
const weekTranslations: Record<string, { title: { vi: string; en: string }; goal: { vi: string; en: string } }> = {
  'w-01': {
    title: {
      vi: 'Tuần 1: Xây dựng nền tảng từ vựng & Kỹ năng Đọc cốt lõi',
      en: 'Week 1: Core Vocabulary & Essential Reading Skills',
    },
    goal: {
      vi: 'Nắm vững phương pháp Skimming & Scanning, giải quyết dạng bài True/False/Not Given.',
      en: 'Master Skimming & Scanning methods and conquer True/False/Not Given questions.',
    },
  },
  'w-02': {
    title: {
      vi: 'Tuần 2: Kỹ năng Nghe Section 1 & 2 và Phân tích biểu đồ Writing Task 1',
      en: 'Week 2: Listening Note-taking & Writing Task 1 Graph Analysis',
    },
    goal: {
      vi: 'Đạt tối thiểu 8/10 câu Listening Section 1 và hoàn thành dàn bài Writing Task 1 dạng biểu đồ đường.',
      en: 'Achieve at least 8/10 in Listening Section 1 and structure a standard Line Graph for Writing Task 1.',
    },
  },
  'w-03': {
    title: {
      vi: 'Tuần 3: Phát triển ý tưởng Speaking Part 2 và Cấu trúc đoạn văn Writing Task 2',
      en: 'Week 3: Speaking Part 2 Cue Cards & Writing Task 2 Coherence',
    },
    goal: {
      vi: 'Luyện tập phương pháp mở rộng câu trả lời P-E-E (Point, Explanation, Example).',
      en: 'Practice the P-E-E idea expansion technique (Point, Explanation, Example) for fluent expression.',
    },
  },
}

// Translations for Lessons
const lessonTranslations: Record<string, { title: { vi: string; en: string }; objectives?: { vi: string[]; en: string[] } }> = {
  'les-101': {
    title: {
      vi: 'Kỹ thuật Skimming & Scanning trong IELTS Reading',
      en: 'Skimming & Scanning Techniques in IELTS Reading',
    },
    objectives: {
      vi: [
        'Phân biệt mục đích giữa Skimming (đọc lướt ý chính) và Scanning (tìm từ khóa cụ thể).',
        'Nhận biết paraphrase và từ đồng nghĩa trong đoạn văn học thuật.',
        'Thực hành định vị thông tin nhanh dưới áp lực thời gian.',
      ],
      en: [
        'Distinguish between Skimming (reading for main ideas) and Scanning (locating specific keywords).',
        'Identify academic paraphrases and contextual synonyms.',
        'Practice rapid information location under timed constraints.',
      ],
    },
  },
  'les-102': {
    title: {
      vi: 'Chiến thuật giải quyết dạng bài True / False / Not Given',
      en: 'Tactics for True / False / Not Given Questions',
    },
    objectives: {
      vi: [
        'Hiểu rõ sự khác biệt tuyệt đối giữa FALSE (mâu thuẫn thông tin) và NOT GIVEN (không có căn cứ khẳng định).',
        'Tránh suy diễn ngoài dữ kiện bài đọc.',
      ],
      en: [
        'Understand the absolute distinction between FALSE (contradictory) and NOT GIVEN (unverifiable).',
        'Eliminate unwarranted external assumptions beyond the given text.',
      ],
    },
  },
  'les-103': {
    title: {
      vi: 'Listening Section 1: Kỹ năng bắt từ và nhận diện bẫy sửa đổi thông tin',
      en: 'Listening Section 1: Word Capture & Self-Correction Distractors',
    },
    objectives: {
      vi: [
        'Ghi nhận chính xác số điện thoại, ngày tháng và đánh vần tên riêng.',
        'Nhận biết các từ nối bẫy như "Actually", "Sorry", "I meant".',
      ],
      en: [
        'Accurately capture telephone numbers, dates, and proper name spellings.',
        'Spot self-correction distractor phrases such as "Actually", "Sorry", "I meant".',
      ],
    },
  },
  'les-104': {
    title: {
      vi: 'Writing Task 1: Cấu trúc 4 đoạn chuẩn cho biểu đồ có xu hướng',
      en: 'Writing Task 1: 4-Paragraph Structure for Trend Graphs',
    },
    objectives: {
      vi: [
        'Viết mở bài Paraphrase trong 1 câu.',
        'Viết Overview nêu 2 đặc điểm nổi bật nhất (không đưa số liệu).',
        'Chia 2 đoạn thân bài hợp lý theo mốc thời gian hoặc nhóm số liệu.',
      ],
      en: [
        'Write a concise 1-sentence Introduction paraphrasing the prompt.',
        'Draft a high-impact Overview highlighting 2 major trends without raw data.',
        'Organize 2 coherent body paragraphs chronologically or by data groupings.',
      ],
    },
  },
}

// Translations for Lesson Steps
const stepTranslations: Record<string, { title: { vi: string; en: string }; content: { vi: string; en: string }; explanation?: { vi: string; en: string } }> = {
  's-1': {
    title: {
      vi: '1. Khái niệm cốt lõi',
      en: '1. Core Conceptual Foundation',
    },
    content: {
      vi: 'Skimming là kỹ thuật đọc nhanh toàn bài để nắm cấu trúc, chủ đề và ý chính của từng đoạn mà không dừng lại tra từ mới. Scanning là kỹ thuật rà soát mắt để tìm các từ khóa đặc biệt như tên riêng, con số, thuật ngữ.',
      en: 'Skimming is reading swiftly through the passage to comprehend overall structure, topic, and paragraph themes without pausing for new words. Scanning is visually surveying for specific signposts such as proper nouns, figures, and technical terms.',
    },
  },
  's-2': {
    title: {
      vi: '2. Ví dụ phân tích chuyên sâu',
      en: '2. In-depth Case Analysis',
    },
    content: {
      vi: 'Ví dụ bài đọc về "The Origin of Paper": Hãy xác định năm phát minh ra giấy và tên người chế tạo trong đoạn 1 mà không cần đọc từng từ.',
      en: 'Case study "The Origin of Paper": Identify the invention year and the inventor\'s name in paragraph 1 without reading line by line.',
    },
  },
  's-3': {
    title: {
      vi: '3. Bài tập thực hành nhanh',
      en: '3. Rapid Practice Drill',
    },
    content: {
      vi: 'Đọc đoạn văn ngắn và trả lời 2 câu hỏi định vị thông tin dưới áp lực thời gian.',
      en: 'Read the short excerpt and answer 2 timed information retrieval questions.',
    },
  },
}

export function localizeLearningPath(path: LearningPath, isEn: boolean): LearningPath {
  if (!path) return path

  return {
    ...path,
    title: isEn ? 'IELTS Band 7.0+ Mastery Path' : path.title,
    phases: path.phases.map((phase: LearningPhase) => {
      const pTrans = phaseTranslations[phase.id]
      const title = pTrans ? (isEn ? pTrans.title.en : pTrans.title.vi) : phase.title
      const description = pTrans ? (isEn ? pTrans.description.en : pTrans.description.vi) : phase.description

      return {
        ...phase,
        title,
        description,
        weeks: phase.weeks.map((week: WeekPlan) => {
          const wTrans = weekTranslations[week.id]
          const wTitle = wTrans ? (isEn ? wTrans.title.en : wTrans.title.vi) : week.title
          const wGoal = wTrans ? (isEn ? wTrans.goal.en : wTrans.goal.vi) : week.goal

          return {
            ...week,
            title: wTitle,
            goal: wGoal,
            lessons: week.lessons.map((lesson: Lesson) => {
              const lTrans = lessonTranslations[lesson.id]
              const lTitle = lTrans ? (isEn ? lTrans.title.en : lTrans.title.vi) : lesson.title
              const lObjectives = lTrans?.objectives
                ? isEn
                  ? lTrans.objectives.en
                  : lTrans.objectives.vi
                : lesson.objectives

              return {
                ...lesson,
                title: lTitle,
                objectives: lObjectives,
                steps: lesson.steps.map((step: LessonStep) => {
                  const sTrans = stepTranslations[step.id]
                  return {
                    ...step,
                    title: sTrans ? (isEn ? sTrans.title.en : sTrans.title.vi) : step.title,
                    content: sTrans ? (isEn ? sTrans.content.en : sTrans.content.vi) : step.content,
                  }
                }),
              }
            }),
          }
        }),
      }
    }),
  }
}

// Translations for Mock Test Packages
const mockTestTranslations: Record<
  string,
  {
    title: { vi: string; en: string }
    description: { vi: string; en: string }
    rightsNotice: { vi: string; en: string }
    instructions?: { vi: string[]; en: string[] }
  }
> = {
  'pkg-ielts-org-sample': {
    title: {
      vi: 'Bộ 1 — IELTS Academic Sample Practice',
      en: 'Package 1 — IELTS Academic Sample Practice',
    },
    description: {
      vi: 'Tập trung luyện tập chuyên sâu các dạng câu hỏi mẫu chuẩn hóa của IELTS Academic: Multiple Choice, True/False/Not Given, Matching Headings, Sentence Completion và Task 1 Graph Analysis.',
      en: 'Focused practice on standardized IELTS Academic question formats: Multiple Choice, True/False/Not Given, Matching Headings, Sentence Completion, and Task 1 Graph Analysis.',
    },
    rightsNotice: {
      vi: 'Bộ câu hỏi mẫu theo cấu trúc dạng bài chính thức của IELTS.org. Đây là tập hợp các dạng câu hỏi mẫu (Sample Tasks) đại diện cho đề thi Academic, không phải đề thi đầy đủ 40 câu.',
      en: 'Official sample tasks collection aligned with IELTS.org task structures. This is a collection of representative sample tasks for Academic test prep, not an official full 40-item exam.',
    },
    instructions: {
      vi: [
        'Gói thi gồm các dạng bài mẫu đại diện được công bố bởi IELTS.org.',
        'Phần Nghe bao gồm bài mẫu Form Completion và Multiple Choice.',
        'Phần Đọc gồm trích đoạn Academic Passage với các câu hỏi True/False/Not Given & Summary Completion.',
        'Phần Viết cung cấp đề mẫu Academic Task 1 (Line Graph) và Task 2 (Opinion Essay).',
      ],
      en: [
        'Examination package contains representative sample tasks published by IELTS.org.',
        'Listening section includes Form Completion and Multiple Choice samples.',
        'Reading section includes Academic Passage excerpts with T/F/NG and Summary Completion questions.',
        'Writing provides Academic Task 1 (Line Graph) and Task 2 (Opinion Essay) prompts.',
      ],
    },
  },
  'pkg-british-council-acad': {
    title: {
      vi: 'Bộ 2 — Complete IELTS Academic Mock Exam 01',
      en: 'Package 2 — Complete IELTS Academic Mock Exam 01',
    },
    description: {
      vi: 'Bộ đề luyện tập đầy đủ 4 kỹ năng chuẩn Cambridge & British Council: 40 câu Listening (30p), 40 câu Reading (60p), 2 Task Writing (60p) và 3 Part Speaking (14p).',
      en: 'Full 4-skill mock examination encompassing 40 Listening items (30m), 40 Reading items (60m), 2 Writing tasks (60m), and 3 Speaking parts (14m) referenced from British Council & Cambridge practice standards.',
    },
    rightsNotice: {
      vi: 'Cấu trúc đề tham chiếu theo chuẩn đề luyện thi của Hội đồng Anh (British Council). Nội dung câu hỏi và bài đọc được tự biên soạn định dạng tương đương nhằm mục đích ôn luyện khảo thí.',
      en: 'Exam structure referenced from British Council Take IELTS practice tests. Practice questions and passages are independently compiled to match authentic examination formats.',
    },
    instructions: {
      vi: [
        'Bài thi mô phỏng 4 kỹ năng hoàn chỉnh với đồng hồ đếm ngược tiêu chuẩn.',
        'Phần thi Nghe (40 câu) và Đọc (40 câu) được hệ thống chấm điểm tự động ngay sau khi nộp bài.',
        'Phần thi Viết và Nói nhận đánh giá tham khảo dựa trên 4 tiêu chí chấm thi chính thức.',
      ],
      en: [
        'Full 4-skill simulation with persistent countdown timers per section.',
        'Listening (40 questions) and Reading (40 questions) sections are automatically scored upon submission.',
        'Writing and Speaking receive diagnostic feedback aligned with the official 4-criterion rubric.',
      ],
    },
  },
  'pkg-bc-vn-computer-fam': {
    title: {
      vi: 'Bộ 3 — IELTS on Computer Familiarisation',
      en: 'Package 3 — IELTS on Computer Familiarisation',
    },
    description: {
      vi: 'Mô phỏng trải nghiệm thi trên máy tính (Computer-delivered IELTS): Giao diện đọc song song 2 cột, phát audio liên tục và công cụ đếm từ bài viết tự động.',
      en: 'Simulates Computer-delivered IELTS (CDI) interface: synchronized two-column reading, continuous audio streaming, and digital essay word counting.',
    },
    rightsNotice: {
      vi: 'Mô phỏng định dạng thi trên máy tính theo cấu trúc tham chiếu British Council Việt Nam. Phần thi Speaking là mô đun tự biên soạn bổ trợ từ hệ thống, không thuộc tài liệu gốc.',
      en: 'Simulates Computer-delivered IELTS layout referenced from British Council Vietnam. The Speaking test is an independently compiled supplemental module, not part of the original CDI test.',
    },
    instructions: {
      vi: [
        'Làm quen với thao tác trực tiếp trên máy tính: bôi đen văn bản, điều hướng câu hỏi và nhập câu trả lời trực tiếp.',
        'Phần Listening chỉ phát một lần duy nhất với tai nghe.',
        'Phần Writing tích hợp bộ đếm số từ tự động.',
      ],
      en: [
        'Familiarize with on-screen test tools: text highlighting, question navigator, and direct answer inputs.',
        'Listening audio plays once continuously through headphones.',
        'Writing includes an integrated real-time word counter.',
      ],
    },
  },
  'test-cam-18-01': {
    title: {
      vi: 'Cambridge IELTS 18 — Đề thi thử Academic hoàn chỉnh 01',
      en: 'Cambridge IELTS 18 — Full Academic Mock Test 01',
    },
    description: {
      vi: 'Bộ đề thi mô phỏng 100% cấu trúc của Cambridge IELTS 18. Gồm 4 phần Listening, 3 bài đọc Reading học thuật chuyên sâu, 2 Task Writing có tiêu chí chấm chi tiết và phòng thi Speaking có đồng hồ bấm giờ chuẩn quốc tế.',
      en: 'Authentic 4-skills practice exam modeled on Cambridge IELTS 18: 40 Listening items, 3 Academic Reading passages (40 items), 2 Writing tasks with rubric guidance, and full Speaking interview.',
    },
    rightsNotice: {
      vi: 'Đề thi thử 4 kỹ năng hoàn chỉnh mô phỏng cấu trúc khảo thí chuẩn mực của Cambridge IELTS 18: Đầy đủ 40 câu Listening, 40 câu Reading, 2 Task Writing và 3 Part Speaking với đáp án và thang điểm quy đổi chính thức.',
      en: 'Full 4-skills simulation strictly calibrated to Cambridge IELTS 18 assessment criteria: Complete 40 Listening questions, 40 Reading questions, 2 Writing tasks, and 3 Speaking parts with official answer keys.',
    },
    instructions: {
      vi: [
        'Thời lượng toàn bài thi: 2 giờ 45 phút (165 phút).',
        'Listening (30 phút): 4 Parts gồm 40 câu hỏi. Audio phát 1 lần duy nhất theo đúng quy chế thi.',
        'Reading (60 phút): 3 bài đọc học thuật với 40 câu hỏi. Hỗ trợ giao diện 2 cột chuẩn thi trên máy tính (CDI).',
        'Writing (60 phút): Task 1 (tối thiểu 150 từ) và Task 2 (tối thiểu 250 từ).',
        'Speaking (11-14 phút): Part 1 (Phỏng vấn cá nhân), Part 2 (Thuyết trình theo Cue Card có 1 phút chuẩn bị) và Part 3 (Thảo luận phản biện học thuật).',
      ],
      en: [
        'Total test duration: 2 hours 45 minutes (165 minutes).',
        'Listening (30 min): 4 parts, 40 questions. Audio plays once only per exam rules.',
        'Reading (60 min): 3 academic passages, 40 questions with split-screen CDI layout.',
        'Writing (60 min): Task 1 (minimum 150 words) and Task 2 (minimum 250 words).',
        'Speaking (11-14 min): Part 1 (Interview), Part 2 (Cue Card with 1-min prep timer), Part 3 (Two-way discussion).',
      ],
    },
  },
}

export function localizeMockTest(test: MockTest, isEn: boolean): MockTest {
  if (!test) return test
  const tTrans = mockTestTranslations[test.id]
  if (!tTrans) return test

  return {
    ...test,
    title: isEn ? tTrans.title.en : tTrans.title.vi,
    description: isEn ? tTrans.description.en : tTrans.description.vi,
    rightsNotice: isEn ? tTrans.rightsNotice.en : tTrans.rightsNotice.vi,
    instructions: tTrans.instructions ? (isEn ? tTrans.instructions.en : tTrans.instructions.vi) : test.instructions,
  }
}

export function localizeMockTestsList(tests: MockTest[], isEn: boolean): MockTest[] {
  return tests.map((t) => localizeMockTest(t, isEn))
}
