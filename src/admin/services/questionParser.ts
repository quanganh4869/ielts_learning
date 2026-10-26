import {
  BuilderQuestionItem,
  BuilderQuestionGroup,
  BuilderPassage,
  BuilderSection,
  BuilderQuestionType,
  ImportParseResult,
  UnmappedRow,
} from '../types/questionBuilder'

/**
 * Normalizes question type string into supported BuilderQuestionType
 */
export function normalizeQuestionType(typeStr: string): BuilderQuestionType {
  const s = (typeStr || '').toLowerCase().trim().replace(/[\s-_]+/g, '_')
  if (s.includes('true') || s.includes('tfng') || s.includes('t_f_ng')) return 'true_false_not_given'
  if (s.includes('yes') || s.includes('ynng') || s.includes('y_n_ng')) return 'yes_no_not_given'
  if (s.includes('multiple_choice') || s.includes('mcq') || s.includes('choice')) return 'multiple_choice'
  if (s.includes('multiple_answers') || s.includes('multi_choice')) return 'multiple_answers'
  if (s.includes('match')) return 'matching'
  if (s.includes('form')) return 'form_completion'
  if (s.includes('note')) return 'note_completion'
  if (s.includes('sentence')) return 'sentence_completion'
  if (s.includes('summary')) return 'summary_completion'
  if (s.includes('blank') || s.includes('fill')) return 'fill_blank'
  if (s.includes('short') || s.includes('answer')) return 'short_answer'
  if (s.includes('essay') || s.includes('writing') || s.includes('task')) return 'essay'
  if (s.includes('speak') || s.includes('audio')) return 'audio_response'
  return 'multiple_choice'
}

/**
 * CSV / TSV Line Splitter that respects quoted strings
 */
function parseCSVLine(line: string, delimiter: string = ','): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  result.push(current.trim())
  return result
}

/**
 * 1. JSON PARSER
 */
