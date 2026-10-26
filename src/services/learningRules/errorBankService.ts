import {
  LearnerErrorRecord,
  SkillType,
  ErrorPriority,
  ErrorClusterAnalysis,
} from '@/types/learningRules'

export const STORAGE_KEY_ERROR_BANK = 'ielts_error_bank_v1'

export const INITIAL_ERROR_BANK_SEED: LearnerErrorRecord[] = [
  {
    id: 'err-read-tfng-01',
    userId: 'u-current',
    skill: 'reading',
    errorType: 'not_given_vs_false_confusion',
    promptContext: 'Passage 2: Vertical farming produces 40% higher yields than traditional soil agriculture in arid climates.',
    userMistake: 'FALSE',
    correctCorrection: 'NOT GIVEN',
    explanation:
      'Bài đọc chỉ đề cập sản lượng tăng khi kiểm soát nhiệt độ (CEA), hoàn toàn không nêu số liệu 40% hay so sánh cụ thể tại "arid climates". Nhầm lẫn phổ biến: Cho rằng không có dẫn chứng nghĩa là False.',
    occurrenceCount: 3,
    firstDetectedAt: '2026-10-22T08:30:00Z',
    lastDetectedAt: '2026-10-25T14:15:00Z',
    priority: 'high',
    remediationLessonId: 'les-102',
    remediationExerciseId: 'read-01',
    resolved: false,
  },
  {
    id: 'err-lis-plural-01',
    userId: 'u-current',
    skill: 'listening',
    errorType: 'singular_plural_suffix_omission',
    promptContext: 'Section 1 Form Completion: Types of accommodation available -> "Shared apartment ______"',
    userMistake: 'balcony',
    correctCorrection: 'balconies',
    explanation:
      'Băng ghi âm phát âm rõ âm đuôi số nhiều /iːz/. Trong IELTS Listening, sai số ít/số nhiều (ending -s/-es) bị tính là câu trả lời sai hoàn toàn.',
    occurrenceCount: 2,
    firstDetectedAt: '2026-10-24T10:00:00Z',
    lastDetectedAt: '2026-10-26T09:20:00Z',
    priority: 'medium',
    remediationLessonId: 'les-101',
    remediationExerciseId: 'lis-01',
    resolved: false,
  },
  {
    id: 'err-writ-colloc-01',
    userId: 'u-current',
    skill: 'writing',
    errorType: 'unnatural_collocation_clash',
    promptContext: 'Task 2 Essay Introduction: "The government should make efforts to..."',
    userMistake: 'make an impact to the environment',
    correctCorrection: 'have an impact on / exert an influence on the environment',
    explanation:
      'Collocation chuẩn học thuật là "have an impact on", không dùng giới từ "to" và không kết hợp với động từ "make".',
    occurrenceCount: 2,
    firstDetectedAt: '2026-10-21T16:00:00Z',
    lastDetectedAt: '2026-10-25T19:30:00Z',
    priority: 'medium',
    remediationExerciseId: 'writ-01',
    resolved: false,
  },
  {
    id: 'err-gram-inversion-01',
    userId: 'u-current',
    skill: 'grammar',
    errorType: 'inversion_auxiliary_omission',
    promptContext: 'Advanced Grammar Drill: "Rarely municipal authorities implement..."',
    userMistake: 'Rarely authorities implement policies without debate',
    correctCorrection: 'Rarely do municipal authorities implement policies without debate',
    explanation:
      'Khi trạng từ phủ định/bán phủ định đứng đầu câu (Rarely, Seldom, Under no circumstances), bắt buộc phải đảo trợ động từ (do/did/have) lên trước chủ ngữ.',
    occurrenceCount: 1,
    firstDetectedAt: '2026-10-26T11:00:00Z',
    lastDetectedAt: '2026-10-26T11:00:00Z',
    priority: 'low',
    remediationLessonId: 'les-103',
    resolved: false,
  },
]

export class ErrorBankService {
  private errors: LearnerErrorRecord[] = []

  constructor() {
    this.loadFromStorage()
  }

