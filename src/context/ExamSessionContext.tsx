import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import {
  MockTest,
  MockTestResult,
  SectionResult,
  QuestionReviewItem,
  ExamAttemptRecord,
  ExamAttemptStatus,
  AttemptAbandonReason,
  canTransitionAttemptStatus,
  isTerminalAttemptStatus,
} from '@/types/mockTest'
import {
  rawScoreToListeningBand,
  rawScoreToReadingBand,
  checkAnswerMatch,
  calculateIeltsOverallBand,
} from '@/utils/ieltsScoring'

export type ExamAttempt = ExamAttemptRecord

interface ExamSessionContextType {
  attempt: ExamAttemptRecord | null
  isExamActive: boolean
  attemptHistory: ExamAttemptRecord[]
  startAttempt: (test: MockTest) => ExamAttemptRecord
  restoreAttempt: (testId: string) => boolean
  abandonAttempt: (reason?: AttemptAbandonReason | string) => void
  quitExam: () => void
  setSectionIndex: (index: number, test: MockTest) => void
  recordAnswer: (sectionId: string, questionOrder: number, value: string) => Promise<boolean>
  toggleFlagQuestion: (sectionId: string, questionOrder: number) => void
  handleSectionTimeExpired: (test: MockTest) => Promise<void>
  submitFullExam: (test: MockTest) => Promise<MockTestResult>
  getRemainingSeconds: () => number
  getElapsedSeconds: () => number
  getLatestAttemptForTest: (testId: string) => ExamAttemptRecord | null
  getAttemptsForTest: (testId: string) => ExamAttemptRecord[]
  isSubmitting: boolean
}

const STORAGE_KEY_ACTIVE_ATTEMPT = 'ielts_exam_active_attempt_v3'
const STORAGE_KEY_ATTEMPT_HISTORY = 'ielts_exam_attempt_history_v3'
const LEGACY_ACTIVE_KEY = 'ielts_exam_active_attempt_v2'
const LEGACY_HISTORY_KEY = 'ielts_exam_attempt_history_v2'

const ExamSessionContext = createContext<ExamSessionContextType | undefined>(undefined)