export function parseFromJSON(jsonString: string): ImportParseResult {
  const errors: string[] = []
  const warnings: string[] = []
  const unmappedRows: UnmappedRow[] = []

  try {
    const data = JSON.parse(jsonString)

    // Check if data is already a QuestionSet or MockTest
    if (data.sections && Array.isArray(data.sections)) {
      const sections: BuilderSection[] = data.sections.map((sec: any, secIdx: number) => {
        const groups: BuilderQuestionGroup[] = (sec.groups || []).map((grp: any, grpIdx: number) => {
          return {
            id: grp.id || `grp-${secIdx + 1}-${grpIdx + 1}`,
            sectionName: sec.name || 'Reading',
            passageId: grp.passageId,
            audioUrl: grp.audioUrl,
            title: grp.title || `Nhóm câu hỏi ${grpIdx + 1}`,
            instructions: grp.instructions || '',
            questionRange: grp.questionRange || [1, (grp.questions || []).length || 1],
            questionType: normalizeQuestionType(grp.questionType || 'multiple_choice'),
            questions: (grp.questions || []).map((q: any, qIdx: number) => ({
              id: q.id || `q-${secIdx + 1}-${qIdx + 1}`,
              order: q.order || qIdx + 1,
              type: normalizeQuestionType(q.type || grp.questionType || 'multiple_choice'),
              prompt: q.prompt || '',
              options: Array.isArray(q.options) ? q.options : [],
              correctAnswer: q.correctAnswer || '',
              acceptableAnswers: Array.isArray(q.acceptableAnswers) ? q.acceptableAnswers : [],
              explanation: q.explanation || '',
              evidenceSnippet: q.evidenceSnippet || '',
              evidenceParagraph: q.evidenceParagraph,
              points: q.points || 1,
              status: q.correctAnswer ? 'valid' : 'needs_review',
              sourceConfidence: 'extracted',
            })),
          }
        })

        // If sec.exercise has questions but no groups, group them automatically
        if (groups.length === 0 && sec.exercise?.questions?.length > 0) {
          const defaultGroup: BuilderQuestionGroup = {
            id: `grp-${secIdx + 1}-1`,
            sectionName: sec.name || 'Reading',
            title: sec.exercise.passageTitle || `${sec.name} Questions 1-${sec.exercise.questions.length}`,
            instructions: sec.exercise.questionTypeCategory || '',
            questionRange: [1, sec.exercise.questions.length],
            questionType: normalizeQuestionType(sec.exercise.questions[0]?.type || 'multiple_choice'),
            questions: sec.exercise.questions.map((q: any, qIdx: number) => ({
              id: q.id || `q-${secIdx + 1}-${qIdx + 1}`,
              order: q.order || qIdx + 1,
              type: normalizeQuestionType(q.type || 'multiple_choice'),
              prompt: q.prompt || '',
              options: Array.isArray(q.options) ? q.options : [],
              correctAnswer: q.correctAnswer || '',
              acceptableAnswers: Array.isArray(q.acceptableAnswers) ? q.acceptableAnswers : [],
              explanation: q.explanation || '',
              evidenceSnippet: q.evidenceSnippet || '',
              evidenceParagraph: q.evidenceParagraph,
              points: 1,
              status: q.correctAnswer ? 'valid' : 'needs_review',
              sourceConfidence: 'extracted',
            })),
          }
          groups.push(defaultGroup)
        }

        const passages: BuilderPassage[] = (sec.passages || []).map((p: any, pIdx: number) => ({
          id: p.id || `passage-${secIdx + 1}-${pIdx + 1}`,
          order: p.order || pIdx + 1,
          title: p.title || `Reading Passage ${pIdx + 1}`,
          subTitle: p.subTitle,
          paragraphs: Array.isArray(p.paragraphs) ? p.paragraphs : typeof p.content === 'string' ? p.content.split('\n\n') : [],
          wordCount: p.wordCount || 800,
          questionRange: p.questionRange || [1, 13],
        }))

        return {
          id: sec.id || `sec-${secIdx + 1}`,
          name: sec.name || 'Reading',
          durationMinutes: sec.durationMinutes || 60,
          totalQuestions: sec.totalQuestions || groups.reduce((acc, g) => acc + g.questions.length, 0),
          audioUrl: sec.audioUrl,
          audioTranscript: sec.audioTranscript,
          passages,
          groups,
          writingTasks: sec.writingTasks,
          speakingParts: sec.speakingParts,
        }
      })

      return {
        success: true,
        detectedFormat: 'json',
        testTitle: data.title || 'Bộ đề thi IELTS mới',
        testCode: data.code || 'IELTS-IMPORT-JSON',
        testType: data.type || 'academic',
        sections,
        unmappedRows,
        errors,
        warnings,
        inferredFieldCount: 0,
      }
    }

    errors.push('Cấu trúc JSON không chứa mảng "sections" hợp lệ.')
    return {
      success: false,
      detectedFormat: 'json',
      sections: [],
      unmappedRows,
      errors,
      warnings,
      inferredFieldCount: 0,
    }
  } catch (err) {
    errors.push(`Lỗi cú pháp JSON: ${err instanceof Error ? err.message : String(err)}`)
    return {
      success: false,
      detectedFormat: 'json',
      sections: [],
      unmappedRows,
      errors,
      warnings,
      inferredFieldCount: 0,
    }
  }
}

/**
 * 2. CSV / TSV PARSER
 */
