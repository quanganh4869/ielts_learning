import { User } from '@/types/auth'
import { OnboardingData } from '@/types/onboarding'
import { LearningPath, Lesson } from '@/types/learningPath'
import { PracticeExercise, WritingEvaluation, SpeakingEvaluation, VocabularyItem, GrammarTopic } from '@/types/practice'
import { MockTest, MockTestResult } from '@/types/mockTest'
import { TutorMessage } from '@/types/aiTutor'
import { UserStatistics } from '@/types/statistics'
import {
  mockLearningPath,
  mockListeningExercises,
  mockReadingExercises,
  mockWritingExercises,
  mockSpeakingExercises,
  mockVocabularyItems,
  mockGrammarTopics,
  mockTestsList,
  initialUserStatistics,
} from './mockData'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const apiService = {
  // AUTH
  async login(email: string, _password: string): Promise<User> {
    await delay(350)
    return {
      id: 'u-1',
      email,
      fullName: 'Nguyễn Quang Anh',
      targetBand: 7.0,
      testType: 'academic',
      currentBand: 6.5,
      isOnboarded: true,
      hasCompletedAssessment: true,
      createdAt: '2026-08-01',
    }
  },

  async register(email: string, fullName: string, _password: string): Promise<User> {
    await delay(400)
    return {
      id: 'u-' + Math.random().toString(36).slice(2, 7),
      email,
      fullName,
      targetBand: 6.5,
      testType: 'academic',
      isOnboarded: false,
      hasCompletedAssessment: false,
      createdAt: new Date().toISOString().split('T')[0],
    }
  },

  async submitOnboarding(data: OnboardingData): Promise<User> {
    await delay(300)
    return {
      id: 'u-current',
      email: 'user@ieltsplatform.com',
      fullName: 'Học viên IELTS',
      targetBand: data.targetBand,
      testType: data.testType,
      currentBand: data.reportedScores?.overall || 5.5,
      isOnboarded: true,
      hasCompletedAssessment: false,
      createdAt: new Date().toISOString().split('T')[0],
    }
  },

  // LEARNING PATH
  async getLearningPath(): Promise<LearningPath> {
    await delay(250)
    return mockLearningPath
  },

  async getLessonById(lessonId: string): Promise<Lesson | null> {
    await delay(200)
    for (const phase of mockLearningPath.phases) {
      for (const week of phase.weeks) {
        const found = week.lessons.find((l) => l.id === lessonId)
        if (found) return found
      }
    }
    return null
  },

  // PRACTICE EXERCISES
  async getExercisesBySkill(skill: string): Promise<PracticeExercise[]> {
    await delay(200)
    switch (skill) {
      case 'listening':
        return mockListeningExercises
      case 'reading':
        return mockReadingExercises
      case 'writing':
        return mockWritingExercises
      case 'speaking':
        return mockSpeakingExercises
      default:
        return []
    }
  },

  async getExerciseById(skill: string, exerciseId: string): Promise<PracticeExercise | null> {
    await delay(200)
    const list = await this.getExercisesBySkill(skill)
    return list.find((e) => e.id === exerciseId) || null
  },

  // WRITING EVALUATION
  async gradeWritingTask(
    _exerciseId: string,
    essayText: string,
    _taskType: 'task_1' | 'task_2'
  ): Promise<WritingEvaluation> {
    // Realistic AI simulation delay
    await delay(1200)
    return {
      overallBand: 6.5,
      taskAchievement: {
        score: 6.5,
        feedback:
          'Bài viết đã giải quyết đầy đủ cả hai vế của đề bài. Luận điểm có định hướng rõ ràng, tuy nhiên phần mở rộng ví dụ thực tế ở thân bài 2 còn tương đối khái quát.',
      },
      coherenceCohesion: {
        score: 7.0,
        feedback:
          'Bố cục 4 đoạn mạch lạc, liên kết câu tự nhiên bằng các từ nối học thuật như "Consequently", "On the other hand", "Furthermore".',
      },
      lexicalResource: {
        score: 6.5,
        feedback:
          'Sử dụng tốt các từ vựng học thuật theo chủ đề như "academic honesty", "integrate into curricula", "plagiarism detection". Cần tránh lặp lại cụm từ "AI tools".',
      },
      grammaticalRange: {
        score: 6.0,
        feedback:
          'Đa phần các câu ghép được sử dụng chính xác. Một vài câu phức còn lỗi chia thì và thiếu liên từ phụ thuộc.',
      },
      generalFeedback:
        'Bài viết có chất lượng tốt, cấu trúc rõ ràng. Để nâng lên Band 7.0+, hãy bổ sung một dẫn chứng số liệu hoặc ví dụ cụ thể cho thân bài thứ hai.',
      revisions: [
        {
          originalText: essayText.slice(0, 45) || 'Some educators believe AI is bad',
          suggestedText: 'A cohort of contemporary educators posits that artificial intelligence may compromise academic rigor',
          reason: 'Nâng cao tính học thuật và trang trọng của ngữ cảnh.',
        },
      ],
      improvedSample:
        'In the contemporary academic landscape, the emergence of generative artificial intelligence has ignited contentious debates regarding intellectual honesty and pedagogy...',
    }
  },

  // SPEAKING EVALUATION
  async evaluateSpeakingAudio(
    _exerciseId: string,
    _audioBlob: Blob,
    _durationSecs: number
  ): Promise<SpeakingEvaluation> {
    await delay(1500)
    return {
      overallBand: 6.5,
      fluencyCoherence: {
        score: 6.5,
        feedback:
          'Tốc độ nói ổn định, duy trì được mạch phát triển ý tưởng trong suốt 1 phút 40 giây. Ít xuất hiện hiện tượng dừng quá lâu hoặc lặp từ không chủ đích.',
      },
      lexicalResource: {
        score: 7.0,
        feedback:
          'Có vốn từ vựng phong phú về chủ đề văn học và tư duy cá nhân, biết sử dụng các collocations tự nhiên như "profound impact", "shape my worldview".',
      },
      grammaticalRange: {
        score: 6.5,
        feedback:
          'Sử dụng linh hoạt các thì quá khứ đơn, hiện tại hoàn thành và câu điều kiện loại 2.',
      },
      pronunciation: {
        score: 6.0,
        feedback:
          'Ngữ điệu tự nhiên, các nguyên âm đơn và đôi rõ ràng. Cần chú ý phát âm chuẩn các âm đuôi /s/, /z/, /t/ và nối âm khi nói nhanh.',
      },
      transcript:
        'The book I would like to speak about is "Sapiens" written by Yuval Noah Harari. I stumbled upon this masterpiece during my sophomore year at university. The central theme explores how humankind evolved through shared narratives and cooperation...',
      strengths: [
        'Duy trì phản xạ nói liên tục không bị gián đoạn.',
        'Ý tưởng bám sát yêu cầu của Cue Card.',
      ],
      areasForImprovement: [
        'Kiểm soát âm đuôi các từ kết thúc bằng phụ âm kép.',
        'Mở rộng thêm phần bình luận chiều sâu ở câu kết thúc.',
      ],
    }
  },

  // VOCABULARY & GRAMMAR
  async getVocabularyList(): Promise<VocabularyItem[]> {
    await delay(150)
    return mockVocabularyItems
  },

  async getGrammarTopics(): Promise<GrammarTopic[]> {
    await delay(150)
    return mockGrammarTopics
  },

  // MOCK TESTS
  async getMockTests(): Promise<MockTest[]> {
    await delay(200)
    return mockTestsList
  },

  async getMockTestById(testId: string): Promise<MockTest | null> {
    await delay(200)
    return mockTestsList.find((t) => t.id === testId) || null
  },

  async submitMockTestSession(
    testId: string,
    results: Array<{ sectionName: string; band: number }>
  ): Promise<MockTestResult> {
    await delay(600)
    const test = mockTestsList.find((t) => t.id === testId)
    const overall =
      results.length > 0
        ? Number((results.reduce((acc, r) => acc + r.band, 0) / results.length).toFixed(1))
        : 6.5

    return {
      id: 'res-' + Math.random().toString(36).slice(2, 7),
      testId,
      testTitle: test?.title || 'Mock Test',
      testCode: test?.code || 'CAM-18',
      completedAt: new Date().toISOString(),
      overallBand: overall,
      sections: results.map((r) => ({
        sectionName: r.sectionName,
        bandScore: r.band,
      })),
      recommendations: [
        'Cải thiện tốc độ làm bài Reading Section 3 để dành 5 phút kiểm tra lại phiếu trả lời.',
        'Củng cố từ vựng paraphrase trong Listening Section 2.',
      ],
    }
  },

  // AI TUTOR
  async sendTutorMessage(userText: string, contextSnippet?: string): Promise<TutorMessage> {
    await delay(600)
    let content = `Chào bạn! Tôi đã nhận được câu hỏi về: "${userText}".\n\n`

    if (contextSnippet) {
      content += `Dựa trên ngữ cảnh bạn đang học: "${contextSnippet}", đây là phân tích chi tiết:\n\n`
    }

    if (userText.toLowerCase().includes('inversion') || userText.toLowerCase().includes('đảo ngữ')) {
      content += `**Cấu trúc đảo ngữ trọng tâm:**\n\n1. Khi trạng từ mang nghĩa phủ định (*Rarely, Seldom, Not only, Under no circumstances*) đứng đầu câu:\n\`Negative Word + Trợ động từ + Chủ ngữ + Động từ chính\`\n\n*Ví dụ chuẩn IELTS Band 7.5+:*\n> "Rarely do municipal authorities implement comprehensive carbon-tax policies without public scrutiny."\n\n*Lưu ý lỗi thường gặp:* Không được quên đảo trợ động từ (không viết "Rarely authorities implement...").`
    } else if (userText.toLowerCase().includes('writing') || userText.toLowerCase().includes('task 2')) {
      content += `**Chiến lược phát triển luận điểm Task 2 (Công thức P-E-E):**\n\n- **Point (Luận điểm):** Nêu câu chủ đề ngắn gọn, trực diện.\n- **Explanation (Giải thích):** Làm rõ nguyên nhân - kết quả tại sao luận điểm đó đúng.\n- **Example (Minh chứng):** Đưa ra một ví dụ học thuật hoặc xu hướng xã hội cụ thể để củng cố sức thuyết phục.`
    } else {
      content += `Để đạt mục tiêu Band 7.0+, bạn nên chú trọng vào việc giải thích logic chặt chẽ (Coherence) và sử dụng đa dạng các cấu trúc câu ghép, câu phức thay vì chỉ tập trung nhồi nhét từ vựng đơn lẻ.\n\nBạn có muốn thực hành viết ngay một câu áp dụng phương pháp này không?`
    }

    return {
      id: 'msg-' + Math.random().toString(36).slice(2, 8),
      role: 'assistant',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedFollowUps: [
        'Cho tôi một bài tập thực hành về phần này',
        'Giải thích thêm lỗi sai phổ biến của thí sinh Việt Nam',
        'Làm thế nào để áp dụng vào bài thi thực tế?',
      ],
    }
  },

  // STATISTICS
  async getUserStatistics(): Promise<UserStatistics> {
    await delay(250)
    return initialUserStatistics
  },
}
