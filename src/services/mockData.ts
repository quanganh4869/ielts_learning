import { LearningPath } from '@/types/learningPath'
import { PracticeExercise, VocabularyItem, GrammarTopic } from '@/types/practice'
import { MockTest } from '@/types/mockTest'
import { UserStatistics } from '@/types/statistics'
import { officialFreeMockPackages } from './mockTestPackages'
import { cambridgeAcademic18MockTest } from './cambridgeMockTest'

// INITIAL LEARNING PATH
export const mockLearningPath: LearningPath = {
  id: 'lp-01',
  title: 'Lộ trình IELTS Chinh phục Band 7.0+',
  testType: 'academic',
  targetBand: 7.0,
  currentPhaseId: 'phase-01',
  overallProgressPercentage: 35,
  phases: [
    {
      id: 'phase-01',
      phaseNumber: 1,
      title: 'Giai đoạn 1: Nền tảng & Kỹ thuật xử lý dạng bài',
      targetBandRange: '5.5 - 6.5',
      description: 'Củng cố ngữ pháp học thuật, kỹ thuật Skimming & Scanning, phương pháp nghe note-taking và cấu trúc đoạn văn IELTS Writing Task 2.',
      status: 'current',
      progressPercentage: 65,
      weeks: [
        {
          id: 'w-01',
          weekNumber: 1,
          title: 'Tuần 1: Xây dựng nền tảng từ vựng & Kỹ năng Đọc cốt lõi',
          goal: 'Nắm vững phương pháp Skimming & Scanning, giải quyết dạng bài True/False/Not Given.',
          status: 'completed',
          lessons: [
            {
              id: 'les-101',
              title: 'Kỹ thuật Skimming & Scanning trong IELTS Reading',
              skill: 'reading',
              estimatedMinutes: 30,
              status: 'completed',
              score: 95,
              objectives: [
                'Phân biệt mục đích giữa Skimming (đọc lướt ý chính) và Scanning (tìm từ khóa cụ thể).',
                'Nhận biết paraphrase và từ đồng nghĩa trong đoạn văn học thuật.',
                'Thực hành định vị thông tin nhanh dưới áp lực thời gian.',
              ],
              steps: [
                {
                  id: 's-1',
                  title: '1. Khái niệm Skimming vs Scanning',
                  type: 'concept',
                  durationMinutes: 8,
                  content: 'Skimming là kỹ thuật đọc nhanh toàn bài để nắm cấu trúc, chủ đề và ý chính của từng đoạn mà không dừng lại tra từ mới. Scanning là kỹ thuật rà soát mắt để tìm các từ khóa đặc biệt như tên riêng, con số, thuật ngữ.',
                },
                {
                  id: 's-2',
                  title: '2. Ví dụ phân tích',
                  type: 'example',
                  durationMinutes: 10,
                  content: 'Ví dụ bài đọc về "The Origin of Paper": Hãy xác định năm phát minh ra giấy và tên người chế tạo trong đoạn 1 mà không cần đọc từng từ.',
                },
                {
                  id: 's-3',
                  title: '3. Bài tập thực hành nhanh',
                  type: 'practice',
                  durationMinutes: 12,
                  content: 'Đọc đoạn văn ngắn và trả lời 2 câu hỏi định vị thông tin.',
                  sampleQuestions: [
                    {
                      id: 'q-1',
                      prompt: 'Đoạn văn đề cập đến loại cây nào được dùng làm giấy đầu tiên?',
                      options: ['Papyrus', 'Bó tre', 'Vỏ dâu tằm', 'Sợi lanh'],
                      correctAnswer: 'Vỏ dâu tằm',
                      explanation: 'Trong dòng thứ 3 đoạn 1: "Cai Lun used mulberry bark as the prime fiber."',
                    },
                  ],
                },
              ],
            },
            {
              id: 'les-102',
              title: 'Chiến thuật giải quyết dạng bài True / False / Not Given',
              skill: 'reading',
              estimatedMinutes: 40,
              status: 'completed',
              score: 88,
              objectives: [
                'Hiểu rõ sự khác biệt tuyệt đối giữa FALSE (mâu thuẫn thông tin) và NOT GIVEN (không có căn cứ khẳng định).',
                'Tránh suy diễn ngoài dữ kiện bài đọc.',
              ],
              steps: [
                {
                  id: 's-1',
                  title: '1. Quy tắc phân định FALSE vs NOT GIVEN',
                  type: 'concept',
                  durationMinutes: 10,
                  content: 'TRUE: Thông tin câu hỏi hoàn toàn trùng khớp với bài đọc sau khi được paraphrase. FALSE: Thông tin trong đề đối lập 180 độ so với bài đọc. NOT GIVEN: Bài đọc không nhắc đến hoặc chỉ nhắc đến một vế mà không có mối quan hệ so sánh.',
                },
              ],
            },
          ],
        },
        {
          id: 'w-02',
          weekNumber: 2,
          title: 'Tuần 2: Kỹ năng Nghe Section 1 & 2 và Phân tích biểu đồ Writing Task 1',
          goal: 'Đạt tối thiểu 8/10 câu Listening Section 1 và hoàn thành dàn bài Writing Task 1 dạng biểu đồ đường.',
          status: 'current',
          lessons: [
            {
              id: 'les-103',
              title: 'Listening Section 1: Kỹ năng bắt từ và nhận diện bẫy sửa đổi thông tin',
              skill: 'listening',
              estimatedMinutes: 35,
              status: 'in_progress',
              objectives: [
                'Ghi nhận chính xác số điện thoại, ngày tháng và đánh vần tên riêng.',
                'Nhận biết các từ nối bẫy như "Actually", "Sorry", "I meant".',
              ],
              steps: [
                {
                  id: 's-1',
                  title: '1. Nhận biết bẫy tự sửa đổi (Self-correction)',
                  type: 'concept',
                  durationMinutes: 10,
                  content: 'Trong IELTS Listening Section 1, người nói thường đưa ra một thông tin ban đầu sau đó đính chính lại ngay lập tức.',
                },
              ],
            },
            {
              id: 'les-104',
              title: 'Writing Task 1: Cấu trúc 4 đoạn chuẩn cho biểu đồ có xu hướng',
              skill: 'writing',
              estimatedMinutes: 45,
              status: 'not_started',
              objectives: [
                'Viết mở bài Paraphrase trong 1 câu.',
                'Viết Overview nêu 2 đặc điểm nổi bật nhất (không đưa số liệu).',
                'Chia 2 đoạn thân bài hợp lý theo mốc thời gian hoặc nhóm số liệu.',
              ],
              steps: [
                {
                  id: 's-1',
                  title: '1. Cấu trúc bài Task 1',
                  type: 'concept',
                  durationMinutes: 15,
                  content: 'Introduction -> Overview -> Body Paragraph 1 -> Body Paragraph 2.',
                },
              ],
            },
          ],
        },
        {
          id: 'w-03',
          weekNumber: 3,
          title: 'Tuần 3: Phát triển ý tưởng Speaking Part 2 và Cấu trúc đoạn văn Writing Task 2',
          goal: 'Luyện tập phương pháp mở rộng câu trả lời P-E-E (Point, Explanation, Example).',
          status: 'locked',
          lessons: [],
        },
      ],
    },
    {
      id: 'phase-02',
      phaseNumber: 2,
      title: 'Giai đoạn 2: Tăng tốc kỹ năng & Xử lý đề thi chuyên sâu',
      targetBandRange: '6.5 - 7.5',
      description: 'Luyện tập Reading Section 3 học thuật, Listening Section 4 bài giảng, phản xạ Speaking Part 3 và tư duy phản biện cho Writing Task 2.',
      status: 'locked',
      progressPercentage: 0,
      weeks: [],
    },
    {
      id: 'phase-03',
      phaseNumber: 3,
      title: 'Giai đoạn 3: Thực chiến phòng thi & Tinh chỉnh Band điểm',
      targetBandRange: '7.0 - 8.0+',
      description: 'Giải các bộ đề thi thử hoàn chỉnh dưới áp lực thời gian thực, rà soát lỗi sai hệ thống và hoàn thiện phong thái thi.',
      status: 'locked',
      progressPercentage: 0,
      weeks: [],
    },
  ],
}