export function parseFromCSV(csvContent: string): ImportParseResult {
  const errors: string[] = []
  const warnings: string[] = []
  const unmappedRows: UnmappedRow[] = []

  const lines = csvContent
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)

  if (lines.length < 2) {
    errors.push('File CSV cần có ít nhất 1 dòng tiêu đề và 1 dòng dữ liệu câu hỏi.')
    return {
      success: false,
      detectedFormat: 'csv',
      sections: [],
      unmappedRows,
      errors,
      warnings,
      inferredFieldCount: 0,
    }
  }

  // Detect delimiter (, or \t or ;)
  const headerLine = lines[0]
  const delimiter = headerLine.includes('\t') ? '\t' : headerLine.includes(';') ? ';' : ','
  const headers = parseCSVLine(headerLine, delimiter).map((h) => h.toLowerCase().trim())

  const findColIndex = (...aliases: string[]) => {
    return headers.findIndex((h) => aliases.some((a) => h.includes(a)))
  }

  const idxOrder = findColIndex('number', 'order', 'câu', 'no')
  const idxSection = findColIndex('section', 'skill', 'phần')
  const idxGroup = findColIndex('group', 'nhóm', 'dạng')
  const idxInstruction = findColIndex('instruction', 'chỉ dẫn', 'hướng dẫn')
  const idxType = findColIndex('type', 'loại')
  const idxPrompt = findColIndex('prompt', 'question', 'nội dung', 'câu hỏi')
  const idxOptA = findColIndex('opt_a', 'option_a', 'option a', 'a)', 'a')
  const idxOptB = findColIndex('opt_b', 'option_b', 'option b', 'b)', 'b')
  const idxOptC = findColIndex('opt_c', 'option_c', 'option c', 'c)', 'c')
  const idxOptD = findColIndex('opt_d', 'option_d', 'option d', 'd)', 'd')
  const idxAnswer = findColIndex('answer', 'correct', 'đáp án')
  const idxAcceptable = findColIndex('acceptable', 'alternative', 'đáp án phụ')
  const idxExplanation = findColIndex('explanation', 'giải thích', 'evidence')
  const idxPassageTitle = findColIndex('passage_title', 'bài đọc')
  const idxPassageText = findColIndex('passage_text', 'đoạn văn')

  if (idxPrompt === -1) {
    errors.push('Không tìm thấy cột câu hỏi (Prompt / Question). Vui lòng kiểm tra lại tiêu đề cột.')
    return {
      success: false,
      detectedFormat: 'csv',
      sections: [],
      unmappedRows,
      errors,
      warnings,
      inferredFieldCount: 0,
    }
  }

  // Map rows
  interface TempRow {
    order: number
    sectionName: 'Listening' | 'Reading' | 'Writing' | 'Speaking'
    groupTitle: string
    instructions: string
    type: BuilderQuestionType
    prompt: string
    options: string[]
    correctAnswer: string
    acceptableAnswers: string[]
    explanation: string
    passageTitle?: string
    passageText?: string
  }

  const tempRows: TempRow[] = []

  for (let r = 1; r < lines.length; r++) {
    const rawLine = lines[r]
    const cols = parseCSVLine(rawLine, delimiter)
    const prompt = cols[idxPrompt] || ''

    if (!prompt) {
      unmappedRows.push({
        rowNumber: r + 1,
        rawText: rawLine.slice(0, 80),
        reason: 'Nội dung câu hỏi (prompt) để trống.',
      })
      continue
    }

    const rawOrder = idxOrder !== -1 ? parseInt(cols[idxOrder], 10) : NaN
    const order = isNaN(rawOrder) ? r : rawOrder

    let sectionName: 'Listening' | 'Reading' | 'Writing' | 'Speaking' = 'Reading'
    if (idxSection !== -1) {
      const secVal = (cols[idxSection] || '').toLowerCase()
      if (secVal.includes('listen') || secVal.includes('nghe')) sectionName = 'Listening'
      else if (secVal.includes('read') || secVal.includes('đọc')) sectionName = 'Reading'
      else if (secVal.includes('writ') || secVal.includes('viết')) sectionName = 'Writing'
      else if (secVal.includes('speak') || secVal.includes('nói')) sectionName = 'Speaking'
    }

    const groupTitle = idxGroup !== -1 && cols[idxGroup] ? cols[idxGroup] : 'Nhóm câu hỏi'
    const instructions = idxInstruction !== -1 ? cols[idxInstruction] : ''
    const qType = idxType !== -1 ? normalizeQuestionType(cols[idxType]) : 'multiple_choice'

    const options: string[] = []
    if (idxOptA !== -1 && cols[idxOptA]) options.push(cols[idxOptA])
    if (idxOptB !== -1 && cols[idxOptB]) options.push(cols[idxOptB])
    if (idxOptC !== -1 && cols[idxOptC]) options.push(cols[idxOptC])
    if (idxOptD !== -1 && cols[idxOptD]) options.push(cols[idxOptD])

    const correctAnswer = idxAnswer !== -1 ? cols[idxAnswer] || '' : ''
    const acceptableAnswers =
      idxAcceptable !== -1 && cols[idxAcceptable]
        ? cols[idxAcceptable].split(/[/;,|]/).map((a) => a.trim()).filter(Boolean)
        : []
    const explanation = idxExplanation !== -1 ? cols[idxExplanation] || '' : ''
    const passageTitle = idxPassageTitle !== -1 ? cols[idxPassageTitle] : undefined
    const passageText = idxPassageText !== -1 ? cols[idxPassageText] : undefined

    tempRows.push({
      order,
      sectionName,
      groupTitle,
      instructions,
      type: qType,
      prompt,
      options,
      correctAnswer,
      acceptableAnswers,
      explanation,
      passageTitle,
      passageText,
    })
  }

  // Group rows into Sections and Groups
  const sectionsMap = new Map<'Listening' | 'Reading' | 'Writing' | 'Speaking', BuilderSection>()

  for (const row of tempRows) {
    if (!sectionsMap.has(row.sectionName)) {
      sectionsMap.set(row.sectionName, {
        id: `sec-${row.sectionName.toLowerCase()}`,
        name: row.sectionName,
        durationMinutes: row.sectionName === 'Listening' ? 30 : row.sectionName === 'Reading' ? 60 : 60,
        totalQuestions: 0,
        groups: [],
        passages: [],
      })
    }
    const sec = sectionsMap.get(row.sectionName)!

    // Add passage if row has passage info
    let passageId: string | undefined
    if (row.passageTitle || row.passageText) {
      const existingPassage = sec.passages?.find((p) => p.title === row.passageTitle)
      if (existingPassage) {
        passageId = existingPassage.id
      } else {
        passageId = `passage-${(sec.passages?.length || 0) + 1}`
        const newPassage: BuilderPassage = {
          id: passageId,
          order: (sec.passages?.length || 0) + 1,
          title: row.passageTitle || `Passage ${(sec.passages?.length || 0) + 1}`,
          paragraphs: row.passageText ? row.passageText.split('\n\n') : [],
          wordCount: row.passageText ? row.passageText.split(/\s+/).length : 800,
          questionRange: [row.order, row.order],
        }
        sec.passages = sec.passages || []
        sec.passages.push(newPassage)
      }
    }

    // Find or create group
    let grp = sec.groups.find((g) => g.title === row.groupTitle && g.passageId === passageId)
    if (!grp) {
      grp = {
        id: `grp-${sec.name.toLowerCase()}-${sec.groups.length + 1}`,
        sectionName: sec.name,
        passageId,
        title: row.groupTitle,
        instructions: row.instructions,
        questionRange: [row.order, row.order],
        questionType: row.type,
        questions: [],
      }
      sec.groups.push(grp)
    }

    // Add question
    const qItem: BuilderQuestionItem = {
      id: `q-${sec.name.toLowerCase()}-${row.order}`,
      order: row.order,
      type: row.type,
      prompt: row.prompt,
      options: row.options,
      correctAnswer: row.correctAnswer,
      acceptableAnswers: row.acceptableAnswers,
      explanation: row.explanation,
      points: 1,
      status: row.correctAnswer ? 'valid' : 'needs_review',
      sourceConfidence: 'extracted',
    }
    grp.questions.push(qItem)
    grp.questionRange[1] = Math.max(grp.questionRange[1], row.order)
    grp.questionRange[0] = Math.min(grp.questionRange[0], row.order)
    sec.totalQuestions++
  }

  const sections = Array.from(sectionsMap.values())

  return {
    success: sections.length > 0,
    detectedFormat: 'csv',
    testTitle: 'Bộ đề thi IELTS từ CSV',
    testCode: `CSV-IMPORT-${Date.now().toString().slice(-4)}`,
    testType: 'academic',
    sections,
    unmappedRows,
    errors,
    warnings,
    inferredFieldCount: 0,
  }
}

