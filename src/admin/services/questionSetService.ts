import { QuestionSet, BuilderSection, BuilderQuestionGroup, BuilderQuestionItem } from '../types/questionBuilder'
import { MockTest, MockTestSection, ReadingPassage } from '@/types/mockTest'
import { PracticeExercise, Question } from '@/types/practice'
import { validateQuestionSet } from './questionValidator'
import { officialFreeMockPackages } from '@/services/mockTestPackages'
import { cambridgeAcademic18MockTest } from '@/services/cambridgeMockTest'
import { normalizeQuestionType } from './questionParser'

const STORAGE_KEY_QUESTION_SETS = 'ielts_admin_question_sets_v2'

/**
 * Converts a student MockTest model into the admin Builder QuestionSet model
 */
export function convertFromMockTest(test: MockTest): QuestionSet {
  const sections: BuilderSection[] = (test.sections || []).map((sec, secIdx) => {
    // If section has passages and questions, group them intelligently
    const groups: BuilderQuestionGroup[] = []
    const questions = sec.exercise?.questions || []

    if (sec.passages && sec.passages.length > 0) {
      sec.passages.forEach((p, pIdx) => {
        const [startQ, endQ] = p.questionRange || [1, questions.length]
        const groupQuestions = questions.filter((q) => q.order >= startQ && q.order <= endQ)

        groups.push({
          id: `grp-${sec.name.toLowerCase()}-${pIdx + 1}`,
          sectionName: sec.name,
          passageId: p.id,
          title: `Questions ${startQ}-${endQ}: ${p.title}`,
          instructions: sec.exercise?.questionTypeCategory || 'Answer the questions according to the passage.',
          questionRange: [startQ, endQ],
          questionType: groupQuestions[0]?.type ? normalizeQuestionType(groupQuestions[0].type) : 'multiple_choice',
          questions: groupQuestions.map((q) => ({
            id: q.id,
            order: q.order,
            type: normalizeQuestionType(q.type),
            prompt: q.prompt,
            options: q.options || [],
            correctAnswer: q.correctAnswer,
            explanation: q.explanation || '',
            evidenceSnippet: q.evidenceSnippet || '',
            evidenceParagraph: q.evidenceParagraph,
            points: 1,
            status: 'valid',
            sourceConfidence: 'extracted',
          })),
        })
      })
    } else {
      // Single group for Listening or standalone sections
      groups.push({
        id: `grp-${sec.name.toLowerCase()}-1`,
        sectionName: sec.name,
        title: `${sec.name} Questions 1-${questions.length || 1}`,
        instructions: sec.exercise?.questionTypeCategory || 'Listen and complete the questions.',
        questionRange: [1, questions.length || 1],
        questionType: questions[0]?.type ? normalizeQuestionType(questions[0].type) : 'multiple_choice',
        questions: questions.map((q) => ({
          id: q.id,
          order: q.order,
          type: normalizeQuestionType(q.type),
          prompt: q.prompt,
          options: q.options || [],
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || '',
          evidenceSnippet: q.evidenceSnippet || '',
          points: 1,
          status: 'valid',
          sourceConfidence: 'extracted',
        })),
      })
    }

    return {
      id: sec.id || `sec-${secIdx + 1}`,
      name: sec.name,
      durationMinutes: sec.durationMinutes,
      totalQuestions: sec.totalQuestions,
      audioUrl: sec.audioUrl,
      audioTranscript: sec.audioTranscript,
      passages: sec.passages?.map((p) => ({
        id: p.id,
        order: p.order,
        title: p.title,
        subTitle: p.subTitle,
        paragraphs: p.paragraphs,
        wordCount: p.wordCount || 800,
        questionRange: p.questionRange,
      })),
      groups,
      writingTasks: sec.writingTasks,
      speakingParts: sec.speakingParts,
    }
  })

  return {
    id: test.id,
    title: test.title,
    code: test.code,
    type: test.type,
    packageCategory: test.packageCategory,
    difficulty: test.difficulty,
    skills: sections.map((s) => s.name.toLowerCase() as any),
    description: test.description,
    sourceName: test.sourceName,
    sourceUrl: test.sourceUrl,
    rightsStatus: test.rightsStatus,
    rightsNotice: test.rightsNotice,
    isFullMock: test.isFullMock,
    status: test.readinessStatus === 'ready' ? 'published' : 'draft',
    version: 1,
    totalDurationMinutes: test.totalDurationMinutes,
    totalQuestions: test.totalQuestions,
    sections,
    assets: [],
    instructions: test.instructions,
    createdAt: '2026-10-25T12:00:00Z',
    updatedAt: '2026-10-26T18:00:00Z',
    publishedAt: test.readinessStatus === 'ready' ? '2026-10-26T18:00:00Z' : undefined,
    author: 'IELTS System Architect',
  }
}

/**
 * Converts an admin Builder QuestionSet model back into a student MockTest model
 */