// PRACTICE EXERCISES FIXTURES
export const mockListeningExercises: PracticeExercise[] = [
  {
    id: 'lis-01',
    title: 'Customer Service: Accommodation Booking Inquiries',
    skill: 'listening',
    level: 'Band 6.0-7.0',
    topic: 'Daily Social Life',
    questionTypeCategory: 'Form Completion & Multiple Choice',
    timeLimitMinutes: 12,
    audioDurationSeconds: 195,
    questions: [
      {
        id: 'lq-1',
        order: 1,
        type: 'fill_blank',
        prompt: 'Full name of the caller: Mark ________',
        correctAnswer: 'Henderson',
        explanation: 'Người nói đánh vần rõ ràng họ của mình: H-E-N-D-E-R-S-O-N.',
        evidenceSnippet: 'My last name is Henderson, spelled H-E-N-D-E-R-S-O-N.',
      },
      {
        id: 'lq-2',
        order: 2,
        type: 'fill_blank',
        prompt: 'Preferred room type: ________ with ocean view',
        correctAnswer: 'Double',
        explanation: 'Ban đầu người gọi hỏi phòng đơn, sau đó đổi sang phòng đôi (Double room).',
        evidenceSnippet: 'Actually, make it a double room please, my brother is joining me.',
      },
      {
        id: 'lq-3',
        order: 3,
        type: 'multiple_choice',
        prompt: 'What payment method does the customer decide to use?',
        options: ['Credit Card', 'Bank Transfer', 'Cash upon arrival', 'PayPal'],
        correctAnswer: 'Credit Card',
        explanation: 'Khách hàng chọn thanh toán thẻ tín dụng để nhận xác nhận ngay lập tức.',
        evidenceSnippet: 'I prefer paying by credit card now so the booking is secured.',
      },
      {
        id: 'lq-4',
        order: 4,
        type: 'fill_blank',
        prompt: 'Deposit amount required: $________',
        correctAnswer: '150',
        explanation: 'Nhân viên lễ tân thông báo số tiền cọc là 150 đô la.',
        evidenceSnippet: 'A standard refundable deposit of 150 dollars is charged today.',
      },
    ],
    totalQuestions: 4,
  },
  {
    id: 'lis-02',
    title: 'University Lecture: Coral Reef Restoration Technologies',
    skill: 'listening',
    level: 'Band 7.0-8.0',
    topic: 'Marine Science & Environment',
    questionTypeCategory: 'Note Completion & Multiple Choice',
    timeLimitMinutes: 15,
    audioDurationSeconds: 240,
    questions: [
      {
        id: 'lq-5',
        order: 1,
        type: 'multiple_choice',
        prompt: 'What is the primary cause of coral bleaching mentioned by the lecturer?',
        options: [
          'Rising ocean temperatures',
          'Industrial chemical pollution',
          'Overfishing in shallow waters',
          'Excessive tourist activities',
        ],
        correctAnswer: 'Rising ocean temperatures',
        explanation: 'Giảng viên nhấn mạnh nhiệt độ nước biển tăng cao là nguyên nhân hàng đầu.',
        evidenceSnippet: 'Thermal stress driven by sustained temperature increases remains the paramount catalyst.',
      },
      {
        id: 'lq-6',
        order: 2,
        type: 'fill_blank',
        prompt: 'The innovative method uses 3D-printed ceramic structures coated with ________ to accelerate coral larval attachment.',
        correctAnswer: 'calcium carbonate',
        explanation: 'Cấu trúc được phủ canxi cacbonat nhằm kích thích ấu trùng san hô bám vào.',
        evidenceSnippet: 'The modules are treated with a specialized layer of calcium carbonate.',
      },
    ],
    totalQuestions: 2,
  },
]