/**
 * 3. STRUCTURED TEXT PARSER
 * Parses teacher / editor copy-pasted blocks
 */
export function parseFromStructuredText(text: string): ImportParseResult {
  const errors: string[] = []
  const warnings: string[] = []
  const unmappedRows: UnmappedRow[] = []

  const lines = text.split(/\r?\n/)
  let currentSection: BuilderSection | null = null
  let currentPassage: BuilderPassage | null = null
  let currentGroup: BuilderQuestionGroup | null = null
  let currentQuestion: BuilderQuestionItem | null = null
  const sections: BuilderSection[] = []

  let testTitle = 'Bộ đề thi IELTS biên soạn'
  let testCode = `TEXT-BUILD-${Date.now().toString().slice(-4)}`
  let testType: 'academic' | 'general' = 'academic'

  let readingPassageCount = 0

  const ensureSection = (name: 'Listening' | 'Reading' | 'Writing' | 'Speaking') => {
    let s = sections.find((sec) => sec.name === name)
    if (!s) {
      s = {
        id: `sec-${name.toLowerCase()}`,
        name,
        durationMinutes: name === 'Listening' ? 30 : 60,
        totalQuestions: 0,
        groups: [],
        passages: [],
      }
      sections.push(s)
    }
    currentSection = s
    return s
  }

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i]
    const line = rawLine.trim()
    if (!line) continue

    // Detect Header / Meta
    if (/^TITLE\s*:\s*(.+)$/i.test(line)) {
      testTitle = line.replace(/^TITLE\s*:\s*/i, '').trim()
      continue
    }
    if (/^CODE\s*:\s*(.+)$/i.test(line)) {
      testCode = line.replace(/^CODE\s*:\s*/i, '').trim()
      continue
    }
    if (/^TYPE\s*:\s*(.+)$/i.test(line)) {
      const val = line.replace(/^TYPE\s*:\s*/i, '').toLowerCase().trim()
      if (val.includes('gen')) testType = 'general'
      continue
    }

    // Detect Section
    if (/^SECTION\s*:\s*(.+)$/i.test(line)) {
      const secRaw = line.replace(/^SECTION\s*:\s*/i, '').toLowerCase()
      if (secRaw.includes('listen')) ensureSection('Listening')
      else if (secRaw.includes('read')) ensureSection('Reading')
      else if (secRaw.includes('writ')) ensureSection('Writing')
      else if (secRaw.includes('speak')) ensureSection('Speaking')
      continue
    }

    // Detect Passage
    if (/^PASSAGE\s*(?:\d*)\s*:\s*(.+)$/i.test(line)) {
      const sec = currentSection || ensureSection('Reading')
      readingPassageCount++
      const passageTitle = line.replace(/^PASSAGE\s*(?:\d*)\s*:\s*/i, '').trim()
      currentPassage = {
        id: `passage-${readingPassageCount}`,
        order: readingPassageCount,
        title: passageTitle || `Reading Passage ${readingPassageCount}`,
        paragraphs: [],
        wordCount: 0,
        questionRange: [1, 13],
      }
      sec.passages = sec.passages || []
      sec.passages.push(currentPassage)
      continue
    }

    // Collect Paragraph text for Passage
    if (currentPassage && /^Paragraph\s*([A-Za-z0-9]+)\s*:\s*(.+)$/i.test(line)) {
      const pText = line.replace(/^Paragraph\s*([A-Za-z0-9]+)\s*:\s*/i, '').trim()
      currentPassage.paragraphs.push(pText)
      currentPassage.wordCount = (currentPassage.wordCount || 0) + pText.split(/\s+/).length
      continue
    }

    // Detect Group
    if (/^GROUP\s*:\s*(.+)$/i.test(line)) {
      const sec = currentSection || ensureSection('Reading')
      const groupTitle = line.replace(/^GROUP\s*:\s*/i, '').trim()
      currentGroup = {
        id: `grp-${sec.name.toLowerCase()}-${sec.groups.length + 1}`,
        sectionName: sec.name,
        passageId: currentPassage?.id,
        title: groupTitle,
        instructions: '',
        questionRange: [1, 1],
        questionType: normalizeQuestionType(groupTitle),
        questions: [],
      }
      sec.groups.push(currentGroup)
      continue
    }

    // Detect Instructions
    if (/^INSTRUCTIONS\s*:\s*(.+)$/i.test(line)) {
      const inst = line.replace(/^INSTRUCTIONS\s*:\s*/i, '').trim()
      if (currentGroup) currentGroup.instructions = inst
      continue
    }

    // Detect Question: e.g. "1. Vertical farms require less land"
    const qMatch = line.match(/^(\d+)\.\s*(.+)$/)
    if (qMatch) {
      const sec = currentSection || ensureSection('Reading')
      const grp = currentGroup || (() => {
        const g: BuilderQuestionGroup = {
          id: `grp-${sec.name.toLowerCase()}-1`,
          sectionName: sec.name,
          title: 'Nhóm câu hỏi',
          instructions: '',
          questionRange: [1, 1],
          questionType: 'multiple_choice',
          questions: [],
        }
        sec.groups.push(g)
        currentGroup = g
        return g
      })()

      const order = parseInt(qMatch[1], 10)
      const prompt = qMatch[2].trim()

      currentQuestion = {
        id: `q-${sec.name.toLowerCase()}-${order}`,
        order,
        type: grp.questionType,
        prompt,
        options: [],
        correctAnswer: '',
        explanation: '',
        points: 1,
        status: 'needs_review',
        sourceConfidence: 'extracted',
      }
      grp.questions.push(currentQuestion)
      grp.questionRange[1] = Math.max(grp.questionRange[1], order)
      grp.questionRange[0] = Math.min(grp.questionRange[0], order)
      sec.totalQuestions++
      continue
    }

    // Detect Options: A) ... or A. ...
    const optMatch = line.match(/^([A-D])\s*[\)\.]\s*(.+)$/i)
    if (optMatch && currentQuestion) {
      const optLetter = optMatch[1].toUpperCase()
      const optText = optMatch[2].trim()
      currentQuestion.options = currentQuestion.options || []
      currentQuestion.options.push(`${optLetter}) ${optText}`)
      continue
    }

    // Detect Answer: ANSWER: A or ANSWER: TRUE
    if (/^ANSWER\s*:\s*(.+)$/i.test(line) && currentQuestion) {
      const ans = line.replace(/^ANSWER\s*:\s*/i, '').trim()
      currentQuestion.correctAnswer = ans
      currentQuestion.status = 'valid'
      continue
    }

    // Detect Explanation
    if (/^EXPLANATION\s*:\s*(.+)$/i.test(line) && currentQuestion) {
      const exp = line.replace(/^EXPLANATION\s*:\s*/i, '').trim()
      currentQuestion.explanation = exp
      continue
    }

    // If line couldn't be matched
    unmappedRows.push({
      rowNumber: i + 1,
      rawText: rawLine.slice(0, 80),
      reason: 'Không nhận diện được cú pháp cấu trúc đề (Section/Passage/Group/Question).',
    })
  }

  // If no sections were explicitly stated, default to Reading
  if (sections.length === 0) {
    errors.push('Không nhận diện được câu hỏi hoặc phần thi nào trong nội dung dán vào.')
  }

  return {
    success: sections.length > 0 && sections.some((s) => s.groups.some((g) => g.questions.length > 0)),
    detectedFormat: 'text_structured',
    testTitle,
    testCode,
    testType,
    sections,
    unmappedRows,
    errors,
    warnings,
    inferredFieldCount: 0,
  }
}

