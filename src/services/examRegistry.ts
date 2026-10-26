import { MockTest } from '@/types/mockTest'
import { mockTestsList as defaultMockTestsList } from './mockData'
import { questionSetService } from '@/admin/services/questionSetService'

/**
 * Returns all active & published mock tests available for students to take.
 * Merges built-in tests with any custom tests published via the Question Set Builder.
 */
export function getAvailableMockTests(): MockTest[] {
  try {
    const customTests = questionSetService.getPublishedMockTests()
    if (!customTests || customTests.length === 0) {
      return defaultMockTestsList
    }

    // Merge: custom tests override built-in tests with matching ID, or are prepended
    const mergedMap = new Map<string, MockTest>()

    // Built-in defaults
    defaultMockTestsList.forEach((t) => mergedMap.set(t.id, t))

    // Published custom tests
    customTests.forEach((t) => mergedMap.set(t.id, t))

    return Array.from(mergedMap.values())
  } catch (err) {
    console.error('Error loading available mock tests from registry', err)
    return defaultMockTestsList
  }
}

/**
 * Resolves a mock test by test ID from the unified exam registry.
 */
export function getAvailableMockTestById(testId: string): MockTest | undefined {
  const tests = getAvailableMockTests()
  return tests.find((t) => t.id === testId)
}
