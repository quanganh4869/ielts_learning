import { VocabularyRuleItem, FlashcardRating } from '@/types/learningRules'

export interface FlashcardItem {
  id: string
  word: string
  partOfSpeech: string
  phonetic: string
  vietnameseMeaning: string
  englishDefinition: string
  usageNote?: string
  example: string
  exampleTranslation?: string
  collocations: string[]
  topic: string
  cefrLevel: string
  academicSource: string
  priorityReason?: string
  srs: {
    repetition: number
    intervalDays: number
    easeFactor: number
    status: string
    lapses: number
  }
}

export type RecallRating = 'again' | 'good' // "Chưa nhớ" (Rating 1) vs "Đã nhớ" (Rating 3)

export interface ReviewSessionSummaryData {
  totalReviewed: number
  rememberedCount: number
  forgottenCount: number
  rememberedWords: FlashcardItem[]
  forgottenWords: FlashcardItem[]
}