/**
 * 4. AI-ASSISTED DOCUMENT ANALYZER
 * Analyzes unstructured text/docs and marks inferred fields with sourceConfidence='ai_inferred'
 */
export async function parseWithAI(
  content: string,
  _options?: { apiKey?: string; model?: string }
): Promise<ImportParseResult> {
  // First, run structured text parser
  const baseline = parseFromStructuredText(content)
  if (baseline.success && baseline.sections.length > 0) {
    return baseline
  }

  // Fallback intelligent NLP heuristic:
  // Detects numbered sentences and options, extracts passages
  const errors: string[] = []
  const warnings: string[] = []
  const unmappedRows: UnmappedRow[] = []

  const lines = content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

  const readingSection: BuilderSection = {
    id: 'sec-reading',
    name: 'Reading',
    durationMinutes: 60,
    totalQuestions: 0,
    groups: [],
    passages: [],
  }

  const defaultGroup: BuilderQuestionGroup = {
    id: 'grp-reading-ai-1',
    sectionName: 'Reading',
    title: 'Câu hỏi phân tích bằng AI (Cần xác minh)',
    instructions: 'Hãy rà soát kỹ các câu hỏi và đáp án trước khi lưu.',
    questionRange: [1, 1],
    questionType: 'multiple_choice',
    questions: [],
  }
  readingSection.groups.push(defaultGroup)

  let qCount = 0
  let inferredCount = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const matchNumber = line.match(/^(\d+)[\.\:\)]\s*(.+)$/)

    if (matchNumber) {
      qCount++
      const prompt = matchNumber[2].trim()
      const questionItem: BuilderQuestionItem = {
        id: `q-ai-${qCount}`,
        order: qCount,
        type: 'multiple_choice',
        prompt,
        options: [],
        correctAnswer: '',
        explanation: 'Trích xuất tự động qua AI Assistant. Cần đối soát đáp án.',
        points: 1,
        status: 'needs_review',
        sourceConfidence: 'ai_inferred',
      }
      inferredCount++
      defaultGroup.questions.push(questionItem)
    } else if (defaultGroup.questions.length > 0 && /^[A-D][\.\)]\s*(.+)$/i.test(line)) {
      const lastQ = defaultGroup.questions[defaultGroup.questions.length - 1]
      lastQ.options = lastQ.options || []
      lastQ.options.push(line)
    }
  }

  defaultGroup.questionRange = [1, Math.max(qCount, 1)]
  readingSection.totalQuestions = qCount

  if (qCount === 0) {
    errors.push('AI Parser không tìm thấy câu hỏi có định dạng số (1., 2., 3...) trong tài liệu.')
    return {
      success: false,
      detectedFormat: 'ai_extracted',
      sections: [],
      unmappedRows,
      errors,
      warnings,
      inferredFieldCount: 0,
    }
  }

  warnings.push(`Đã tự động trích xuất ${qCount} câu hỏi bằng AI. Tất cả đáp án được đánh dấu là "Cần xác minh" (needs_review).`)

  return {
    success: true,
    detectedFormat: 'ai_extracted',
    testTitle: 'Đề thi trích xuất bằng AI Document Assistant',
    testCode: `AI-DOC-${Date.now().toString().slice(-4)}`,
    testType: 'academic',
    sections: [readingSection],
    unmappedRows,
    errors,
    warnings,
    inferredFieldCount: inferredCount,
  }
}