  private loadFromStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(STORAGE_KEY_ERROR_BANK)
        if (stored) {
          this.errors = JSON.parse(stored)
          return
        }
      }
      this.errors = [...INITIAL_ERROR_BANK_SEED]
      this.saveToStorage()
    } catch {
      this.errors = [...INITIAL_ERROR_BANK_SEED]
    }
  }

  private saveToStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEY_ERROR_BANK, JSON.stringify(this.errors))
      }
    } catch (e) {
      console.error('Failed to save error bank to localStorage:', e)
    }
  }

  /**
   * Determine priority level based on repetition and error severity
   */
  public computePriority(count: number): ErrorPriority {
    if (count >= 4) return 'critical'
    if (count >= 3) return 'high'
    if (count >= 2) return 'medium'
    return 'low'
  }

  /**
   * Record a learner mistake with deduplication and repetition counting
   */
  public recordMistake(
    skill: SkillType,
    errorType: string,
    promptContext: string,
    userMistake: string,
    correctCorrection: string,
    explanation: string,
    options?: {
      remediationLessonId?: string
      remediationExerciseId?: string
      userId?: string
    }
  ): LearnerErrorRecord {
    const nowIso = new Date().toISOString()

    // Look for matching error pattern
    const existingIndex = this.errors.findIndex(
      (e) =>
        e.skill === skill &&
        e.errorType === errorType &&
        (!e.resolved)
    )

    if (existingIndex >= 0) {
      const existing = this.errors[existingIndex]
      const newCount = existing.occurrenceCount + 1
      const updated: LearnerErrorRecord = {
        ...existing,
        promptContext,
        userMistake,
        correctCorrection,
        explanation,
        occurrenceCount: newCount,
        lastDetectedAt: nowIso,
        priority: this.computePriority(newCount),
        remediationLessonId: options?.remediationLessonId || existing.remediationLessonId,
        remediationExerciseId: options?.remediationExerciseId || existing.remediationExerciseId,
      }
      this.errors[existingIndex] = updated
      this.saveToStorage()
      return updated
    } else {
      const newRecord: LearnerErrorRecord = {
        id: `err_${skill}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        userId: options?.userId || 'u-current',
        skill,
        errorType,
        promptContext,
        userMistake,
        correctCorrection,
        explanation,
        occurrenceCount: 1,
        firstDetectedAt: nowIso,
        lastDetectedAt: nowIso,
        priority: 'low', // 1 occurrence is not yet considered systemic weakness
        remediationLessonId: options?.remediationLessonId,
        remediationExerciseId: options?.remediationExerciseId,
        resolved: false,
      }
      this.errors.unshift(newRecord)
      this.saveToStorage()
      return newRecord
    }
  }

  public getAll(): LearnerErrorRecord[] {
    return this.errors
  }

  public getUnresolved(): LearnerErrorRecord[] {
    return this.errors.filter((e) => !e.resolved)
  }

  /**
   * Cluster errors to distinguish random slips from systemic repeated weaknesses
   */
  public analyzeRepeatedClusters(): ErrorClusterAnalysis[] {
    const unresolved = this.getUnresolved()
    const groups: Record<string, LearnerErrorRecord[]> = {}

    unresolved.forEach((e) => {
      const key = `${e.skill}:${e.errorType}`
      if (!groups[key]) groups[key] = []
      groups[key].push(e)
    })

    const clusters: ErrorClusterAnalysis[] = []

    for (const [key, records] of Object.entries(groups)) {
      const totalOccurrences = records.reduce((sum, r) => sum + r.occurrenceCount, 0)
      const first = records[0]

      // Only flag as systemic weakness if occurrence count >= 2
      if (totalOccurrences >= 2) {
        let recommendedAction = ''
        let remediationUrl = '/app/learning-path'

        if (first.skill === 'reading') {
          recommendedAction = 'Thực hiện bài luyện Skimming/Scanning và phân biệt T/F/NG với tài liệu Passage 2'
          remediationUrl = '/app/practice/reading'
        } else if (first.skill === 'listening') {
          recommendedAction = 'Luyện nghe phát hiện đuôi danh từ số nhiều và biểu mẫu điền từ'
          remediationUrl = '/app/practice/listening'
        } else if (first.skill === 'writing') {
          recommendedAction = 'Thực hành kết hợp Collocations học thuật chuẩn Cambridge'
          remediationUrl = '/app/practice/writing'
        } else {
          recommendedAction = 'Ôn tập cấu trúc ngữ pháp học thuật trọng điểm'
          remediationUrl = '/app/practice/grammar'
        }

        clusters.push({
          skill: first.skill,
          errorType: first.errorType,
          occurrenceCount: totalOccurrences,
          priority: this.computePriority(totalOccurrences),
          sampleContexts: records.map((r) => r.promptContext).slice(0, 3),
          recommendedAction,
          remediationUrl,
        })
      }
    }

    // Sort by occurrence and priority
    return clusters.sort((a, b) => b.occurrenceCount - a.occurrenceCount)
  }

  public markResolved(errorId: string): boolean {
    const idx = this.errors.findIndex((e) => e.id === errorId)
    if (idx >= 0) {
      this.errors[idx] = {
        ...this.errors[idx],
        resolved: true,
        resolvedAt: new Date().toISOString(),
      }
      this.saveToStorage()
      return true
    }
    return false
  }
}

export const errorBankService = new ErrorBankService()
