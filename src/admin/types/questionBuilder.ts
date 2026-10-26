import { QuestionType as PracticeQuestionType } from '@/types/practice'
import { ContentRightsStatus, MockPackageCategory, ReadingPassage, WritingTaskItem, SpeakingPartItem, MockTestType } from '@/types/mockTest'

export type BuilderQuestionType =
  | 'multiple_choice'
  | 'multiple_answers'
  | 'matching'
  | 'fill_blank'
  | 'form_completion'
  | 'note_completion'
  | 'sentence_completion'
  | 'summary_completion'
  | 'true_false_not_given'
  | 'yes_no_not_given'
  | 'short_answer'
  | 'essay'
  | 'audio_response'

export type BuilderTestStatus = 'draft' | 'in_review' | 'ready' | 'published' | 'archived'

export type SourceConfidence = 'extracted' | 'ai_inferred' | 'manual'

export interface BuilderQuestionItem {
  id: string
  order: number // 1..40
  type: BuilderQuestionType
  prompt: string
  options?: string[]
  correctAnswer: string | string[]
  acceptableAnswers?: string[] // Multiple valid forms (e.g. ['centre', 'center'])
  explanation?: string
  evidenceSnippet?: string
  evidenceParagraph?: number
  points?: number
  status?: 'valid' | 'needs_review' | 'invalid'
  validationError?: string
  sourceConfidence?: SourceConfidence
}

export interface BuilderQuestionGroup {
  id: string
  sectionName: 'Listening' | 'Reading' | 'Writing' | 'Speaking'
  passageId?: string
  audioUrl?: string
  title: string // e.g. "Questions 1-6: True / False / Not Given"
  instructions: string // e.g. "Do the following statements agree with the information in Reading Passage 1?"
  questionRange: [number, number]
  questionType: BuilderQuestionType
  questions: BuilderQuestionItem[]
}

export interface BuilderPassage {
  id: string
  order: number // 1, 2, 3
  title: string
  subTitle?: string
  paragraphs: string[]
  wordCount?: number
  questionRange: [number, number]
}

export interface BuilderSection {
  id: string
  name: 'Listening' | 'Reading' | 'Writing' | 'Speaking'
  durationMinutes: number
  totalQuestions: number
  audioUrl?: string
  audioTranscript?: string
  passages?: BuilderPassage[]
  groups: BuilderQuestionGroup[]
  writingTasks?: WritingTaskItem[]
  speakingParts?: SpeakingPartItem[]
}

export interface BuilderAsset {
  id: string
  name: string
  type: 'audio' | 'image' | 'chart' | 'document'
  url: string
  sizeBytes: number
  mimeType: string
  assignedSection?: 'Listening' | 'Reading' | 'Writing' | 'Speaking'
  assignedGroupOrPassageId?: string
  status: 'ready' | 'processing' | 'error'
  uploadedAt: string
}

export interface QuestionSet {
  id: string
  title: string
  code: string // e.g. "CAM-18-ACAD-TEST-02"
  type: MockTestType
  packageCategory: MockPackageCategory
  difficulty: 'Standard' | 'Challenging'
  skills: ('listening' | 'reading' | 'writing' | 'speaking')[]
  description: string
  sourceName: string
  sourceUrl?: string
  rightsStatus: ContentRightsStatus
  rightsNotice: string
  isFullMock: boolean
  status: BuilderTestStatus
  version: number
  snapshotAttemptCount?: number // Number of attempts referencing this or prior snapshots
  totalDurationMinutes: number
  totalQuestions: number
  sections: BuilderSection[]
  assets: BuilderAsset[]
  instructions?: string[]
  createdAt: string
  updatedAt: string
  publishedAt?: string
  author: string
  tags?: string[]
}

// ----------------------------------------------------------------------------
// Validation Engine Types
// ----------------------------------------------------------------------------
export interface ValidationErrorItem {
  code: string
  message: string
  severity: 'error' | 'warning' | 'info'
  targetType: 'test' | 'section' | 'group' | 'question'
  targetId: string
  sectionName?: string
  questionOrder?: number
  fixHint: string
}

export interface ValidationReport {
  isValid: boolean
  canPublish: boolean
  errors: ValidationErrorItem[]
  warnings: ValidationErrorItem[]
  infos: ValidationErrorItem[]
  stats: {
    totalSections: number
    totalGroups: number
    totalQuestions: number
    answeredQuestions: number
    missingAnswers: number
    hasAudio: boolean
    hasPassages: boolean
    isFullMockCompliant: boolean
  }
}

// ----------------------------------------------------------------------------
// Bulk Import Parser Types
// ----------------------------------------------------------------------------
export interface UnmappedRow {
  rowNumber: number
  rawText: string
  reason: string
}

export interface ImportParseResult {
  success: boolean
  detectedFormat: 'json' | 'csv' | 'xlsx' | 'text_structured' | 'ai_extracted'
  testTitle?: string
  testCode?: string
  testType?: MockTestType
  sections: BuilderSection[]
  assets?: BuilderAsset[]
  unmappedRows: UnmappedRow[]
  errors: string[]
  warnings: string[]
  inferredFieldCount: number
}

export type ImportMethod = 'file_upload' | 'text_paste' | 'ai_assistant' | 'manual_builder'