export const mockReadingExercises: PracticeExercise[] = [
  {
    id: 'read-01',
    title: 'The Evolution of Urban Agriculture in Contemporary Cities',
    skill: 'reading',
    level: 'Band 6.0-7.0',
    topic: 'Environment & Urban Planning',
    questionTypeCategory: 'True/False/Not Given & Summary Completion',
    timeLimitMinutes: 20,
    passageTitle: 'Vertical Farming and Food Security in Megacities',
    passageContent: [
      'By the year 2050, nearly 70% of the world population is projected to dwell in urban metropolises. This unprecedented demographic shift poses monumental challenges for global food distribution networks, which currently generate significant carbon emissions through cross-continental transport.',
      'In response, urban planners and agronomists have pioneered vertical farming—cultivating crops in vertically stacked layers inside controlled environment agriculture (CEA) buildings. Utilizing aeroponics and hydroponics, these high-tech indoor facilities recycle up to 95% more water than traditional agrarian fields while eliminating chemical pesticide runoff.',
      'However, critics argue that the capital expenditures required for LED illumination, automated climate controls, and real estate acquisition make vertical produce markedly costlier than conventional field-grown alternatives. While leafy greens and herbs flourish economically, staple carbohydrate crops like wheat and rice remain economically unfeasible for indoor cultivation.',
      'Despite economic hurdles, progressive municipalities in Singapore, Tokyo, and Rotterdam are incorporating vertical micro-farms directly into residential skyscrapers and school campuses. These community-oriented installations serve dual functions: supplementing local green produce and educating upcoming generations on sustainable nutritional practices.',
    ],
    questions: [
      {
        id: 'rq-1',
        order: 1,
        type: 'true_false_not_given',
        prompt: 'Traditional farming methods consume less water than high-tech vertical farming facilities.',
        options: ['TRUE', 'FALSE', 'NOT GIVEN'],
        correctAnswer: 'FALSE',
        explanation: 'Đoạn 2 chỉ ra vertical farming tái chế tới 95% lượng nước nhiều hơn nông nghiệp truyền thống, nghĩa là nông nghiệp truyền thống tiêu thụ nhiều nước hơn.',
        evidenceSnippet: 'these high-tech indoor facilities recycle up to 95% more water than traditional agrarian fields',
        evidenceParagraph: 2,
      },
      {
        id: 'rq-2',
        order: 2,
        type: 'true_false_not_given',
        prompt: 'Grain staples such as rice and wheat are currently profitable when grown in vertical farms.',
        options: ['TRUE', 'FALSE', 'NOT GIVEN'],
        correctAnswer: 'FALSE',
        explanation: 'Đoạn 3 khẳng định cây lương thực như lúa mì và gạo vẫn "economically unfeasible" (chưa khả thi về mặt kinh tế).',
        evidenceSnippet: 'staple carbohydrate crops like wheat and rice remain economically unfeasible for indoor cultivation.',
        evidenceParagraph: 3,
      },
      {
        id: 'rq-3',
        order: 3,
        type: 'true_false_not_given',
        prompt: 'The government of Singapore provides financial subsidies to private vertical farming enterprises.',
        options: ['TRUE', 'FALSE', 'NOT GIVEN'],
        correctAnswer: 'NOT GIVEN',
        explanation: 'Đoạn 4 nhắc đến Singapore đưa micro-farm vào tòa nhà nhưng không hề nhắc đến việc chính phủ có trợ cấp tài chính hay không.',
        evidenceSnippet: 'progressive municipalities in Singapore, Tokyo, and Rotterdam are incorporating vertical micro-farms directly into residential skyscrapers',
        evidenceParagraph: 4,
      },
      {
        id: 'rq-4',
        order: 4,
        type: 'fill_blank',
        prompt: 'By 2050, roughly ________ percent of humanity is expected to reside in metropolitan centers.',
        correctAnswer: '70',
        explanation: 'Đoạn 1 nêu rõ con số 70%.',
        evidenceSnippet: 'By the year 2050, nearly 70% of the world population is projected to dwell in urban metropolises.',
        evidenceParagraph: 1,
      },
    ],
    totalQuestions: 4,
  },
]