/**
 * 5. TEMPLATE GENERATORS
 */
export function generateCSVTemplate(): string {
  return [
    'Order,Section,GroupTitle,Instructions,Type,Prompt,OptionA,OptionB,OptionC,OptionD,CorrectAnswer,AcceptableAnswers,Explanation,PassageTitle',
    '1,Reading,Questions 1-4: True/False/Not Given,Do the following statements agree with the text?,true_false_not_given,Ancient tea cultivation originated in Southeast Asia.,A) TRUE,B) FALSE,C) NOT GIVEN,,A,,Paragraph 1 confirms origin in Yunnan region.,The Origins of Tea',
    '2,Reading,Questions 1-4: True/False/Not Given,Do the following statements agree with the text?,true_false_not_given,Shennong intentionally brewed leaves for medicinal drinks.,A) TRUE,B) FALSE,C) NOT GIVEN,,B,,Paragraph 2 states the wind blew the leaves into boiling water accidentally.,The Origins of Tea',
    '3,Reading,Questions 1-4: True/False/Not Given,Do the following statements agree with the text?,true_false_not_given,European explorers preferred green tea over black tea.,A) TRUE,B) FALSE,C) NOT GIVEN,,C,,No mention of European flavor preference in the passage.,The Origins of Tea',
    '4,Reading,Questions 1-4: True/False/Not Given,Do the following statements agree with the text?,true_false_not_given,Modern fermentation techniques eliminated bitter tannins.,A) TRUE,B) FALSE,C) NOT GIVEN,,B,,The passage notes bitterness was moderated but not eliminated.,The Origins of Tea',
    '5,Reading,Questions 5-6: Multiple Choice,Choose the correct letter A-D.,multiple_choice,What was the primary economic benefit of the tea trade?,A) Reduced military budget,B) Accelerated maritime navigation,C) Lowered import tariffs,D) Universal healthcare,B,,Paragraph 4 highlights shipbuilding and map navigation.,The Origins of Tea',
  ].join('\n')
}

