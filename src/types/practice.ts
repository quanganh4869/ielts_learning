import { SkillType } from './onboarding'

export type QuestionType =
  | 'multiple_choice'
  | 'matching'
  | 'fill_blank'
  | 'true_false_not_given'
  | 'yes_no_not_given'
  | 'form_completion'
  | 'sentence_completion'
  | 'essay'
  | 'audio_response'

export interface Question {
  id: string
  order: number
  type: QuestionType
  prompt: string
  options?: string[]
  correctAnswer: string | string[]
  explanation?: string
  evidenceSnippet?: string
  evidenceParagraph?: number
}

export interface PracticeExercise {
  id: string
  title: string
  skill: SkillType
  level: 'Band 5.0-6.0' | 'Band 6.0-7.0' | 'Band 7.0-8.0' | 'Band 8.0+' | 'Band 6.0-9.0' | 'Band 6.0-8.0' | string
  topic?: string
  questionTypeCategory: string
  timeLimitMinutes?: number
  audioUrl?: string
  audioDurationSeconds?: number
  passageTitle?: string
  passageContent?: string[] // array of paragraphs
  writingPrompt?: {
    taskType: 'task_1' | 'task_2'
    chartType?: 'bar_chart' | 'line_graph' | 'pie_chart' | 'process' | 'table' | 'map'
    chartDescription?: string
    instructions?: string
    promptText?: string
    minWords: number
    recommendedMinutes?: number
  }
  speakingPrompt?: {
    part: 1 | 2 | 3
    topic: string
    questions: string[]
    cueCard?: {
      task: string
      cues: string[]
      preparationTimeSeconds: number
      speakingTimeSeconds: number
    }
  }
  speakingParts?: Array<{
    part?: number
    partNumber?: number
    title?: string
    topic?: string
    questions?: string[]
    cueCard?: {
      task?: string
      prompt?: string
      cues?: string[]
      bulletPoints?: string[]
      preparationSeconds?: number
      speakingSeconds?: number
    }
  }>
  questions?: Question[]
  totalQuestions?: number
  isCompleted?: boolean
  bestScore?: number
}

export interface WritingEvaluation {
  overallBand: number
  taskAchievement: { score: number; feedback: string }
  coherenceCohesion: { score: number; feedback: string }
  lexicalResource: { score: number; feedback: string }
  grammaticalRange: { score: number; feedback: string }
  generalFeedback: string
  revisions: Array<{
    originalText: string
    suggestedText: string
    reason: string
  }>
  improvedSample?: string
}

export interface SpeakingEvaluation {
  overallBand: number
  fluencyCoherence: { score: number; feedback: string }
  lexicalResource: { score: number; feedback: string }
  grammaticalRange: { score: number; feedback: string }
  pronunciation: { score: number; feedback: string }
  transcript: string
  strengths: string[]
  areasForImprovement: string[]
}

export interface VocabularyItem {
  id: string
  word: string
  phonetic: string
  partOfSpeech: string
  vietnameseMeaning: string
  englishDefinition: string
  collocations: string[]
  examples: string[]
  topic: string
  masteryLevel: 'new' | 'learning' | 'mastered' // 1, 2, 3
  nextReviewDate?: string
}

export interface GrammarTopic {
  id: string
  title: string
  level: 'Basic' | 'Intermediate' | 'Advanced'
  description: string
  rules: Array<{
    ruleTitle: string
    explanation: string
    formula?: string
    examples: Array<{ correct: string; incorrect?: string; note?: string }>
  }>
  commonMistakes: string[]
  practiceQuestions: Question[]
  isCompleted?: boolean
}