export const mockWritingExercises: PracticeExercise[] = [
  {
    id: 'wri-task1-towns',
    title: 'Task 1: Internet Access in Three Towns (2010–2022)',
    skill: 'writing',
    level: 'Band 6.5-8.0',
    topic: 'Technology & Demographics',
    questionTypeCategory: 'Line Graph Analysis',
    timeLimitMinutes: 20,
    writingPrompt: {
      taskType: 'task_1',
      chartType: 'line_graph',
      chartDescription:
        'The line graph compares the percentage of households with home broadband internet connection in three towns (Portville, Greendale, and Westhaven) over a 12-year period from 2010 to 2022.',
      instructions:
        'Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.',
      minWords: 150,
      recommendedMinutes: 20,
    },
  },
  {
    id: 'wri-02',
    title: 'Task 1: Renewable Electricity Generation (2010–2024)',
    skill: 'writing',
    level: 'Band 6.0-7.5',
    topic: 'Energy & Climate',
    questionTypeCategory: 'Bar Chart Analysis',
    timeLimitMinutes: 20,
    writingPrompt: {
      taskType: 'task_1',
      chartType: 'bar_chart',
      chartDescription:
        'The bar chart illustrates the volume of gigawatt-hours (GWh) generated from solar, wind, and hydropower across five European nations in 2024.',
      instructions:
        'Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.',
      minWords: 150,
      recommendedMinutes: 20,
    },
  },
  {
    id: 'wri-task1-pie',
    title: 'Task 1: Household Expenditure Proportions (2010 vs 2024)',
    skill: 'writing',
    level: 'Band 6.5-8.0',
    topic: 'Economics & Consumer Habits',
    questionTypeCategory: 'Pie Chart Analysis',
    timeLimitMinutes: 20,
    writingPrompt: {
      taskType: 'task_1',
      chartType: 'pie_chart',
      chartDescription:
        'The two pie charts compare the proportion of monthly household expenditure spent on food, housing, transport, healthcare, and leisure in 2010 and 2024.',
      instructions:
        'Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.',
      minWords: 150,
      recommendedMinutes: 20,
    },
  },
  {
    id: 'wri-01',
    title: 'Task 2: Artificial Intelligence in Higher Education',
    skill: 'writing',
    level: 'Band 6.0-7.5',
    topic: 'Technology & Education',
    questionTypeCategory: 'Opinion / Agree or Disagree',
    timeLimitMinutes: 40,
    writingPrompt: {
      taskType: 'task_2',
      instructions:
        'Some educators believe that artificial intelligence tools should be entirely banned from universities to protect academic honesty, while others argue that universities should integrate AI into their teaching and research curricula. Discuss both views and give your own opinion.',
      minWords: 250,
      recommendedMinutes: 40,
    },
  },
  {
    id: 'wri-task2-climate',
    title: 'Task 2: Economic Growth vs Environmental Conservation',
    skill: 'writing',
    level: 'Band 7.0-8.5',
    topic: 'Environment & Sustainable Policy',
    questionTypeCategory: 'Discuss Both Views',
    timeLimitMinutes: 40,
    writingPrompt: {
      taskType: 'task_2',
      instructions:
        'Some people believe that prioritizing rapid economic development is essential to alleviate poverty, even if it harms the environment. Others assert that environmental conservation must take precedence over financial expansion. Discuss both perspectives and present your considered viewpoint.',
      minWords: 250,
      recommendedMinutes: 40,
    },
  },
  {
    id: 'wri-task2-traffic',
    title: 'Task 2: Metropolitan Traffic Congestion & Public Transport',
    skill: 'writing',
    level: 'Band 6.5-8.0',
    topic: 'Urban Planning & Transport',
    questionTypeCategory: 'Problem & Solution Essay',
    timeLimitMinutes: 40,
    writingPrompt: {
      taskType: 'task_2',
      instructions:
        'Severe traffic congestion in modern metropolises is causing grave economic losses and health hazards. What are the principal causes of this dilemma, and what practical remedies could municipal administrations implement?',
      minWords: 250,
      recommendedMinutes: 40,
    },
  },
]