export function convertToMockTest(qSet: QuestionSet): MockTest {
  const sections: MockTestSection[] = qSet.sections.map((sec) => {
    // Collect all questions from groups
    const flatQuestions: Question[] = []
    sec.groups.forEach((grp) => {
      grp.questions.forEach((q) => {
        flatQuestions.push({
          id: q.id,
          order: q.order,
          type: q.type as any,
          prompt: q.prompt,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          evidenceSnippet: q.evidenceSnippet,
          evidenceParagraph: q.evidenceParagraph,
        })
      })
    })

    // Sort by question order
    flatQuestions.sort((a, b) => a.order - b.order)

    const exercise: PracticeExercise = {
      id: `ex-${sec.id}`,
      title: `${sec.name} Section Exam`,
      skill: sec.name.toLowerCase() as any,
      level: 'Band 6.0-8.5',
      questionTypeCategory: sec.groups[0]?.title || 'IELTS Standard Tasks',
      timeLimitMinutes: sec.durationMinutes,
      totalQuestions: flatQuestions.length,
      questions: flatQuestions,
    }

    const passages: ReadingPassage[] | undefined = sec.passages?.map((p) => ({
      id: p.id,
      order: p.order,
      title: p.title,
      subTitle: p.subTitle,
      paragraphs: p.paragraphs,
      wordCount: p.wordCount,
      questionRange: p.questionRange,
    }))

    return {
      id: sec.id,
      name: sec.name,
      durationMinutes: sec.durationMinutes,
      totalQuestions: flatQuestions.length,
      exercise,
      audioUrl: sec.audioUrl,
      audioTranscript: sec.audioTranscript,
      passages,
      writingTasks: sec.writingTasks,
      speakingParts: sec.speakingParts,
    }
  })

  return {
    id: qSet.id,
    title: qSet.title,
    code: qSet.code,
    type: qSet.type,
    packageCategory: qSet.packageCategory,
    difficulty: qSet.difficulty,
    description: qSet.description,
    sourceName: qSet.sourceName || 'IELTS Platform Builder',
    sourceUrl: qSet.sourceUrl || '',
    rightsStatus: qSet.rightsStatus || 'custom_equivalent',
    rightsNotice: qSet.rightsNotice || 'Đề thi biên soạn bởi IELTS Learning Platform.',
    isFullMock: qSet.isFullMock,
    readinessStatus: qSet.status === 'published' ? 'ready' : 'in_preparation',
    requiresAudio: sections.some((s) => s.name === 'Listening'),
    requiresMic: sections.some((s) => s.name === 'Speaking'),
    totalDurationMinutes: qSet.totalDurationMinutes,
    totalQuestions: sections.reduce((acc, s) => acc + s.totalQuestions, 0),
    sections,
    instructions: qSet.instructions,
  }
}

/**
 * Question Set Service Implementation
 */
class QuestionSetService {
  private initialSets: QuestionSet[] = []

  constructor() {
    this.initDefaultSets()
  }

  private initDefaultSets() {
    // Pre-populate with Cambridge 18 and official packages
    this.initialSets = [
      convertFromMockTest(cambridgeAcademic18MockTest),
      ...officialFreeMockPackages.map(convertFromMockTest),
    ]
  }

  private getStorage(): QuestionSet[] {
    if (typeof window === 'undefined') return this.initialSets
    try {
      const data = localStorage.getItem(STORAGE_KEY_QUESTION_SETS)
      if (!data) {
        localStorage.setItem(STORAGE_KEY_QUESTION_SETS, JSON.stringify(this.initialSets))
        return this.initialSets
      }
      return JSON.parse(data)
    } catch {
      return this.initialSets
    }
  }

  private saveStorage(sets: QuestionSet[]) {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(STORAGE_KEY_QUESTION_SETS, JSON.stringify(sets))
    } catch (e) {
      console.error('Failed to save question sets to localStorage', e)
    }
  }

  async getAll(): Promise<QuestionSet[]> {
    return this.getStorage()
  }

  async getById(id: string): Promise<QuestionSet | null> {
    const list = this.getStorage()
    return list.find((s) => s.id === id) || null
  }

  async save(set: QuestionSet): Promise<QuestionSet> {
    const list = this.getStorage()
    const index = list.findIndex((s) => s.id === set.id)

    const updated: QuestionSet = {
      ...set,
      version: index >= 0 ? list[index].version + 1 : 1,
      updatedAt: new Date().toISOString(),
    }

    if (index >= 0) {
      list[index] = updated
    } else {
      list.unshift(updated)
    }

    this.saveStorage(list)
    return updated
  }

  async publish(id: string): Promise<{ success: boolean; report: any; updatedSet?: QuestionSet }> {
    const set = await this.getById(id)
    if (!set) {
      throw new Error(`Không tìm thấy bộ đề ${id}`)
    }

    const report = validateQuestionSet(set)
    if (!report.canPublish) {
      return { success: false, report }
    }

    const publishedSet: QuestionSet = {
      ...set,
      status: 'published',
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await this.save(publishedSet)
    return { success: true, report, updatedSet: publishedSet }
  }

  async duplicate(id: string): Promise<QuestionSet> {
    const source = await this.getById(id)
    if (!source) throw new Error('Không tìm thấy bộ đề nguồn')

    const newId = `test-copy-${Date.now().toString().slice(-6)}`
    const newCode = `${source.code}-COPY`

    const cloned: QuestionSet = {
      ...JSON.parse(JSON.stringify(source)),
      id: newId,
      title: `${source.title} (Bản sao)`,
      code: newCode,
      status: 'draft',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: undefined,
    }

    await this.save(cloned)
    return cloned
  }

  async delete(id: string): Promise<boolean> {
    const list = this.getStorage()
    const filtered = list.filter((s) => s.id !== id)
    this.saveStorage(filtered)
    return true
  }

  /**
   * Retrieves all published tests converted to MockTest format for the student Exam Workspace
   */
  getPublishedMockTests(): MockTest[] {
    const list = this.getStorage()
    const published = list.filter((s) => s.status === 'published')
    return published.map(convertToMockTest)
  }
}

export const questionSetService = new QuestionSetService()
