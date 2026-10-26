/**
 * Scoring & Answer Key Verification Rules
 * IELTS Academic & General Training
 */

/**
 * Standardize an answer string by trimming, removing excessive whitespace,
 * and normalizing quotes and punctuation.
 */
export function normalizeAnswerString(raw: string): string {
  if (!raw) return ''
  return raw
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "'") // Normalize apostrophes
    .replace(/[“”]/g, '"') // Normalize double quotes
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .replace(/^[.\s]+|[.\s]+$/g, '') // Strip leading/trailing dots
}

/**
 * Extract all permissible variations from an IELTS answer key entry.
 * Supports:
 * - Alternates separated by slash: "ticket / tickets"
 * - Optional words in parentheses: "(a) library" -> ["library", "a library"]
 * - True/False/Not Given shorthand: "t" -> "true", "f" -> "false", "ng" -> "not given"
 */
export function expandAcceptableAnswers(key: string | string[]): string[] {
  const seeds = Array.isArray(key) ? key : [key]
  const result = new Set<string>()

  seeds.forEach((seed) => {
    const normalized = normalizeAnswerString(seed)
    result.add(normalized)

    // Handle slash alternates: "underground / metro"
    if (normalized.includes('/')) {
      const parts = normalized.split('/').map((p) => p.trim())
      parts.forEach((p) => result.add(p))
    }

    // Handle optional parenthesized words: "(a) library" or "library (card)"
    if (normalized.includes('(') && normalized.includes(')')) {
      const withoutParens = normalized.replace(/\(([^)]+)\)/g, '$1').replace(/\s+/g, ' ').trim()
      const withoutOptionalWord = normalized.replace(/\(([^)]+)\)/g, '').replace(/\s+/g, ' ').trim()
      result.add(withoutParens)
      result.add(withoutOptionalWord)
    }

    // Handle T/F/NG and Y/N/NG standard variants
    if (normalized === 'true' || normalized === 't') {
      result.add('true')
      result.add('t')
    } else if (normalized === 'false' || normalized === 'f') {
      result.add('false')
      result.add('f')
    } else if (normalized === 'not given' || normalized === 'ng' || normalized === 'notgiven') {
      result.add('not given')
      result.add('ng')
    } else if (normalized === 'yes' || normalized === 'y') {
      result.add('yes')
      result.add('y')
    } else if (normalized === 'no' || normalized === 'n') {
      result.add('no')
      result.add('n')
    }

    // Handle number words: "15" <-> "fifteen", "1" <-> "one"
    const numberMap: Record<string, string> = {
      '1': 'one',
      '2': 'two',
      '3': 'three',
      '4': 'four',
      '5': 'five',
      '6': 'six',
      '7': 'seven',
      '8': 'eight',
      '9': 'nine',
      '10': 'ten',
      '15': 'fifteen',
      '20': 'twenty',
      '30': 'thirty',
      '50': 'fifty',
      '100': 'one hundred',
    }
    if (numberMap[normalized]) {
      result.add(numberMap[normalized])
    }
    for (const [digit, word] of Object.entries(numberMap)) {
      if (normalized === word) {
        result.add(digit)
      }
    }
  })

  return Array.from(result)
}

/**
 * Verify whether a candidate's answer strictly matches acceptable answer keys
 */
export function verifyAnswerMatch(candidateAnswer: string, officialAnswerKey: string | string[]): boolean {
  if (!candidateAnswer) return false
  const cleanCandidate = normalizeAnswerString(candidateAnswer)
  if (!cleanCandidate) return false

  const acceptableVariants = expandAcceptableAnswers(officialAnswerKey)
  return acceptableVariants.includes(cleanCandidate)
}

/**
 * Official Cambridge IELTS Overall Band Rounding Rule
 * The overall score is calculated as the arithmetic average of the four skill scores.
 * - If the average ends in .25, it rounds up to the next half band (.5)
 * - If the average ends in .75, it rounds up to the next whole band (.0)
 * - If the average fraction is < .25, it rounds down to the nearest whole band (.0)
 * - If .25 <= fraction < .75, it rounds to the half band (.5)
 */
export function calculateCambridgeOverallBand(
  listening: number,
  reading: number,
  writing: number,
  speaking: number
): number {
  const mean = (listening + reading + writing + speaking) / 4
  const whole = Math.floor(mean)
  const fraction = Number((mean - whole).toFixed(4))

  if (fraction < 0.25) {
    return whole
  } else if (fraction >= 0.25 && fraction < 0.75) {
    return whole + 0.5
  } else {
    return whole + 1.0
  }
}

/**
 * Diagnostic Rubric Disclaimer Constants
 */
export const OFFICIAL_ASSESSMENT_DISCLAIMER =
  'Điểm Band số và nhận xét từ hệ thống là đánh giá chẩn đoán học tập độc lập theo khung chuẩn IELTS, không cấu thành chứng chỉ khảo thí chính thức của British Council, IDP hoặc Cambridge English.'
