import {
  DailyStudyPlan,
  DailyStudyTask,
  SkillType,
} from '@/types/learningRules'
import { vocabIntelligenceService } from './vocabIntelligence'
import { errorBankService } from './errorBankService'
import { formatDateKey } from './srsEngine'

export const STORAGE_KEY_DAILY_PLAN = 'ielts_daily_plan_v1'

export interface DailyPlanConfig {
  dailyBudgetMinutes: number
  prioritySkills: SkillType[]
  targetExamDate?: string
  currentPhaseId?: string
}

export class DailyPlanEngine {
  private currentPlan: DailyStudyPlan | null = null

  constructor() {
    this.loadFromStorage()
  }

  private loadFromStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(STORAGE_KEY_DAILY_PLAN)
        if (stored) {
          this.currentPlan = JSON.parse(stored)
        }
      }
    } catch {
      this.currentPlan = null
    }
  }

  private saveToStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage && this.currentPlan) {
        localStorage.setItem(STORAGE_KEY_DAILY_PLAN, JSON.stringify(this.currentPlan))
      }
    } catch (e) {
      console.error('Failed to save daily plan to localStorage:', e)
    }
  }

  /**
   * Generate or retrieve today's study plan with strict time budgeting and missed-day rebalancing
   */
  public getOrCreateTodayPlan(config: DailyPlanConfig, todayDate: Date = new Date()): DailyStudyPlan {
    const todayKey = formatDateKey(todayDate)

    // 1. If today's plan already exists, return it
    if (this.currentPlan && this.currentPlan.date === todayKey) {
      return this.currentPlan
    }

    // 2. Check if yesterday's plan was missed
    let missedRebalancedFrom: string | undefined = undefined
    if (this.currentPlan && this.currentPlan.date < todayKey) {
      if (this.currentPlan.status !== 'completed') {
        missedRebalancedFrom = this.currentPlan.date
      }
    }

    // 3. Generate balanced tasks respecting budget minutes
    const budget = config.dailyBudgetMinutes || 45
    const tasks: DailyStudyTask[] = []
    let allocatedMinutes = 0

    // A. Priority 1: Due Spaced Repetition Vocabulary (High-retention memory safeguard)
    const dueVocab = vocabIntelligenceService.getDueForReview(todayDate)
    if (dueVocab.length > 0) {
      const vocabCount = Math.min(dueVocab.length, 10)
      const estTime = Math.max(5, Math.round(vocabCount * 1.5))
      tasks.push({
        id: `task-srs-${todayKey}`,
        title: `Ôn tập ${vocabCount} từ vựng Spaced Repetition đến hạn`,
        type: 'srs_review',
        skill: 'vocabulary',
        estimatedMinutes: estTime,
        completed: false,
        priority: 1,
        targetRefId: 'vocab-due-cards',
        url: '/app/practice/vocabulary/review',
      })
      allocatedMinutes += estTime
    }

    // B. Priority 2: Systemic Error Bank Remediation (If recurring errors exist)
    const errorClusters = errorBankService.analyzeRepeatedClusters()
    if (errorClusters.length > 0 && allocatedMinutes + 15 <= budget) {
      const topError = errorClusters[0]
      tasks.push({
        id: `task-err-${todayKey}`,
        title: `Khắc phục lỗi lặp: ${topError.errorType.replace(/_/g, ' ')} (${topError.skill})`,
        type: 'error_drill',
        skill: topError.skill,
        estimatedMinutes: 15,
        completed: false,
        priority: 2,
        targetRefId: topError.errorType,
        url: topError.remediationUrl,
      })
      allocatedMinutes += 15
    }

    // C. Priority 3: Core Curriculum Lesson
    const lessonMinutes = 20
    if (allocatedMinutes + lessonMinutes <= budget + 5) {
      tasks.push({
        id: `task-curriculum-${todayKey}`,
        title: 'Hoàn thành bài học tiếp theo trong Lộ trình đào tạo',
        type: 'lesson',
        skill: config.prioritySkills[0] || 'reading',
        estimatedMinutes: lessonMinutes,
        completed: false,
        priority: 3,
        targetRefId: 'curriculum-next',
        url: '/app/learning-path',
      })
      allocatedMinutes += lessonMinutes
    }

    // D. Priority 4: Targeted Writing or Section Practice (If budget permits)
    const remainingBudget = budget - allocatedMinutes
    if (remainingBudget >= 15) {
      tasks.push({
        id: `task-drill-${todayKey}`,
        title: 'Luyện tập kỹ năng trọng tâm: Phân tích & Viết luận Task 1/2',
        type: 'writing_task',
        skill: 'writing',
        estimatedMinutes: remainingBudget,
        completed: false,
        priority: 4,
        targetRefId: 'task-writing-drill',
        url: '/app/practice/writing',
      })
      allocatedMinutes += remainingBudget
    }

    // 4. Assemble clean Daily Plan object
    const newPlan: DailyStudyPlan = {
      date: todayKey,
      budgetMinutes: budget,
      allocatedMinutes,
      tasks,
      status: 'not_started',
      rebalancedFromDate: missedRebalancedFrom,
      completionPercentage: 0,
    }

    this.currentPlan = newPlan
    this.saveToStorage()
    return newPlan
  }

  /**
   * Toggle completion of a specific daily study task
   */
  public setTaskCompleted(taskId: string, completed: boolean): DailyStudyPlan | null {
    if (!this.currentPlan) return null

    const taskIndex = this.currentPlan.tasks.findIndex((t) => t.id === taskId)
    if (taskIndex === -1) return null

    const updatedTasks = [...this.currentPlan.tasks]
    updatedTasks[taskIndex] = {
      ...updatedTasks[taskIndex],
      completed,
    }

    const completedCount = updatedTasks.filter((t) => t.completed).length
    const completionPercentage = Math.round((completedCount / updatedTasks.length) * 100)

    let status: DailyStudyPlan['status'] = 'in_progress'
    if (completedCount === 0) status = 'not_started'
    else if (completedCount === updatedTasks.length) status = 'completed'

    this.currentPlan = {
      ...this.currentPlan,
      tasks: updatedTasks,
      completionPercentage,
      status,
    }

    this.saveToStorage()
    return this.currentPlan
  }
}

export const dailyPlanEngine = new DailyPlanEngine()