export const mockSpeakingExercises: PracticeExercise[] = [
  {
    id: 'spk-01',
    title: 'Speaking Part 2 & 3: An Inspiring Book or Academic Work',
    skill: 'speaking',
    level: 'Band 6.0-7.0',
    topic: 'Literature & Intellectual Growth',
    questionTypeCategory: 'Long Turn & Discussion',
    timeLimitMinutes: 15,
    speakingPrompt: {
      part: 2,
      topic: 'Describe an influential book you have read that shaped your perspective',
      cueCard: {
        task: 'You should say:',
        cues: [
          'What book it was and who wrote it',
          'What the central theme or storyline was',
          'Why you chose to read it at that time',
          'And explain how it influenced your thinking or worldview.',
        ],
        preparationTimeSeconds: 60,
        speakingTimeSeconds: 120,
      },
      questions: [
        'How has digital media influenced young people’s reading habits compared to older generations?',
        'Do you think printed literature will ever be completely rendered obsolete by audiobooks and AI summaries?',
        'What role should educational institutions play in promoting critical reading skills?',
      ],
    },
  },
]

export const mockVocabularyItems: VocabularyItem[] = [
  {
    id: 'voc-1',
    word: 'Mitigate',
    phonetic: '/ˈmɪt.ɪ.ɡeɪt/',
    partOfSpeech: 'verb',
    vietnameseMeaning: 'Làm giảm nhẹ, xoa dịu (tác hại, rủi ro, mức độ nghiêm trọng)',
    englishDefinition: 'To make something less harmful, unpleasant, or bad.',
    collocations: ['mitigate the risk of', 'mitigate adverse effects', 'mitigate climate change'],
    examples: [
      'Stricter environmental regulations were enacted to mitigate the adverse effects of industrial effluent.',
      'Urban green spaces help mitigate the urban heat island phenomenon.',
    ],
    topic: 'Environment & Policy',
    masteryLevel: 'learning',
  },
  {
    id: 'voc-2',
    word: 'Exacerbate',
    phonetic: '/ɪɡˈzæs.ə.beɪt/',
    partOfSpeech: 'verb',
    vietnameseMeaning: 'Làm trầm trọng thêm, khiến tình hình xấu đi',
    englishDefinition: 'To make a problem, bad situation, or negative feeling worse.',
    collocations: ['exacerbate the problem', 'exacerbate existing inequalities', 'exacerbate tensions'],
    examples: [
      'Unchecked urban sprawl can exacerbate traffic congestion and air pollution.',
      'The economic crisis has exacerbated socio-economic disparities across the region.',
    ],
    topic: 'Social Issues',
    masteryLevel: 'new',
  },
  {
    id: 'voc-3',
    word: 'Prevalent',
    phonetic: '/ˈprev.əl.ənt/',
    partOfSpeech: 'adjective',
    vietnameseMeaning: 'Phổ biến, thịnh hành, đang tồn tại rộng rãi',
    englishDefinition: 'Existing very commonly or happening frequently in a particular place or time.',
    collocations: ['widely prevalent', 'prevalent among youths', 'the prevalent attitude'],
    examples: [
      'Sedentary lifestyles are increasingly prevalent among urban office workers.',
      'The belief that technology solves all educational challenges remains prevalent.',
    ],
    topic: 'Academic Writing & Research',
    masteryLevel: 'mastered',
  },
  {
    id: 'voc-4',
    word: 'Feasible',
    phonetic: '/ˈfiː.zə.bəl/',
    partOfSpeech: 'adjective',
    vietnameseMeaning: 'Khả thi, có thể thực hiện được trong thực tế',
    englishDefinition: 'Able to be made, done, or achieved, especially with available resources.',
    collocations: ['economically feasible', 'technically feasible', 'a feasible alternative'],
    examples: [
      'Transitioning entirely to renewable energy within a decade is technically feasible with adequate investments.',
    ],
    topic: 'Technology & Economy',
    masteryLevel: 'learning',
  },
  {
    id: 'voc-5',
    word: 'Disparity',
    phonetic: '/dɪˈspær.ə.ti/',
    partOfSpeech: 'noun',
    vietnameseMeaning: 'Sự chênh lệch, sự bất bình đẳng rõ rệt',
    englishDefinition: 'A noticeable difference, usually one connected with unfair treatment.',
    collocations: ['income disparity', 'regional disparities', 'a glaring disparity'],
    examples: [
      'There is a growing disparity between rural and metropolitan educational infrastructure.',
    ],
    topic: 'Social Issues',
    masteryLevel: 'learning',
  },
]