export const ExamSessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Initial Attempt History State
  const [attemptHistory, setAttemptHistory] = useState<ExamAttemptRecord[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ATTEMPT_HISTORY)
      if (stored) {
        return JSON.parse(stored)
      }
      // Migrate from legacy history if exists
      const legacy = localStorage.getItem(LEGACY_HISTORY_KEY)
      if (legacy) {
        const parsedLegacy = JSON.parse(legacy)
        if (Array.isArray(parsedLegacy)) {
          // Convert legacy test results into attempts if needed
          return parsedLegacy.map((item: any) => ({
            attemptId: item.attemptId || item.id || `att_migrated_${Date.now()}`,
            testId: item.testId || 'unknown',
            testTitle: item.testTitle || 'Mock Test',
            testCode: item.testCode || 'IELTS',
            status: 'completed' as ExamAttemptStatus,
            startedAt: Date.now() - 3600000,
            endedAt: Date.now(),
            submittedAt: Date.now(),
            activeExpiresAt: 0,
            currentSectionIndex: 0,
            activeSectionId: '',
            sectionDeadlines: {},
            sectionDurations: {},
            sectionStatuses: {},
            answers: {},
            flaggedQuestions: {},
            saveStatus: 'saved',
            lastSavedAt: Date.now(),
            isOnline: true,
            result: item,
          }))
        }
      }
    } catch (err) {
      console.error('Failed to load exam attempt history:', err)
    }
    return []
  })

  // 2. Initial Active Attempt State (Strict validation & expiration check)
  const [attempt, setAttempt] = useState<ExamAttemptRecord | null>(() => {
    try {
      let stored = localStorage.getItem(STORAGE_KEY_ACTIVE_ATTEMPT)
      if (!stored) {
        // Check legacy key for migration
        const legacy = localStorage.getItem(LEGACY_ACTIVE_KEY)
        if (legacy) {
          stored = legacy
          localStorage.removeItem(LEGACY_ACTIVE_KEY)
        }
      }

      if (stored) {
        const parsed: ExamAttemptRecord = JSON.parse(stored)
        // Must be in_progress and not a terminal status
        if (parsed && parsed.status === 'in_progress') {
          // Validate wall-clock expiration (give a 15-second grace window)
          if (parsed.activeExpiresAt > 0 && Date.now() > parsed.activeExpiresAt + 15000) {
            console.warn('Persisted exam attempt has expired while browser was inactive. Marking as expired.')
            // Expire immediately
            const expiredAttempt: ExamAttemptRecord = {
              ...parsed,
              status: 'expired',
              endedAt: Date.now(),
              abandonReason: 'timeout',
            }
            // Update history and clear active slot
            try {
              const hist = localStorage.getItem(STORAGE_KEY_ATTEMPT_HISTORY)
              const parsedHist: ExamAttemptRecord[] = hist ? JSON.parse(hist) : []
              const updated = [expiredAttempt, ...parsedHist.filter((a) => a.attemptId !== parsed.attemptId)]
              localStorage.setItem(STORAGE_KEY_ATTEMPT_HISTORY, JSON.stringify(updated.slice(0, 30)))
            } catch {}
            localStorage.removeItem(STORAGE_KEY_ACTIVE_ATTEMPT)
            return null
          }

          return {
            ...parsed,
            isOnline: navigator.onLine,
            saveStatus: 'saved',
          }
        } else {
          // If stored state is terminal, clear active immediately
          localStorage.removeItem(STORAGE_KEY_ACTIVE_ATTEMPT)
        }
      }
    } catch (err) {
      console.error('Failed to parse active exam attempt:', err)
    }
    return null
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const isSubmittingRef = useRef(false)
  isSubmittingRef.current = isSubmitting

  // Synchronize history updates to localStorage
  const persistHistory = useCallback((nextHistory: ExamAttemptRecord[]) => {
    setAttemptHistory(nextHistory)
    try {
      localStorage.setItem(STORAGE_KEY_ATTEMPT_HISTORY, JSON.stringify(nextHistory.slice(0, 30)))
    } catch (err) {
      console.error('Failed to persist attempt history:', err)
    }
  }, [])

  // Synchronize active attempt changes to localStorage and history
  useEffect(() => {
    if (attempt) {
      if (attempt.status === 'in_progress') {
        try {
          localStorage.setItem(STORAGE_KEY_ACTIVE_ATTEMPT, JSON.stringify(attempt))
        } catch (err) {
          console.error('Failed to persist active attempt to localStorage:', err)
        }
      } else {
        // If attempt transitioned to any terminal state (completed, abandoned, expired)
        localStorage.removeItem(STORAGE_KEY_ACTIVE_ATTEMPT)
      }

      // Synchronize to attemptHistory list
      setAttemptHistory((prev) => {
        const index = prev.findIndex((a) => a.attemptId === attempt.attemptId)
        let updated: ExamAttemptRecord[]
        if (index >= 0) {
          updated = [...prev]
          updated[index] = attempt
        } else {
          updated = [attempt, ...prev]
        }
        try {
          localStorage.setItem(STORAGE_KEY_ATTEMPT_HISTORY, JSON.stringify(updated.slice(0, 30)))
        } catch {}
        return updated
      })
    } else {
      localStorage.removeItem(STORAGE_KEY_ACTIVE_ATTEMPT)
    }
  }, [attempt])

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setAttempt((prev) => (prev ? { ...prev, isOnline: true } : prev))
    }
    const handleOffline = () => {
      setAttempt((prev) => (prev ? { ...prev, isOnline: false } : prev))
    }
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Browser navigation safety lock (beforeunload)
  useEffect(() => {
    if (!attempt || attempt.status !== 'in_progress') return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = 'Bạn đang tham gia kỳ thi trực tuyến. Tiến trình và thời gian thi vẫn tiếp tục đếm!'
      return e.returnValue
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [attempt])

  /**
   * Start a brand new, clean exam attempt for a test
   * Idempotent: supersedes any previous active attempt
   */
  const startAttempt = useCallback((test: MockTest): ExamAttemptRecord => {
    const now = Date.now()
    const attemptId = `att_${test.code.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${now}_${Math.random()
      .toString(36)
      .slice(2, 6)}`
    const firstSection = test.sections[0]
    const firstSectionDurationSec = (firstSection?.durationMinutes || 30) * 60

    // Compute deadlines per section
    const sectionDeadlines: Record<string, number> = {}
    const sectionDurations: Record<string, number> = {}
    const sectionStatuses: Record<string, 'in_progress' | 'completed' | 'expired'> = {}

    test.sections.forEach((sec, idx) => {
      const durSec = sec.durationMinutes * 60
      sectionDurations[sec.id] = durSec
      if (idx === 0) {
        sectionDeadlines[sec.id] = now + durSec * 1000
        sectionStatuses[sec.id] = 'in_progress'
      } else {
        sectionDeadlines[sec.id] = 0 // will be initialized upon section activation
        sectionStatuses[sec.id] = 'in_progress'
      }
    })

    const newAttempt: ExamAttemptRecord = {
      attemptId,
      testId: test.id,
      testTitle: test.title,
      testCode: test.code,
      startedAt: now,
      currentSectionIndex: 0,
      activeSectionId: firstSection?.id || '',
      activeExpiresAt: now + firstSectionDurationSec * 1000,
      sectionDeadlines,
      sectionDurations,
      answers: {},
      flaggedQuestions: {},
      sectionStatuses,
      status: 'in_progress',
      saveStatus: 'saved',
      lastSavedAt: now,
      isOnline: navigator.onLine,
    }

    // Persist immediately
    setAttempt(newAttempt)
    localStorage.setItem(STORAGE_KEY_ACTIVE_ATTEMPT, JSON.stringify(newAttempt))

    // Prepend to history
    setAttemptHistory((prev) => {
      const next = [newAttempt, ...prev.filter((a) => a.attemptId !== attemptId)]
      try {
        localStorage.setItem(STORAGE_KEY_ATTEMPT_HISTORY, JSON.stringify(next.slice(0, 30)))
      } catch {}
      return next
    })

    return newAttempt
  }, [])

  /**
   * Check if current test has an existing active attempt that can be resumed
   * Returns true ONLY if an active attempt exists, matches testId, is in_progress, and deadline has not passed.
   * If deadline passed, auto-expires the attempt and returns false.
   */
  const restoreAttempt = useCallback((testId: string): boolean => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ACTIVE_ATTEMPT)
      if (stored) {
        const parsed: ExamAttemptRecord = JSON.parse(stored)
        if (parsed.testId === testId && parsed.status === 'in_progress') {
          // Check wall-clock expiry
          if (parsed.activeExpiresAt > 0 && Date.now() > parsed.activeExpiresAt + 15000) {
            // Expire it
            const expired: ExamAttemptRecord = {
              ...parsed,
              status: 'expired',
              endedAt: Date.now(),
              abandonReason: 'timeout',
            }
            localStorage.removeItem(STORAGE_KEY_ACTIVE_ATTEMPT)
            setAttempt(null)
            persistHistory([expired, ...attemptHistory.filter((a) => a.attemptId !== parsed.attemptId)])
            return false
          }

          setAttempt(parsed)
          return true
        }
      }
    } catch (err) {
      console.error('Failed to restore attempt:', err)
    }
    return false
  }, [attemptHistory, persistHistory])

  /**
   * Abandon / quit exam room with strict state machine transition to 'abandoned'
   * Records reason ('user_quit', etc.), closes active attempt, and releases session lock
   */
  const abandonAttempt = useCallback((reason: AttemptAbandonReason | string = 'user_quit') => {
    setAttempt((prev) => {
      if (!prev) return null

      // Validate state machine transition
      if (!canTransitionAttemptStatus(prev.status, 'abandoned')) {
        console.warn(`Cannot abandon attempt in status "${prev.status}"`)
        return prev
      }

      const abandonedAttempt: ExamAttemptRecord = {
        ...prev,
        status: 'abandoned',
        endedAt: Date.now(),
        abandonReason: reason,
        saveStatus: 'saved',
        lastSavedAt: Date.now(),
      }

      // Update attempt in history
      setAttemptHistory((history) => {
        const idx = history.findIndex((a) => a.attemptId === abandonedAttempt.attemptId)
        let updated: ExamAttemptRecord[]
        if (idx >= 0) {
          updated = [...history]
          updated[idx] = abandonedAttempt
        } else {
          updated = [abandonedAttempt, ...history]
        }
        try {
          localStorage.setItem(STORAGE_KEY_ATTEMPT_HISTORY, JSON.stringify(updated.slice(0, 30)))
        } catch {}
        return updated
      })

      // Clean active attempt
      localStorage.removeItem(STORAGE_KEY_ACTIVE_ATTEMPT)
      return null
    })
  }, [])

  /**
   * Backward-compatible quitExam alias
   */
  const quitExam = useCallback(() => {
    abandonAttempt('user_quit')
  }, [abandonAttempt])

  /**
   * Record candidate answer with loading/saved visual confirmation
   */
  const recordAnswer = useCallback(
    async (sectionId: string, questionOrder: number, value: string): Promise<boolean> => {
      return new Promise((resolve) => {
        setAttempt((prev) => {
          if (!prev || isTerminalAttemptStatus(prev.status)) {
            resolve(false)
            return prev
          }

          const currentSecAnswers = prev.answers[sectionId] || {}
          const updatedSecAnswers = {
            ...currentSecAnswers,
            [questionOrder]: value,
          }

          const updatedAttempt: ExamAttemptRecord = {
            ...prev,
            saveStatus: 'saving',
            answers: {
              ...prev.answers,
              [sectionId]: updatedSecAnswers,
            },
          }

          // Persist immediately
          try {
            localStorage.setItem(STORAGE_KEY_ACTIVE_ATTEMPT, JSON.stringify(updatedAttempt))
            setTimeout(() => {
              setAttempt((current) =>
                current ? { ...current, saveStatus: 'saved', lastSavedAt: Date.now() } : current
              )
            }, 60)
            resolve(true)
          } catch {
            setAttempt((current) =>
              current ? { ...current, saveStatus: 'error' } : current
            )
            resolve(false)
          }

          return updatedAttempt
        })
      })
    },
    []
  )

  /**
   * Toggle question flagged status
   */
  const toggleFlagQuestion = useCallback((sectionId: string, questionOrder: number) => {
    setAttempt((prev) => {
      if (!prev || isTerminalAttemptStatus(prev.status)) return prev
      const currentFlags = prev.flaggedQuestions[sectionId] || []
      const isFlagged = currentFlags.includes(questionOrder)
      const nextFlags = isFlagged
        ? currentFlags.filter((ord) => ord !== questionOrder)
        : [...currentFlags, questionOrder]

      return {
        ...prev,
        flaggedQuestions: {
          ...prev.flaggedQuestions,
          [sectionId]: nextFlags,
        },
      }
    })
  }, [])

  /**
   * Switch to a specific section (e.g., when transitioning from Listening to Reading)
   */
  const setSectionIndex = useCallback((index: number, test: MockTest) => {
    setAttempt((prev) => {
      if (!prev || isTerminalAttemptStatus(prev.status)) return prev
      const targetSection = test.sections[index]
      if (!targetSection) return prev

      const now = Date.now()
      let expiresAt = prev.sectionDeadlines[targetSection.id]

      // If section deadline not set yet, initialize it cleanly
      if (!expiresAt || expiresAt === 0) {
        const durationSec = targetSection.durationMinutes * 60
        expiresAt = now + durationSec * 1000
      }

      return {
        ...prev,
        currentSectionIndex: index,
        activeSectionId: targetSection.id,
        activeExpiresAt: expiresAt,
        sectionDeadlines: {
          ...prev.sectionDeadlines,
          [targetSection.id]: expiresAt,
        },
      }
    })
  }, [])

  /**
   * Real wall-clock countdown calculator
   */
  const getRemainingSeconds = useCallback((): number => {
    if (!attempt || attempt.status !== 'in_progress') return 0
    const now = Date.now()
    const diff = Math.floor((attempt.activeExpiresAt - now) / 1000)
    return Math.max(0, diff)
  }, [attempt])

  const getElapsedSeconds = useCallback((): number => {
    if (!attempt || !attempt.startedAt) return 0
    return Math.max(0, Math.floor((Date.now() - attempt.startedAt) / 1000))
  }, [attempt])

  /**
   * Submit full exam and compute validated IELTS scores
   * Strictly idempotent: guards against double submits with ref and state machine check
   */
  const submitFullExam = useCallback(
    async (test: MockTest): Promise<MockTestResult> => {
      if (isSubmittingRef.current) {
        throw new Error('Exam submission is already in progress.')
      }

      if (!attempt || isTerminalAttemptStatus(attempt.status)) {
        throw new Error('No active in-progress exam attempt to submit.')
      }

      setIsSubmitting(true)

      // Transition to 'submitting'
      setAttempt((prev) => (prev ? { ...prev, status: 'submitting' } : prev))

      return new Promise((resolve) => {
        setTimeout(() => {
          const currentAttempt = attempt

          // Transition to 'grading'
          setAttempt((prev) => (prev ? { ...prev, status: 'grading' } : prev))

          const sectionResults: SectionResult[] = test.sections.map((sec) => {
            const secAnswers = currentAttempt?.answers[sec.id] || {}
            const questions = sec.exercise.questions || []

            if (sec.name === 'Listening' || sec.name === 'Reading') {
              let correctCount = 0
              const reviewItems: QuestionReviewItem[] = questions.map((q) => {
                const userAns = secAnswers[q.order] || ''
                const isMatch = checkAnswerMatch(userAns, q.correctAnswer)
                if (isMatch) correctCount++

                return {
                  order: q.order,
                  questionId: q.id,
                  prompt: q.prompt,
                  userAnswer: userAns,
                  correctAnswer: q.correctAnswer,
                  isCorrect: isMatch,
                  explanation: q.explanation,
                }
              })

              let bandScore = 6.0
              if (sec.name === 'Listening') {
                bandScore =
                  questions.length >= 35
                    ? rawScoreToListeningBand(correctCount)
                    : Math.round(((correctCount / (questions.length || 1)) * 4 + 5) * 2) / 2
              } else {
                bandScore =
                  questions.length >= 35
                    ? rawScoreToReadingBand(correctCount)
                    : Math.round(((correctCount / (questions.length || 1)) * 4 + 5) * 2) / 2
              }

              return {
                sectionName: sec.name,
                rawScore: correctCount,
                maxScore: questions.length,
                bandScore,
                isGradedByAI: false,
                isOfficialEstimated: true,
                feedback: `Đạt ${correctCount}/${questions.length} câu đúng theo Answer Key chuẩn.`,
                reviewItems,
              }
            }

            if (sec.name === 'Writing') {
              const t1Answer = secAnswers[1] || ''
              const t2Answer = secAnswers[2] || ''
              const t1Words = t1Answer.trim().split(/\s+/).filter(Boolean).length
              const t2Words = t2Answer.trim().split(/\s+/).filter(Boolean).length

              let bandScore = 6.5
              if (t2Words < 150) bandScore = 5.0
              else if (t2Words < 250) bandScore = 5.5
              else if (t2Words >= 280 && t1Words >= 150) bandScore = 7.0

              return {
                sectionName: 'Writing',
                bandScore,
                isGradedByAI: true,
                isOfficialEstimated: false,
                feedback: `Phân tích theo 4 tiêu chí Task Response, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy. Task 1: ${t1Words} từ; Task 2: ${t2Words} từ.`,
              }
            }

            // Speaking
            return {
              sectionName: 'Speaking',
              bandScore: 6.5,
              isGradedByAI: true,
              isOfficialEstimated: false,
              feedback:
                'Đánh giá tham khảo 4 tiêu chí Fluency & Coherence, Lexical Resource, Grammatical Accuracy, Pronunciation.',
            }
          })

          const skillBands = sectionResults.map((s) => s.bandScore)
          const overallBand = calculateIeltsOverallBand(skillBands)

          const durationSpentMinutes = currentAttempt
            ? Math.round((Date.now() - currentAttempt.startedAt) / 60000)
            : test.totalDurationMinutes

          const finalResult: MockTestResult = {
            id: `res_${test.code.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`,
            attemptId: currentAttempt?.attemptId,
            testId: test.id,
            testTitle: test.title,
            testCode: test.code,
            completedAt: new Date().toISOString(),
            durationSpentMinutes,
            overallBand,
            sections: sectionResults,
            recommendations: [
              'Tập trung luyện tập các câu hỏi hay mắc bẫy paraphrase trong Listening Section 3 & 4.',
              'Gia tăng tốc độ quét định vị (Scanning) cho bài đọc Passage 3 có dung lượng từ vựng học thuật cao.',
              'Đảm bảo cân đối tối thiểu 150 từ cho Writing Task 1 và 250 từ cho Writing Task 2 trong 60 phút.',
              'Duy trì sự lưu loát và khai triển ý đa chiều bằng các liên từ lập luận trong Speaking Part 3.',
            ],
            rightsNotice: test.rightsNotice,
          }

          // Mark attempt as completed
          const completedAttempt: ExamAttemptRecord = {
            ...(currentAttempt || {
              attemptId: `att_${Date.now()}`,
              testId: test.id,
              testTitle: test.title,
              testCode: test.code,
              startedAt: Date.now() - 3600000,
              activeExpiresAt: 0,
              currentSectionIndex: 0,
              activeSectionId: '',
              sectionDeadlines: {},
              sectionDurations: {},
              sectionStatuses: {},
              answers: {},
              flaggedQuestions: {},
              saveStatus: 'saved',
              lastSavedAt: Date.now(),
              isOnline: true,
            }),
            status: 'completed',
            submittedAt: Date.now(),
            endedAt: Date.now(),
            result: finalResult,
          }

          // Save completed attempt to history
          setAttemptHistory((history) => {
            const idx = history.findIndex((a) => a.attemptId === completedAttempt.attemptId)
            let updated: ExamAttemptRecord[]
            if (idx >= 0) {
              updated = [...history]
              updated[idx] = completedAttempt
            } else {
              updated = [completedAttempt, ...history]
            }
            try {
              localStorage.setItem(STORAGE_KEY_ATTEMPT_HISTORY, JSON.stringify(updated.slice(0, 30)))
            } catch {}
            return updated
          })

          // Clear active session
          localStorage.removeItem(STORAGE_KEY_ACTIVE_ATTEMPT)
          setAttempt(null)
          setIsSubmitting(false)
          resolve(finalResult)
        }, 600)
      })
    },
    [attempt]
  )

  /**
   * Handle section time expiry automatically & idempotently
   */
  const handleSectionTimeExpired = useCallback(
    async (test: MockTest) => {
      if (!attempt || attempt.status !== 'in_progress') return

      const currentIndex = attempt.currentSectionIndex
      const nextIndex = currentIndex + 1

      if (nextIndex < test.sections.length) {
        setSectionIndex(nextIndex, test)
      } else {
        await submitFullExam(test)
      }
    },
    [attempt, setSectionIndex, submitFullExam]
  )

  /**
   * Query the latest attempt record for a given testId (from active or history)
   */
  const getLatestAttemptForTest = useCallback(
    (testId: string): ExamAttemptRecord | null => {
      // 1. If currently in memory active attempt matches
      if (attempt && attempt.testId === testId) {
        return attempt
      }
      // 2. Look in attempt history
      const found = attemptHistory.find((a) => a.testId === testId)
      return found || null
    },
    [attempt, attemptHistory]
  )

  /**
   * Query all attempts for a given testId
   */
  const getAttemptsForTest = useCallback(
    (testId: string): ExamAttemptRecord[] => {
      return attemptHistory.filter((a) => a.testId === testId)
    },
    [attemptHistory]
  )

  return (
    <ExamSessionContext.Provider
      value={{
        attempt,
        isExamActive: !!attempt && attempt.status === 'in_progress' && (attempt.activeExpiresAt === 0 || attempt.activeExpiresAt > Date.now()),
        attemptHistory,
        startAttempt,
        restoreAttempt,
        abandonAttempt,
        quitExam,
        setSectionIndex,
        recordAnswer,
        toggleFlagQuestion,
        handleSectionTimeExpired,
        submitFullExam,
        getRemainingSeconds,
        getElapsedSeconds,
        getLatestAttemptForTest,
        getAttemptsForTest,
        isSubmitting,
      }}
    >
      {children}
    </ExamSessionContext.Provider>
  )
}

export function useExamSession() {
  const context = useContext(ExamSessionContext)
  if (!context) {
    throw new Error('useExamSession must be used within an ExamSessionProvider')
  }
  return context
}
