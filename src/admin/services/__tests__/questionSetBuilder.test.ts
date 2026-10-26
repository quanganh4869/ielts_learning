import { describe, it, expect, beforeEach } from 'vitest'
import {
  parseFromJSON,
  parseFromCSV,
  parseFromStructuredText,
  generateCSVTemplate,
  generateJSONTemplate,
  normalizeQuestionType,
} from '../questionParser'
import { validateQuestionSet } from '../questionValidator'
import { convertToMockTest, convertFromMockTest, questionSetService } from '../questionSetService'
import { QuestionSet } from '../../types/questionBuilder'

describe('Question Parser Service', () => {
  it('correctly normalizes question types', () => {
    expect(normalizeQuestionType('tfng')).toBe('true_false_not_given')
    expect(normalizeQuestionType('True/False/Not Given')).toBe('true_false_not_given')
    expect(normalizeQuestionType('ynng')).toBe('yes_no_not_given')
    expect(normalizeQuestionType('mcq')).toBe('multiple_choice')
    expect(normalizeQuestionType('fill in blanks')).toBe('fill_blank')
    expect(normalizeQuestionType('matching headings')).toBe('matching')
    expect(normalizeQuestionType('note completion')).toBe('note_completion')
  })

  it('generates valid non-empty CSV and JSON templates', () => {
    const csv = generateCSVTemplate()
    expect(csv).toContain('Order,Section,GroupTitle')
    expect(csv).toContain('true_false_not_given')

    const jsonStr = generateJSONTemplate()
    const parsed = JSON.parse(jsonStr)
    expect(parsed.title).toBeDefined()
    expect(parsed.sections.length).toBeGreaterThan(0)
  })

  it('parses valid JSON into sections, groups and questions', () => {
    const template = generateJSONTemplate()
    const result = parseFromJSON(template)
    expect(result.success).toBe(true)
    expect(result.sections.length).toBe(1)
    expect(result.sections[0].name).toBe('Reading')
    expect(result.sections[0].groups.length).toBe(1)
    expect(result.sections[0].groups[0].questions.length).toBe(1)
    expect(result.sections[0].groups[0].questions[0].correctAnswer).toBe('A')
  })

  it('handles corrupted JSON gracefully without crashing', () => {
    const result = parseFromJSON('invalid json {{{')
    expect(result.success).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('parses standard CSV question files into grouped sections', () => {
    const csvContent = [
      'Order,Section,GroupTitle,Instructions,Type,Prompt,OptionA,OptionB,OptionC,OptionD,CorrectAnswer,AcceptableAnswers,Explanation,PassageTitle',
      '1,Reading,Questions 1-2: True/False,Answer according to text,true_false_not_given,Solar power is renewable.,A) TRUE,B) FALSE,C) NOT GIVEN,,A,,Confirmed in para 1,Energy Trends',
      '2,Reading,Questions 1-2: True/False,Answer according to text,true_false_not_given,Coal usage grew by 50%.,A) TRUE,B) FALSE,C) NOT GIVEN,,B,,Coal usage dropped in para 2,Energy Trends',
    ].join('\n')

    const result = parseFromCSV(csvContent)
    expect(result.success).toBe(true)
    expect(result.sections.length).toBe(1)
    expect(result.sections[0].groups[0].questions.length).toBe(2)
    expect(result.sections[0].groups[0].questions[0].order).toBe(1)
    expect(result.sections[0].groups[0].questions[0].prompt).toBe('Solar power is renewable.')
    expect(result.sections[0].groups[0].questions[1].correctAnswer).toBe('B')
  })

  it('parses structured pasted text with sections, passages, groups and answers', () => {
    const text = `
TITLE: Test Reading 01
CODE: TST-READ-01
SECTION: Reading
PASSAGE: The History of Windmills
Paragraph 1: Windmills have been used for centuries across Persia and Europe.

GROUP: Questions 1-2 (True/False/Not Given)
INSTRUCTIONS: Do the following statements agree with the text?
1. Windmills were first invented in the Americas.
A) TRUE
B) FALSE
C) NOT GIVEN
ANSWER: B
EXPLANATION: Paragraph 1 states they originated in Persia and Europe.

2. Persian windmills ground grain.
A) TRUE
B) FALSE
C) NOT GIVEN
ANSWER: A
    `

    const result = parseFromStructuredText(text)
    expect(result.success).toBe(true)
    expect(result.testTitle).toBe('Test Reading 01')
    expect(result.sections.length).toBe(1)
    expect(result.sections[0].passages?.length).toBe(1)
    expect(result.sections[0].groups[0].questions.length).toBe(2)
    expect(result.sections[0].groups[0].questions[0].correctAnswer).toBe('B')
    expect(result.sections[0].groups[0].questions[1].correctAnswer).toBe('A')
  })
})

describe('Question Validator Engine', () => {
  const createMockSet = (): QuestionSet => ({
    id: 'test-val-01',
    title: 'Valid Mock Test',
    code: 'VAL-01',
    type: 'academic',
    packageCategory: 'sample_tasks',
    difficulty: 'Standard',
    skills: ['reading'],
    description: 'Testing validation',
    sourceName: 'Platform Test',
    rightsStatus: 'verified_sample',
    rightsNotice: 'Internal testing',
    isFullMock: false,
    status: 'draft',
    version: 1,
    totalDurationMinutes: 60,
    totalQuestions: 2,
    sections: [
      {
        id: 'sec-read',
        name: 'Reading',
        durationMinutes: 60,
        totalQuestions: 2,
        passages: [
          {
            id: 'pass-1',
            order: 1,
            title: 'Sample Passage',
            paragraphs: ['Test paragraph.'],
            questionRange: [1, 2],
          },
        ],
        groups: [
          {
            id: 'grp-1',
            sectionName: 'Reading',
            passageId: 'pass-1',
            title: 'Questions 1-2',
            instructions: 'Answer questions',
            questionRange: [1, 2],
            questionType: 'multiple_choice',
            questions: [
              {
                id: 'q-1',
                order: 1,
                type: 'multiple_choice',
                prompt: 'What is the topic?',
                options: ['A) Energy', 'B) Water'],
                correctAnswer: 'A',
                points: 1,
              },
              {
                id: 'q-2',
                order: 2,
                type: 'multiple_choice',
                prompt: 'What is the result?',
                options: ['A) Success', 'B) Failure'],
                correctAnswer: 'A',
                points: 1,
              },
            ],
          },
        ],
      },
    ],
    assets: [],
    author: 'Admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })

  it('validates a correct QuestionSet successfully', () => {
    const testSet = createMockSet()
    const report = validateQuestionSet(testSet)
    expect(report.isValid).toBe(true)
    expect(report.canPublish).toBe(true)
    expect(report.errors.length).toBe(0)
    expect(report.stats.answeredQuestions).toBe(2)
    expect(report.stats.missingAnswers).toBe(0)
  })

  it('flags missing prompt as an error', () => {
    const testSet = createMockSet()
    testSet.sections[0].groups[0].questions[0].prompt = ''

    const report = validateQuestionSet(testSet)
    expect(report.isValid).toBe(false)
    expect(report.errors.some((e) => e.code === 'QUESTION_PROMPT_EMPTY')).toBe(true)
  })

  it('flags duplicate question orders as an error', () => {
    const testSet = createMockSet()
    testSet.sections[0].groups[0].questions[1].order = 1 // Duplicate order #1

    const report = validateQuestionSet(testSet)
    expect(report.isValid).toBe(false)
    expect(report.errors.some((e) => e.code === 'QUESTION_DUPLICATE_ORDER')).toBe(true)
  })

  it('flags missing answer key as a warning preventing publish', () => {
    const testSet = createMockSet()
    testSet.sections[0].groups[0].questions[0].correctAnswer = ''

    const report = validateQuestionSet(testSet)
    expect(report.canPublish).toBe(false)
    expect(report.warnings.some((w) => w.code === 'QUESTION_NO_ANSWER_KEY')).toBe(true)
    expect(report.stats.missingAnswers).toBe(1)
  })

  it('verifies Full Mock Test compliance when isFullMock is set to true', () => {
    const testSet = createMockSet()
    testSet.isFullMock = true // Marked as full mock, but only has 2 reading questions

    const report = validateQuestionSet(testSet)
    expect(report.canPublish).toBe(false)
    expect(report.errors.some((e) => e.code === 'TEST_NOT_FULL_MOCK_COMPLIANT')).toBe(true)
  })
})

describe('Question Set Service & Exam Workspace Conversion', () => {
  it('converts QuestionSet to MockTest and preserves question integrity', () => {
    const testSet: QuestionSet = {
      id: 'bridge-test-01',
      title: 'Bridge Exam Test',
      code: 'BRG-01',
      type: 'academic',
      packageCategory: 'sample_tasks',
      difficulty: 'Standard',
      skills: ['reading'],
      description: 'Testing bridge conversion',
      sourceName: 'Platform Test',
      rightsStatus: 'custom_equivalent',
      rightsNotice: 'Testing',
      isFullMock: false,
      status: 'published',
      version: 1,
      totalDurationMinutes: 60,
      totalQuestions: 1,
      sections: [
        {
          id: 'sec-r1',
          name: 'Reading',
          durationMinutes: 60,
          totalQuestions: 1,
          groups: [
            {
              id: 'grp-r1',
              sectionName: 'Reading',
              title: 'Group 1',
              instructions: 'Choose A or B',
              questionRange: [1, 1],
              questionType: 'multiple_choice',
              questions: [
                {
                  id: 'q-brg-1',
                  order: 1,
                  type: 'multiple_choice',
                  prompt: 'Sample Question',
                  options: ['A) Yes', 'B) No'],
                  correctAnswer: 'A',
                  explanation: 'Because it is yes',
                  points: 1,
                },
              ],
            },
          ],
        },
      ],
      assets: [],
      author: 'Admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const mockTest = convertToMockTest(testSet)
    expect(mockTest.id).toBe(testSet.id)
    expect(mockTest.sections.length).toBe(1)
    expect(mockTest.sections[0].exercise.questions?.length).toBe(1)
    expect(mockTest.sections[0].exercise.questions?.[0].order).toBe(1)
    expect(mockTest.sections[0].exercise.questions?.[0].correctAnswer).toBe('A')

    // Convert back from MockTest to QuestionSet
    const roundTrip = convertFromMockTest(mockTest)
    expect(roundTrip.id).toBe(testSet.id)
    expect(roundTrip.sections[0].groups[0].questions[0].prompt).toBe('Sample Question')
  })
})