export const mockGrammarTopics: GrammarTopic[] = [
  {
    id: 'gram-01',
    title: 'Inversion (Đảo ngữ nâng cao trong IELTS Writing)',
    level: 'Advanced',
    description: 'Sử dụng cấu trúc đảo ngữ đúng ngữ cảnh để tạo điểm nhấn trang trọng và thể hiện sự đa dạng cấu trúc ngữ pháp (GRA Band 7+).',
    rules: [
      {
        ruleTitle: '1. Đảo ngữ với phó từ phủ định đứng đầu câu',
        explanation: 'Khi đưa các trạng từ phủ định hoặc bán phủ định (Not only, Seldom, Rarely, Under no circumstances) lên đầu câu, ta đảo trợ động từ lên trước chủ ngữ.',
        formula: 'Negative Adverbial + Auxiliary Verb + Subject + Main Verb',
        examples: [
          {
            correct: 'Rarely do developing nations allocate sufficient funding to public healthcare.',
            incorrect: 'Rarely developing nations allocate sufficient funding.',
            note: 'Phải mượn trợ động từ "do" cho thì hiện tại đơn.',
          },
          {
            correct: 'Under no circumstances should dangerous historical artefacts be exported without governmental authorization.',
            note: 'Dùng cho các luận điểm thể hiện tính bắt buộc hoặc cấm kỵ.',
          },
        ],
      },
      {
        ruleTitle: '2. Đảo ngữ câu điều kiện không dùng If (Inverted Conditionals)',
        explanation: 'Bỏ "If" và đảo "Had", "Were", hoặc "Should" lên đầu câu.',
        formula: 'Had + S + V3/ed (Loại 3) / Were + S + to V (Loại 2)',
        examples: [
          {
            correct: 'Had policymakers intervened earlier, the catastrophic environmental degradation could have been prevented.',
            incorrect: 'If had policymakers intervened earlier...',
            note: 'Đã đảo "Had" thì tuyệt đối không giữ lại liên từ "If".',
          },
        ],
      },
    ],
    commonMistakes: [
      'Quên trợ động từ khi đảo ngữ (ví dụ viết "Not only they succeeded" thay vì "Not only did they succeed").',
      'Lạm dụng đảo ngữ quá mức khiến bài văn trở nên gượng gạo và thiếu tự nhiên.',
    ],
    practiceQuestions: [
      {
        id: 'gq-1',
        order: 1,
        type: 'multiple_choice',
        prompt: 'Chọn câu đảo ngữ chính xác cho câu sau: "They had never witnessed such rapid economic expansion before."',
        options: [
          'Never before they had witnessed such rapid economic expansion.',
          'Never before had they witnessed such rapid economic expansion.',
          'Never before did they had witnessed such rapid economic expansion.',
          'Never had before they witnessed such rapid economic expansion.',
        ],
        correctAnswer: 'Never before had they witnessed such rapid economic expansion.',
        explanation: 'Trạng từ phủ định "Never before" đứng đầu, đảo trợ động từ thì quá khứ hoàn thành "had" lên trước chủ ngữ "they".',
      },
    ],
  },
  {
    id: 'gram-02',
    title: 'Passive Reporting Verbs (Cấu trúc bị động khách quan)',
    level: 'Intermediate',
    description: 'Cách diễn đạt quan điểm của số đông hoặc giới nghiên cứu một cách học thuật, khách quan thay vì dùng "People say that".',
    rules: [
      {
        ruleTitle: '1. Cấu trúc It + is + V3/ed + that clause',
        explanation: 'Dùng để tường thuật nhận định học thuật (is argued, is widely believed, is claimed).',
        formula: 'It is acknowledged / argued / widely believed that + S + V',
        examples: [
          {
            correct: 'It is widely acknowledged that continuous professional development enhances career trajectory.',
            note: 'Tránh dùng cụm xơ cứng "A lot of people think that".',
          },
        ],
      },
    ],
    commonMistakes: [
      'Nhầm lẫn giữa thì hiện tại (is argued) và quá khứ khi diễn tả quan điểm khoa học hiện hành.',
    ],
    practiceQuestions: [],
  },
]

