import { QuestionSet, ValidationReport, ValidationErrorItem } from '../types/questionBuilder'

/**
 * Validates a QuestionSet against IELTS test standards and data integrity rules.
 */
export function validateQuestionSet(test: QuestionSet): ValidationReport {
  const errors: ValidationErrorItem[] = []
  const warnings: ValidationErrorItem[] = []
  const infos: ValidationErrorItem[] = []

  let totalQuestionsCount = 0
  let answeredQuestionsCount = 0
  let missingAnswersCount = 0

  // 1. TEST LEVEL VALIDATIONS
  if (!test.title || test.title.trim().length < 3) {
    errors.push({
      code: 'TEST_TITLE_EMPTY',
      message: 'Tên bộ đề không được để trống và phải có ít nhất 3 ký tự.',
      severity: 'error',
      targetType: 'test',
      targetId: test.id,
      fixHint: 'Vào phần thông tin chung và nhập tên đề rõ ràng (ví dụ: Cambridge IELTS 18 Academic Test 1).',
    })
  }

  if (!test.code || test.code.trim().length < 2) {
    errors.push({
      code: 'TEST_CODE_EMPTY',
      message: 'Mã định danh bộ đề (Code) không được để trống.',
      severity: 'error',
      targetType: 'test',
      targetId: test.id,
      fixHint: 'Nhập mã đề ngắn gọn, duy nhất (ví dụ: CAM-18-01).',
    })
  }

  if (!test.sections || test.sections.length === 0) {
    errors.push({
      code: 'TEST_NO_SECTIONS',
      message: 'Bộ đề chưa có bất kỳ phần thi (Section) nào.',
      severity: 'error',
      targetType: 'test',
      targetId: test.id,
      fixHint: 'Nhấn nút "Thêm phần thi" hoặc nhập dữ liệu từ file để bắt đầu.',
    })
  }

  let hasAudio = false
  let hasPassages = false

  // 2. SECTION & GROUP & QUESTION VALIDATIONS
  for (const sec of test.sections || []) {
    if (sec.name === 'Listening') {
      if (sec.audioUrl || sec.audioTranscript) {
        hasAudio = true
      } else {
        warnings.push({
          code: 'SECTION_LISTENING_NO_AUDIO',
          message: 'Phần Listening chưa có đường dẫn Audio hoặc Transcript kèm theo.',
          severity: 'warning',
          targetType: 'section',
          targetId: sec.id,
          sectionName: sec.name,
          fixHint: 'Tải lên file âm thanh MP3 trong tab Quản lý tài nguyên hoặc nhập transcript.',
        })
      }
    }

    if (sec.name === 'Reading') {
      if (sec.passages && sec.passages.length > 0) {
        hasPassages = true
      } else {
        warnings.push({
          code: 'SECTION_READING_NO_PASSAGES',
          message: 'Phần Reading chưa có bài đọc (Passage) nào.',
          severity: 'warning',
          targetType: 'section',
          targetId: sec.id,
          sectionName: sec.name,
          fixHint: 'Tạo hoặc tải lên ít nhất một đoạn văn bản Reading Passage trong tab Quản lý tài nguyên.',
        })
      }
    }

    // Question Orders tracker for section
    const seenOrders = new Set<number>()
    let sectionQCount = 0

    // Groups check
    for (const grp of sec.groups || []) {
      if (!grp.title || grp.title.trim().length === 0) {
        warnings.push({
          code: 'GROUP_TITLE_EMPTY',
          message: `Nhóm câu hỏi trong phần ${sec.name} thiếu tiêu đề.`,
          severity: 'warning',
          targetType: 'group',
          targetId: grp.id,
          sectionName: sec.name,
          fixHint: 'Đặt tiêu đề mô tả nhóm (ví dụ: Questions 1-5: True/False/Not Given).',
        })
      }

      if (grp.passageId && sec.passages) {
        const passageExists = sec.passages.some((p) => p.id === grp.passageId)
        if (!passageExists) {
          errors.push({
            code: 'GROUP_INVALID_PASSAGE_REF',
            message: `Nhóm "${grp.title}" tham chiếu đến bài đọc không tồn tại (${grp.passageId}).`,
            severity: 'error',
            targetType: 'group',
            targetId: grp.id,
            sectionName: sec.name,
            fixHint: 'Gán lại bài đọc hợp lệ trong phần biên tập nhóm.',
          })
        }
      }

      // Questions check
      for (const q of grp.questions || []) {
        totalQuestionsCount++
        sectionQCount++

        // Check duplicate order
        if (seenOrders.has(q.order)) {
          errors.push({
            code: 'QUESTION_DUPLICATE_ORDER',
            message: `Số thứ tự câu hỏi #${q.order} bị trùng lặp trong phần ${sec.name}.`,
            severity: 'error',
            targetType: 'question',
            targetId: q.id,
            sectionName: sec.name,
            questionOrder: q.order,
            fixHint: 'Điều chỉnh lại số thứ tự câu hỏi để đảm bảo tính duy nhất và liên tục.',
          })
        }
        seenOrders.add(q.order)

        // Check empty prompt
        if (!q.prompt || q.prompt.trim().length === 0) {
          errors.push({
            code: 'QUESTION_PROMPT_EMPTY',
            message: `Câu #${q.order} trong ${sec.name} chưa có nội dung câu hỏi.`,
            severity: 'error',
            targetType: 'question',
            targetId: q.id,
            sectionName: sec.name,
            questionOrder: q.order,
            fixHint: 'Nhập nội dung đề bài câu hỏi.',
          })
        }

        // Answer Key check
        const hasAnswer =
          (typeof q.correctAnswer === 'string' && q.correctAnswer.trim().length > 0) ||
          (Array.isArray(q.correctAnswer) && q.correctAnswer.length > 0)

        if (hasAnswer) {
          answeredQuestionsCount++
        } else {
          missingAnswersCount++
          warnings.push({
            code: 'QUESTION_NO_ANSWER_KEY',
            message: `Câu #${q.order} (${sec.name}) chưa có đáp án đúng (Answer Key).`,
            severity: 'warning',
            targetType: 'question',
            targetId: q.id,
            sectionName: sec.name,
            questionOrder: q.order,
            fixHint: 'Vào Ma trận Đáp án hoặc sửa câu hỏi để nhập đáp án chuẩn.',
          })
        }

        // Specific Type Checks
        if (q.type === 'multiple_choice' || q.type === 'multiple_answers') {
          if (!q.options || q.options.length < 2) {
            errors.push({
              code: 'QUESTION_MCQ_INSUFFICIENT_OPTIONS',
              message: `Câu trắc nghiệm #${q.order} cần ít nhất 2 phương án lựa chọn (A, B...).`,
              severity: 'error',
              targetType: 'question',
              targetId: q.id,
              sectionName: sec.name,
              questionOrder: q.order,
              fixHint: 'Thêm đầy đủ các phương án A, B, C, D cho câu hỏi.',
            })
          }
        }

        if (q.type === 'true_false_not_given') {
          const ansUpper = String(q.correctAnswer || '').toUpperCase().trim()
          const validTFNG = ['TRUE', 'FALSE', 'NOT GIVEN', 'A', 'B', 'C', 'T', 'F', 'NG']
          if (hasAnswer && !validTFNG.includes(ansUpper)) {
            warnings.push({
              code: 'QUESTION_TFNG_INVALID_VALUE',
              message: `Đáp án câu #${q.order} (${q.correctAnswer}) không thuộc dạng TRUE / FALSE / NOT GIVEN chuẩn.`,
              severity: 'warning',
              targetType: 'question',
              targetId: q.id,
              sectionName: sec.name,
              questionOrder: q.order,
              fixHint: 'Chọn một trong 3 giá trị: TRUE, FALSE hoặc NOT GIVEN.',
            })
          }
        }
      }
    }

    // Writing section specific checks
    if (sec.name === 'Writing' && sec.writingTasks) {
      for (const wt of sec.writingTasks) {
        if (!wt.prompt || wt.prompt.trim().length < 10) {
          errors.push({
            code: 'WRITING_TASK_PROMPT_EMPTY',
            message: `Đề bài ${wt.title || wt.taskType} trong Writing quá ngắn hoặc để trống.`,
            severity: 'error',
            targetType: 'section',
            targetId: sec.id,
            sectionName: 'Writing',
            fixHint: 'Nhập nội dung đề bài và hướng dẫn chi tiết cho bài thi viết.',
          })
        }
      }
    }
  }

  // 3. FULL MOCK TEST COMPLIANCE CHECK
  const isFullMock = Boolean(test.isFullMock)
  let isFullMockCompliant = false

  const lisSec = test.sections.find((s) => s.name === 'Listening')
  const readSec = test.sections.find((s) => s.name === 'Reading')
  const writeSec = test.sections.find((s) => s.name === 'Writing')
  const speakSec = test.sections.find((s) => s.name === 'Speaking')

  const lisQCount = (lisSec?.groups || []).reduce((acc, g) => acc + g.questions.length, 0)
  const readQCount = (readSec?.groups || []).reduce((acc, g) => acc + g.questions.length, 0)
  const writeTaskCount = writeSec?.writingTasks?.length || 0
  const speakPartCount = speakSec?.speakingParts?.length || 0

  if (lisQCount >= 40 && readQCount >= 40 && writeTaskCount >= 2 && speakPartCount >= 3) {
    isFullMockCompliant = true
  }

  if (isFullMock && !isFullMockCompliant) {
    errors.push({
      code: 'TEST_NOT_FULL_MOCK_COMPLIANT',
      message: `Đề thi được đánh dấu là "Full Mock Test 4 kỹ năng" nhưng chưa đạt chuẩn 40 câu Listening (hiện có: ${lisQCount}), 40 câu Reading (hiện có: ${readQCount}), 2 task Writing (hiện có: ${writeTaskCount}) hoặc 3 part Speaking (hiện có: ${speakPartCount}).`,
      severity: 'error',
      targetType: 'test',
      targetId: test.id,
      fixHint: 'Chuyển phân loại sang "Bộ câu hỏi mẫu theo dạng bài (Sample Tasks)" hoặc bổ sung đủ các phần để đạt chuẩn Full Mock.',
    })
  }

  const isValid = errors.length === 0
  const canPublish = isValid && missingAnswersCount === 0

  if (canPublish) {
    infos.push({
      code: 'TEST_READY_TO_PUBLISH',
      message: 'Bộ đề đã vượt qua tất cả các tiêu chí kiểm tra dữ liệu và sẵn sàng xuất bản.',
      severity: 'info',
      targetType: 'test',
      targetId: test.id,
      fixHint: 'Bạn có thể xuất bản ngay để học viên làm bài trong Exam Workspace.',
    })
  }

  return {
    isValid,
    canPublish,
    errors,
    warnings,
    infos,
    stats: {
      totalSections: test.sections.length,
      totalGroups: test.sections.reduce((acc, s) => acc + s.groups.length, 0),
      totalQuestions: totalQuestionsCount,
      answeredQuestions: answeredQuestionsCount,
      missingAnswers: missingAnswersCount,
      hasAudio,
      hasPassages,
      isFullMockCompliant,
    },
  }
}