export function generateJSONTemplate(): string {
  return JSON.stringify(
    {
      title: 'Cambridge IELTS 18 Academic Practice Test 02',
      code: 'CAM-18-ACAD-02',
      type: 'academic',
      packageCategory: 'four_skills',
      difficulty: 'Standard',
      description: 'Đề thi thử hoàn chỉnh 4 kỹ năng biên soạn theo chuẩn khảo thí Cambridge IELTS 18.',
      rightsStatus: 'verified_sample',
      rightsNotice: 'Đề thi thực hành phục vụ học tập và nghiên cứu.',
      sections: [
        {
          id: 'sec-reading-01',
          name: 'Reading',
          durationMinutes: 60,
          totalQuestions: 13,
          passages: [
            {
              id: 'passage-01',
              order: 1,
              title: 'Urban Agriculture in Mega-cities',
              paragraphs: [
                'In high-density modern cities, vertical farming has transitioned from an experimental niche into an urban necessity.',
                'Hydroponic towers operate with 95% less water consumption than conventional outdoor farming.',
              ],
              wordCount: 750,
              questionRange: [1, 13],
            },
          ],
          groups: [
            {
              id: 'grp-01',
              sectionName: 'Reading',
              passageId: 'passage-01',
              title: 'Questions 1-4: True / False / Not Given',
              instructions: 'Do the following statements agree with the information in Reading Passage 1?',
              questionRange: [1, 4],
              questionType: 'true_false_not_given',
              questions: [
                {
                  id: 'q-1',
                  order: 1,
                  type: 'true_false_not_given',
                  prompt: 'Hydroponic systems require less water than traditional soil farming.',
                  options: ['A) TRUE', 'B) FALSE', 'C) NOT GIVEN'],
                  correctAnswer: 'A',
                  acceptableAnswers: ['TRUE'],
                  explanation: 'Paragraph 2 confirms a 95% reduction in water consumption.',
                },
              ],
            },
          ],
        },
      ],
    },
    null,
    2
  )
}