// MOCK TESTS FIXTURES
export const mockTestsList: MockTest[] = [
  ...officialFreeMockPackages,
  cambridgeAcademic18MockTest,
]

// INITIAL USER STATISTICS
export const initialUserStatistics: UserStatistics = {
  totalMinutesStudied: 1420, // ~23.6 hours
  totalLessonsCompleted: 14,
  totalExercisesCompleted: 38,
  streakDays: 7,
  skillHistory: [
    { date: '2026-09-15', listening: 6.0, reading: 6.0, writing: 5.5, speaking: 5.5, overall: 6.0 },
    { date: '2026-09-30', listening: 6.5, reading: 6.0, writing: 6.0, speaking: 6.0, overall: 6.0 },
    { date: '2026-10-15', listening: 7.0, reading: 6.5, writing: 6.0, speaking: 6.0, overall: 6.5 },
  ],
  studyLogs: [
    { date: '2026-10-19', minutesSpent: 45, lessonsCompleted: 1, exercisesDone: 2 },
    { date: '2026-10-20', minutesSpent: 60, lessonsCompleted: 2, exercisesDone: 4 },
    { date: '2026-10-21', minutesSpent: 30, lessonsCompleted: 1, exercisesDone: 1 },
    { date: '2026-10-22', minutesSpent: 90, lessonsCompleted: 2, exercisesDone: 5 },
    { date: '2026-10-23', minutesSpent: 45, lessonsCompleted: 1, exercisesDone: 3 },
    { date: '2026-10-24', minutesSpent: 75, lessonsCompleted: 2, exercisesDone: 4 },
    { date: '2026-10-25', minutesSpent: 50, lessonsCompleted: 1, exercisesDone: 2 },
  ],
  diagnoses: [
    {
      skill: 'Reading',
      currentBand: 6.5,
      targetBand: 7.5,
      commonWeaknesses: ['Dạng bài True/False/Not Given', 'Tốc độ định vị thông tin Section 3'],
      recommendedActions: [
        {
          title: 'Chiến thuật True/False/Not Given chuyên sâu',
          route: '/app/practice/reading/read-01',
          reason: 'Có 3 lỗi sai liên quan đến suy diễn ngoài văn bản.',
        },
      ],
    },
    {
      skill: 'Writing',
      currentBand: 6.0,
      targetBand: 7.0,
      commonWeaknesses: ['Mở rộng ý tưởng ở đoạn thân bài 2', 'Sử dụng cấu trúc câu phức (GRA)'],
      recommendedActions: [
        {
          title: 'Luyện tập cấu trúc Inversion & Passive Voice',
          route: '/app/practice/grammar/gram-01',
          reason: 'Cần nâng tỷ lệ câu ghép/câu phức từ 40% lên 70%.',
        },
      ],
    },
  ],
}
