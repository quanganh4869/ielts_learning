import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ArrowLeft, Check } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { Input } from '@/components/common/Input'
import { ProgressBar } from '@/components/common/ProgressBar'
import { BrandLogo, NoriIllustration } from '@/components/brand'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { TestType, CurrentLevel, SkillType, OnboardingData } from '@/types/onboarding'
import { cn } from '@/utils/cn'

export const OnboardingPage: React.FC = () => {
  const { tText } = useLanguage()
  const navigate = useNavigate()
  const { completeOnboarding } = useAuth()

  const [currentStep, setCurrentStep] = useState<number>(1)
  const totalSteps = 5

  // Form State
  const [testType, setTestType] = useState<TestType>('academic')
  const [currentLevel, setCurrentLevel] = useState<CurrentLevel>('intermediate')
  const [reportedScores, setReportedScores] = useState({
    overall: 6.0,
    listening: 6.0,
    reading: 6.5,
    writing: 5.5,
    speaking: 5.5,
  })
  const [targetBand, setTargetBand] = useState<number>(7.0)
  const [targetExamDate, setTargetExamDate] = useState<string>('')
  const [daysPerWeek, setDaysPerWeek] = useState<number>(4)
  const [minutesPerSession, setMinutesPerSession] = useState<number>(60)
  const [prioritySkills, setPrioritySkills] = useState<SkillType[]>(['writing', 'speaking'])

  const [isLoading, setIsLoading] = useState(false)

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFinish = async (goToAssessment: boolean) => {
    setIsLoading(true)
    const onboardingPayload: OnboardingData = {
      testType,
      currentLevel,
      reportedScores: currentLevel === 'had_taken_test' ? reportedScores : undefined,
      targetBand,
      targetExamDate: targetExamDate || undefined,
      studySchedule: {
        daysPerWeek,
        minutesPerSession,
        prioritySkills,
      },
    }

    try {
      await completeOnboarding(onboardingPayload)
      if (goToAssessment) {
        navigate('/assessment')
      } else {
        navigate('/app/dashboard')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const toggleSkillPriority = (skill: SkillType) => {
    setPrioritySkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col justify-between p-4 sm:p-8">
      {/* HEADER */}
      <div className="max-w-xl mx-auto w-full pt-4">
        <div className="flex items-center justify-between mb-4">
          <BrandLogo variant="horizontal" size="sm" to="/" tagline={tText('Thiết lập lộ trình', 'Study Onboarding')} />
          <span className="text-xs font-semibold text-[#68727D]">
            {tText(`Bước ${currentStep} trên ${totalSteps}`, `Step ${currentStep} of ${totalSteps}`)}
          </span>
        </div>
        <ProgressBar value={(currentStep / totalSteps) * 100} size="sm" />
      </div>

      {/* FORM BODY */}
      <div className="max-w-xl mx-auto w-full my-8">
        <Card className="p-6 sm:p-8 bg-white border border-[#E3E7EB] rounded-2xl shadow-xs">
          {/* STEP 1: TEST TYPE */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-[#20272E]">{tText('Chọn loại bài thi IELTS', 'Select IELTS Exam Type')}</h2>
                <p className="text-xs text-[#68727D] mt-1">
                  {tText('Lộ trình và bài tập sẽ được tùy chỉnh theo cấu trúc đề thi bạn chọn.', 'Study path and questions will be calibrated to your selected exam module.')}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                <button
                  type="button"
                  onClick={() => setTestType('academic')}
                  className={cn(
                    'p-4 rounded-xl border text-left transition-all focus:outline-none',
                    testType === 'academic'
                      ? 'border-[#28665F] bg-[#EAF3F1] ring-1 ring-[#28665F]'
                      : 'border-[#E3E7EB] bg-white hover:border-[#CBD5E1]'
                  )}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-sm text-[#20272E]">IELTS Academic</span>
                    {testType === 'academic' && (
                      <span className="w-4 h-4 rounded-full bg-[#28665F] text-white flex items-center justify-center text-[10px]">
                        ✓
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#68727D] leading-relaxed">
                    {tText('Dành cho du học đại học, sau đại học hoặc làm việc trong môi trường học thuật.', 'For higher education undergraduate, postgraduate degrees, or professional registration.')}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setTestType('general')}
                  className={cn(
                    'p-4 rounded-xl border text-left transition-all focus:outline-none',
                    testType === 'general'
                      ? 'border-[#28665F] bg-[#EAF3F1] ring-1 ring-[#28665F]'
                      : 'border-[#E3E7EB] bg-white hover:border-[#CBD5E1]'
                  )}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-sm text-[#20272E]">General Training</span>
                    {testType === 'general' && (
                      <span className="w-4 h-4 rounded-full bg-[#28665F] text-white flex items-center justify-center text-[10px]">
                        ✓
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#68727D] leading-relaxed">
                    {tText('Dành cho mục đích định cư, làm việc hoặc học tập tại các trường nghề.', 'For migration, secondary education, or vocational training in English-speaking nations.')}
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: CURRENT LEVEL */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-[#20272E]">{tText('Trình độ hiện tại của bạn', 'Your Current IELTS Level')}</h2>
                <p className="text-xs text-[#68727D] mt-1">
                  {tText('Chọn thông tin phù hợp nhất để hệ thống đề xuất xuất phát điểm.', 'Select the option that best reflects your starting proficiency.')}
                </p>
              </div>

              <div className="space-y-2.5 pt-1">
                {[
                  { id: 'beginner', label: tText('Chưa từng học IELTS', 'New to IELTS'), desc: tText('Cần bắt đầu từ nền tảng ngữ pháp và từ vựng cốt lõi', 'Start with essential academic grammar and foundation vocabulary') },
                  { id: 'intermediate', label: tText('Đã học nhưng chưa từng thi', 'Studied, never tested'), desc: tText('Đã quen với các dạng bài thi nhưng chưa biết rõ điểm', 'Familiar with test format but no verified official score yet') },
                  { id: 'had_taken_test', label: tText('Đã từng thi thật hoặc thi thử', 'Taken a test previously'), desc: tText('Tự khai báo điểm Overall và từng kỹ năng', 'Enter self-reported band scores for Overall and sub-skills') },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCurrentLevel(item.id as CurrentLevel)}
                    className={cn(
                      'w-full p-3.5 rounded-xl border text-left transition-all focus:outline-none flex items-center justify-between',
                      currentLevel === item.id
                        ? 'border-[#28665F] bg-[#EAF3F1]'
                        : 'border-[#E3E7EB] bg-white hover:border-[#CBD5E1]'
                    )}
                  >
                    <div>
                      <p className="text-sm font-bold text-[#20272E]">{item.label}</p>
                      <p className="text-xs text-[#68727D] mt-0.5">{item.desc}</p>
                    </div>
                    {currentLevel === item.id && (
                      <span className="w-4 h-4 rounded-full bg-[#28665F] text-white flex items-center justify-center text-[10px] shrink-0">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {currentLevel === 'had_taken_test' && (
                <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E3E7EB] space-y-3 mt-4">
                  <span className="text-xs font-semibold text-[#20272E] block">
                    {tText('Nhập điểm tự khai báo (tham khảo)', 'Self-reported Band Scores')}
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <Input
                      label="Listening"
                      type="number"
                      step="0.5"
                      min="1"
                      max="9"
                      value={reportedScores.listening}
                      onChange={(e) =>
                        setReportedScores({ ...reportedScores, listening: Number(e.target.value) })
                      }
                    />
                    <Input
                      label="Reading"
                      type="number"
                      step="0.5"
                      min="1"
                      max="9"
                      value={reportedScores.reading}
                      onChange={(e) =>
                        setReportedScores({ ...reportedScores, reading: Number(e.target.value) })
                      }
                    />
                    <Input
                      label="Writing"
                      type="number"
                      step="0.5"
                      min="1"
                      max="9"
                      value={reportedScores.writing}
                      onChange={(e) =>
                        setReportedScores({ ...reportedScores, writing: Number(e.target.value) })
                      }
                    />
                    <Input
                      label="Speaking"
                      type="number"
                      step="0.5"
                      min="1"
                      max="9"
                      value={reportedScores.speaking}
                      onChange={(e) =>
                        setReportedScores({ ...reportedScores, speaking: Number(e.target.value) })
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: TARGET BAND & TARGET DATE */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-[#20272E]">{tText('Mục tiêu IELTS của bạn', 'Your Target Band Score')}</h2>
                <p className="text-xs text-[#68727D] mt-1">
                  {tText('Chọn mức Band điểm bạn muốn hướng tới trong đợt học này.', 'Choose the target band score you want to achieve.')}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#20272E]">{tText('Band điểm mục tiêu', 'Target Band')}</label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {[5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5].map((band) => (
                    <button
                      key={band}
                      type="button"
                      onClick={() => setTargetBand(band)}
                      className={cn(
                        'py-3 rounded-xl border text-sm font-bold transition-all focus:outline-none',
                        targetBand === band
                          ? 'border-[#28665F] bg-[#28665F] text-white shadow-xs'
                          : 'border-[#E3E7EB] bg-white text-[#20272E] hover:border-[#CBD5E1]'
                      )}
                    >
                      {band.toFixed(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <Input
                  label={tText('Dự kiến ngày thi (tùy chọn)', 'Target Exam Date (optional)')}
                  type="date"
                  value={targetExamDate}
                  onChange={(e) => setTargetExamDate(e.target.value)}
                  helperText={tText('Có thể bỏ trống nếu bạn chưa có kế hoạch thi cụ thể', 'Can be left blank if you have not booked an exam date yet')}
                />
              </div>
            </div>
          )}

          {/* STEP 4: STUDY SCHEDULE */}
          {currentStep === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-[#20272E]">{tText('Lịch học & Kỹ năng ưu tiên', 'Study Routine & Priority Skills')}</h2>
                <p className="text-xs text-[#68727D] mt-1">
                  {tText('Thiết lập thời gian học phù hợp với quỹ thời gian của bạn.', 'Establish a consistent schedule tailored to your daily availability.')}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#20272E]">{tText('Số ngày học mỗi tuần', 'Study Days Per Week')}</label>
                <div className="grid grid-cols-4 gap-2">
                  {[3, 4, 5, 6].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setDaysPerWeek(days)}
                      className={cn(
                        'py-2.5 rounded-lg border text-xs font-bold transition-all focus:outline-none',
                        daysPerWeek === days
                          ? 'border-[#28665F] bg-[#EAF3F1] text-[#28665F]'
                          : 'border-[#E3E7EB] bg-white text-[#68727D] hover:border-[#CBD5E1]'
                      )}
                    >
                      {days} {tText('buổi / tuần', 'days / week')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#20272E]">{tText('Thời lượng mỗi buổi học', 'Session Duration')}</label>
                <div className="grid grid-cols-4 gap-2">
                  {[30, 45, 60, 90].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setMinutesPerSession(mins)}
                      className={cn(
                        'py-2.5 rounded-lg border text-xs font-bold transition-all focus:outline-none',
                        minutesPerSession === mins
                          ? 'border-[#28665F] bg-[#EAF3F1] text-[#28665F]'
                          : 'border-[#E3E7EB] bg-white text-[#68727D] hover:border-[#CBD5E1]'
                      )}
                    >
                      {mins} {tText('phút', 'mins')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <label className="text-xs font-bold text-[#20272E]">
                  {tText('Kỹ năng muốn ưu tiên cải thiện (chọn một hoặc nhiều)', 'Priority focus skills (select one or more)')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'listening', name: tText('Listening (Nghe)', 'Listening') },
                    { id: 'reading', name: tText('Reading (Đọc)', 'Reading') },
                    { id: 'writing', name: tText('Writing (Viết)', 'Writing') },
                    { id: 'speaking', name: tText('Speaking (Nói)', 'Speaking') },
                  ].map((s) => {
                    const isSelected = prioritySkills.includes(s.id as SkillType)
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggleSkillPriority(s.id as SkillType)}
                        className={cn(
                          'p-3 rounded-lg border text-xs font-medium text-left flex items-center justify-between transition-colors focus:outline-none',
                          isSelected
                            ? 'border-[#28665F] bg-[#EAF3F1] text-[#28665F]'
                            : 'border-[#E3E7EB] bg-white text-[#20272E] hover:border-[#CBD5E1]'
                        )}
                      >
                        <span>{s.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#28665F]" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: CONFIRMATION SUMMARY */}
          {currentStep === 5 && (
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <NoriIllustration pose="celebrate" size="sm" animate={false} />
                <div>
                  <h2 className="text-xl font-bold text-[#20272E]">{tText('Sẵn sàng bắt đầu lộ trình!', 'Ready to Launch Your Path!')}</h2>
                  <p className="text-xs text-[#68727D] mt-1">
                    {tText('Kiểm tra lại mục tiêu và bắt đầu hành trình nâng band cùng Nori.', 'Verify your parameters and embark on your IELTS goal.')}
                  </p>
                </div>
              </div>

              <div className="space-y-3 p-4 rounded-xl bg-[#F7F8FA] border border-[#E3E7EB] text-xs">
                <div className="flex justify-between py-1.5 border-b border-[#E3E7EB]">
                  <span className="text-[#68727D]">{tText('Loại bài thi:', 'Exam Type:')}</span>
                  <span className="font-bold text-[#20272E]">
                    {testType === 'academic' ? 'IELTS Academic' : 'IELTS General Training'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#E3E7EB]">
                  <span className="text-[#68727D]">{tText('Band mục tiêu:', 'Target Band:')}</span>
                  <span className="font-bold text-[#28665F] text-sm">
                    Band {targetBand.toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#E3E7EB]">
                  <span className="text-[#68727D]">{tText('Thời lượng cam kết:', 'Study Commitment:')}</span>
                  <span className="font-bold text-[#20272E]">
                    {daysPerWeek} {tText('buổi / tuần', 'days / week')} ({minutesPerSession} {tText('phút/buổi', 'mins/day')})
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-[#68727D]">{tText('Kỹ năng trọng tâm:', 'Priority Skills:')}</span>
                  <span className="font-bold text-[#20272E] uppercase">
                    {prioritySkills.join(', ')}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#EAF3F1] border border-[#28665F]/20 text-xs text-[#20272E] space-y-1">
                <span className="font-bold text-[#28665F] block">{tText('Đánh giá đầu vào Placement Test', 'Diagnostic Placement Test')}</span>
                <p className="text-[#68727D]">
                  {tText(
                    'Bạn có thể làm bài kiểm tra nhanh (15 phút) ngay bây giờ để hệ thống đo lường chính xác năng lực, hoặc bỏ qua để vào thẳng bảng tin học tập.',
                    'You may take the quick 15-minute diagnostic now for accurate level calibration, or proceed straight to your dashboard.'
                  )}
                </p>
              </div>
            </div>
          )}

          {/* STEP CONTROLS */}
          <div className="flex items-center justify-between pt-6 mt-6 border-t border-[#E3E7EB]">
            {currentStep > 1 ? (
              <Button
                variant="outline"
                size="md"
                onClick={handleBack}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                {tText('Quay lại', 'Back')}
              </Button>
            ) : (
              <div />
            )}

            {currentStep < totalSteps ? (
              <Button
                variant="primary"
                size="md"
                onClick={handleNext}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {tText('Tiếp tục', 'Continue')}
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="md"
                  isLoading={isLoading}
                  onClick={() => handleFinish(false)}
                >
                  {tText('Vào Dashboard', 'To Dashboard')}
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  isLoading={isLoading}
                  onClick={() => handleFinish(true)}
                >
                  {tText('Làm Placement Test', 'Take Placement Test')}
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="text-center text-xs text-[#9AA4AF] pb-4">
        {tText('IELTS Learning Platform — Thiết kế tối ưu cho học tập tập trung', 'IELTS Learning Platform — Engineered for focused high-yield mastery')}
      </div>
    </div>
  )
}
