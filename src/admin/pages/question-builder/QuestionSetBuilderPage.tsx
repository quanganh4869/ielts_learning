import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  FileText,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Play,
  RotateCcw,
  Save,
  Download,
  Copy,
  Trash2,
  Plus,
  Eye,
  Layers,
  Check,
  ChevronRight,
  ChevronDown,
  Volume2,
  BookOpen,
  Headphones,
  PenTool,
  Mic,
  Monitor,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Clock,
  ShieldCheck,
  FileCheck,
} from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { PageHeader } from '../../components/PageHeader'
import { StatusBadge } from '../../components/StatusBadge'
import {
  QuestionSet,
  BuilderSection,
  BuilderQuestionGroup,
  BuilderQuestionItem,
  BuilderPassage,
  BuilderAsset,
  ValidationReport,
  BuilderQuestionType,
} from '../../types/questionBuilder'
import {
  parseFromJSON,
  parseFromCSV,
  parseFromStructuredText,
  parseWithAI,
  generateCSVTemplate,
  generateJSONTemplate,
} from '../../services/questionParser'
import { validateQuestionSet } from '../../services/questionValidator'
import { questionSetService } from '../../services/questionSetService'
import { cn } from '@/utils/cn'

type BuilderTab = 'import' | 'outline' | 'editor' | 'answer_matrix' | 'assets' | 'validation' | 'preview'

export const QuestionSetBuilderPage: React.FC = () => {
  const { testId } = useParams<{ testId: string }>()
  const navigate = useNavigate()

  // Main QuestionSet state
  const [currentTest, setCurrentTest] = useState<QuestionSet | null>(null)
  const [activeTab, setActiveTab] = useState<BuilderTab>('outline')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveToast, setSaveToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Selection & Navigation states inside Builder
  const [selectedSectionName, setSelectedSectionName] = useState<'Listening' | 'Reading' | 'Writing' | 'Speaking'>('Reading')
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([])

  // Import State
  const [importMethod, setImportMethod] = useState<'upload' | 'paste' | 'ai'>('upload')
  const [pastedText, setPastedText] = useState('')
  const [isParsing, setIsParsing] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)
  const [parseSuccessInfo, setParseSuccessInfo] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Validation report
  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null)

  // Preview simulator states
  const [previewActiveSection, setPreviewActiveSection] = useState<'Listening' | 'Reading' | 'Writing' | 'Speaking'>('Reading')
  const [previewFlagged, setPreviewFlagged] = useState<number[]>([])

  // Load existing test or initialize a brand new test
  useEffect(() => {
    const loadTest = async () => {
      setIsLoading(true)
      try {
        if (testId) {
          const found = await questionSetService.getById(testId)
          if (found) {
            setCurrentTest(found)
            if (found.sections.length > 0) {
              setSelectedSectionName(found.sections[0].name)
              if (found.sections[0].groups.length > 0) {
                setSelectedGroupId(found.sections[0].groups[0].id)
              }
            }
          } else {
            initNewTest()
          }
        } else {
          initNewTest()
        }
      } catch (err) {
        console.error(err)
        initNewTest()
      } finally {
        setIsLoading(false)
      }
    }
    loadTest()
  }, [testId])

  const initNewTest = () => {
    const defaultTest: QuestionSet = {
      id: `test-set-${Date.now().toString().slice(-6)}`,
      title: 'Đề thi IELTS Academic mới',
      code: `IELTS-SET-${Date.now().toString().slice(-4)}`,
      type: 'academic',
      packageCategory: 'four_skills',
      difficulty: 'Standard',
      skills: ['reading', 'listening'],
      description: 'Bộ đề thi do biên soạn viên IELTS tạo thông qua Question Set Builder.',
      sourceName: 'IELTS Learning Platform Internal Authoring',
      rightsStatus: 'custom_equivalent',
      rightsNotice: 'Đề thi tự biên soạn tương đương chuẩn bài thi quốc tế.',
      isFullMock: false,
      status: 'draft',
      version: 1,
      totalDurationMinutes: 60,
      totalQuestions: 0,
      sections: [
        {
          id: 'sec-reading-1',
          name: 'Reading',
          durationMinutes: 60,
          totalQuestions: 0,
          passages: [
            {
              id: 'passage-1',
              order: 1,
              title: 'Reading Passage 1: The Evolution of Renewable Energy',
              paragraphs: [
                'In the early twenty-first century, renewable technology experienced exponential efficiency advancements.',
                'Solar photovoltaic cell efficiency rose from 12% in 2005 to over 24% in modern commercial installations.',
                'Wind turbine blade aerodynamics reduced levelized energy costs by 70% across coastal biomes.',
              ],
              wordCount: 650,
              questionRange: [1, 5],
            },
          ],
          groups: [
            {
              id: 'grp-read-1',
              sectionName: 'Reading',
              passageId: 'passage-1',
              title: 'Questions 1-3: True / False / Not Given',
              instructions: 'Do the following statements agree with the information in Reading Passage 1?',
              questionRange: [1, 3],
              questionType: 'true_false_not_given',
              questions: [
                {
                  id: 'q-read-1',
                  order: 1,
                  type: 'true_false_not_given',
                  prompt: 'Solar cell efficiency doubled between 2005 and modern installations.',
                  options: ['A) TRUE', 'B) FALSE', 'C) NOT GIVEN'],
                  correctAnswer: 'A',
                  acceptableAnswers: ['TRUE'],
                  explanation: 'Paragraph 2 confirms it rose from 12% to over 24% (a twofold increase).',
                  points: 1,
                  status: 'valid',
                  sourceConfidence: 'manual',
                },
                {
                  id: 'q-read-2',
                  order: 2,
                  type: 'true_false_not_given',
                  prompt: 'Wind energy installations are prohibited in coastal ecosystems.',
                  options: ['A) TRUE', 'B) FALSE', 'C) NOT GIVEN'],
                  correctAnswer: 'B',
                  acceptableAnswers: ['FALSE'],
                  explanation: 'Paragraph 3 notes energy costs were reduced in coastal biomes, proving they are deployed there.',
                  points: 1,
                  status: 'valid',
                  sourceConfidence: 'manual',
                },
                {
                  id: 'q-read-3',
                  order: 3,
                  type: 'true_false_not_given',
                  prompt: 'Hydropower remains the cheapest renewable source globally.',
                  options: ['A) TRUE', 'B) FALSE', 'C) NOT GIVEN'],
                  correctAnswer: 'C',
                  acceptableAnswers: ['NOT GIVEN'],
                  explanation: 'No mention of hydropower costs in the text.',
                  points: 1,
                  status: 'valid',
                  sourceConfidence: 'manual',
                },
              ],
            },
          ],
        },
      ],
      assets: [],
      author: 'Lead Admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setCurrentTest(defaultTest)
    setSelectedSectionName('Reading')
    setSelectedGroupId('grp-read-1')
  }

  // Active section & group helpers
  const currentSection = useMemo(() => {
    return currentTest?.sections.find((s) => s.name === selectedSectionName) || currentTest?.sections[0]
  }, [currentTest, selectedSectionName])

  const currentGroup = useMemo(() => {
    return currentSection?.groups.find((g) => g.id === selectedGroupId) || currentSection?.groups[0]
  }, [currentSection, selectedGroupId])

  // Run validation whenever test changes or when clicking Validate
  const runValidation = () => {
    if (!currentTest) return
    const report = validateQuestionSet(currentTest)
    setValidationReport(report)
    return report
  }

  // Toast notification helper
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setSaveToast({ message, type })
    setTimeout(() => setSaveToast(null), 3500)
  }

  // Save draft
  const handleSaveDraft = async () => {
    if (!currentTest) return
    setIsSaving(true)
    try {
      const saved = await questionSetService.save(currentTest)
      setCurrentTest(saved)
      runValidation()
      showToast('Đã lưu bản nháp thành công vào hệ thống!', 'success')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Lỗi khi lưu đề thi', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  // Publish test
  const handlePublish = async () => {
    if (!currentTest) return
    setIsSaving(true)
    try {
      const result = await questionSetService.publish(currentTest.id)
      setValidationReport(result.report)
      if (result.success && result.updatedSet) {
        setCurrentTest(result.updatedSet)
        showToast('Đã xuất bản thành công! Học viên có thể làm bài ngay tại Exam Workspace.', 'success')
      } else {
        setActiveTab('validation')
        showToast('Bộ đề chưa vượt qua kiểm tra toàn vẹn. Vui lòng khắc phục các lỗi trước khi xuất bản.', 'error')
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Lỗi khi xuất bản', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  // Duplicate test
  const handleDuplicate = async () => {
    if (!currentTest) return
    try {
      const copy = await questionSetService.duplicate(currentTest.id)
      showToast(`Đã nhân bản thành công: ${copy.code}`, 'success')
      navigate(`/admin/assessments/builder/${copy.id}`)
    } catch (err) {
      showToast('Lỗi khi nhân bản bộ đề', 'error')
    }
  }

  // Export JSON
  const handleExportJSON = () => {
    if (!currentTest) return
    const jsonStr = JSON.stringify(currentTest, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${currentTest.code || 'IELTS-TEST'}-export.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Đã tải xuống file JSON bộ đề!', 'success')
  }

  // Download Templates
  const handleDownloadCSVTemplate = () => {
    const csv = generateCSVTemplate()
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ielts_question_import_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDownloadJSONTemplate = () => {
    const jsonStr = generateJSONTemplate()
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ielts_question_import_template.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  // =========================================================================
  // IMPORT PROCESSORS
  // =========================================================================
  const applyImportResult = (res: any) => {
    if (!res.success || res.sections.length === 0) {
      setParseError(res.errors.join('; ') || 'Không thể trích xuất câu hỏi từ nội dung được cung cấp.')
      setParseSuccessInfo(null)
      return
    }

    if (!currentTest) return

    const updated: QuestionSet = {
      ...currentTest,
      title: res.testTitle || currentTest.title,
      code: res.testCode || currentTest.code,
      type: res.testType || currentTest.type,
      sections: res.sections,
      totalQuestions: res.sections.reduce((acc: number, s: BuilderSection) => {
        return acc + s.groups.reduce((gAcc, g) => gAcc + g.questions.length, 0)
      }, 0),
      updatedAt: new Date().toISOString(),
    }

    setCurrentTest(updated)
    setParseError(null)
    setParseSuccessInfo(
      `Phân tích thành công ${updated.totalQuestions} câu hỏi thuộc ${res.sections.length} phần thi! ${
        res.inferredFieldCount > 0 ? `(${res.inferredFieldCount} trường do AI suy luận đã được đánh dấu)` : ''
      }`
    )

    if (res.sections.length > 0) {
      setSelectedSectionName(res.sections[0].name)
      if (res.sections[0].groups.length > 0) {
        setSelectedGroupId(res.sections[0].groups[0].id)
      }
    }

    // Run integrity validation immediately
    setTimeout(() => {
      validateQuestionSet(updated)
    }, 100)
  }

  // Handle File Upload (JSON or CSV)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsParsing(true)
    setParseError(null)
    setParseSuccessInfo(null)

    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const content = evt.target?.result as string
        if (file.name.endsWith('.json')) {
          const res = parseFromJSON(content)
          applyImportResult(res)
        } else if (file.name.endsWith('.csv') || file.name.endsWith('.txt') || file.name.endsWith('.tsv')) {
          const res = parseFromCSV(content)
          applyImportResult(res)
        } else {
          setParseError('Định dạng file không được hỗ trợ. Vui lòng sử dụng file .json hoặc .csv.')
        }
      } catch (err) {
        setParseError(`Lỗi đọc file: ${err instanceof Error ? err.message : String(err)}`)
      } finally {
        setIsParsing(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    }

    reader.onerror = () => {
      setParseError('Không thể đọc file từ thiết bị.')
      setIsParsing(false)
    }

    reader.readAsText(file)
  }

  // Handle Structured Text Paste
  const handleProcessPastedText = () => {
    if (!pastedText.trim()) {
      setParseError('Vui lòng dán nội dung văn bản đề thi.')
      return
    }

    setIsParsing(true)
    setParseError(null)
    setParseSuccessInfo(null)

    try {
      const res = parseFromStructuredText(pastedText)
      applyImportResult(res)
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Lỗi phân tích cú pháp văn bản')
    } finally {
      setIsParsing(false)
    }
  }

  // Handle AI Document Extraction
  const handleProcessAI = async () => {
    if (!pastedText.trim()) {
      setParseError('Vui lòng dán văn bản thô hoặc tài liệu đề thi cần AI trích xuất.')
      return
    }

    setIsParsing(true)
    setParseError(null)
    setParseSuccessInfo(null)

    try {
      const res = await parseWithAI(pastedText)
      applyImportResult(res)
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Lỗi phân tích bằng AI')
    } finally {
      setIsParsing(false)
    }
  }

  // =========================================================================
  // GROUP & QUESTION EDITING HANDLERS
  // =========================================================================
  const updateQuestionInGroup = (groupId: string, questionId: string, partial: Partial<BuilderQuestionItem>) => {
    if (!currentTest) return

    const updatedSections = currentTest.sections.map((sec) => {
      const updatedGroups = sec.groups.map((grp) => {
        if (grp.id !== groupId) return grp
        const updatedQuestions = grp.questions.map((q) => {
          if (q.id !== questionId) return q
          return { ...q, ...partial }
        })
        return { ...grp, questions: updatedQuestions }
      })
      return { ...sec, groups: updatedGroups }
    })

    setCurrentTest({ ...currentTest, sections: updatedSections })
  }

  const addNewQuestionToGroup = (groupId: string) => {
    if (!currentTest) return

    const updatedSections = currentTest.sections.map((sec) => {
      const updatedGroups = sec.groups.map((grp) => {
        if (grp.id !== groupId) return grp
        const newOrder = grp.questions.length > 0 ? Math.max(...grp.questions.map((q) => q.order)) + 1 : 1
        const newQ: BuilderQuestionItem = {
          id: `q-${Date.now().toString().slice(-6)}`,
          order: newOrder,
          type: grp.questionType,
          prompt: 'Nhập câu hỏi mới...',
          options: grp.questionType === 'multiple_choice' ? ['A) ', 'B) ', 'C) ', 'D) '] : [],
          correctAnswer: '',
          points: 1,
          status: 'needs_review',
          sourceConfidence: 'manual',
        }
        return {
          ...grp,
          questionRange: [grp.questionRange[0], Math.max(grp.questionRange[1], newOrder)] as [number, number],
          questions: [...grp.questions, newQ],
        }
      })
      return { ...sec, groups: updatedGroups }
    })

    setCurrentTest({ ...currentTest, sections: updatedSections })
  }

  const deleteQuestionFromGroup = (groupId: string, questionId: string) => {
    if (!currentTest) return

    const updatedSections = currentTest.sections.map((sec) => {
      const updatedGroups = sec.groups.map((grp) => {
        if (grp.id !== groupId) return grp
        return {
          ...grp,
          questions: grp.questions.filter((q) => q.id !== questionId),
        }
      })
      return { ...sec, groups: updatedGroups }
    })

    setCurrentTest({ ...currentTest, sections: updatedSections })
  }

  // Bulk action on selected questions
  const handleBulkChangeType = (newType: BuilderQuestionType) => {
    if (!currentGroup || selectedQuestionIds.length === 0) return

    selectedQuestionIds.forEach((qId) => {
      updateQuestionInGroup(currentGroup.id, qId, { type: newType })
    })
    showToast(`Đã đổi dạng bài cho ${selectedQuestionIds.length} câu hỏi`, 'success')
  }

  const handleBulkDelete = () => {
    if (!currentGroup || selectedQuestionIds.length === 0) return
    if (!window.confirm(`Bạn có chắc muốn xóa ${selectedQuestionIds.length} câu hỏi đã chọn?`)) return

    selectedQuestionIds.forEach((qId) => {
      deleteQuestionFromGroup(currentGroup.id, qId)
    })
    setSelectedQuestionIds([])
    showToast('Đã xóa các câu hỏi đã chọn', 'success')
  }

  if (isLoading || !currentTest) {
    return (
      <div className="p-8 text-center text-[#68727D]">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#28665F] mb-3" />
        <p className="font-bold text-sm">Đang tải Question Set Builder...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* =========================================================================
          BUILDER HEADER BAR (EDTECH NUNITO STYLING)
         ========================================================================= */}
      <div className="bg-white rounded-3xl border border-[#E3E7EB] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Title & Metadata */}
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-black uppercase tracking-wider text-[#28665F] bg-[#EAF4EE] px-2.5 py-0.5 rounded-lg border border-[#28665F]/20">
                Question Set Builder
              </span>
              <StatusBadge status={currentTest.status as any} />
              <span className="text-xs font-mono font-bold text-[#68727D]">
                v{currentTest.version}.0
              </span>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                value={currentTest.title}
                onChange={(e) => setCurrentTest({ ...currentTest, title: e.target.value })}
                className="text-xl sm:text-2xl font-black text-[#20272E] border-none bg-transparent hover:bg-[#F2F4F7] focus:bg-white focus:ring-2 focus:ring-[#28665F]/30 rounded-xl px-2 py-0.5 transition-all outline-none"
                placeholder="Tên bộ đề IELTS..."
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-[#68727D] font-medium px-2">
              <span className="font-mono font-bold text-[#20272E]">{currentTest.code}</span>
              <span>•</span>
              <span className="capitalize font-semibold text-[#28665F]">{currentTest.type} IELTS</span>
              <span>•</span>
              <span>{currentTest.sections.length} Sections</span>
              <span>•</span>
              <span className="font-bold text-[#20272E]">
                {currentTest.sections.reduce((acc, s) => acc + s.groups.reduce((gAcc, g) => gAcc + g.questions.length, 0), 0)} câu hỏi
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDuplicate}
              className="font-bold text-xs"
              leftIcon={<Copy className="w-3.5 h-3.5" />}
              title="Nhân bản bộ đề"
            >
              Nhân bản
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportJSON}
              className="font-bold text-xs"
              leftIcon={<Download className="w-3.5 h-3.5" />}
              title="Tải về file JSON"
            >
              Xuất JSON
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                runValidation()
                setActiveTab('preview')
              }}
              className="font-bold text-xs"
              leftIcon={<Eye className="w-3.5 h-3.5" />}
            >
              Xem trước thi
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="font-bold text-xs"
              leftIcon={<Save className="w-3.5 h-3.5" />}
            >
              {isSaving ? 'Đang lưu...' : 'Lưu nháp'}
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handlePublish}
              disabled={isSaving}
              className="font-black text-xs shadow-xs"
              rightIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Xuất bản bộ đề
            </Button>
          </div>
        </div>

        {/* Save Toast Feedback */}
        {saveToast && (
          <div
            className={cn(
              'p-3 rounded-2xl text-xs font-bold flex items-center justify-between animate-in fade-in',
              saveToast.type === 'success'
                ? 'bg-[#EAF4EE] text-[#1E4D48] border border-[#28665F]/20'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            )}
          >
            <span>{saveToast.message}</span>
            <button onClick={() => setSaveToast(null)} className="text-2xs underline">
              Đóng
            </button>
          </div>
        )}

        {/* STEP / MODE TABS */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-[#E3E7EB] text-xs font-bold text-[#68727D]">
          {[
            { id: 'import', label: '1. Nhập & Bulk Import', icon: Upload },
            { id: 'outline', label: '2. Cấu trúc & Phân nhóm', icon: Layers },
            { id: 'editor', label: '3. Biên tập theo nhóm', icon: PenTool },
            { id: 'answer_matrix', label: '4. Ma trận Đáp án', icon: CheckCircle2 },
            { id: 'assets', label: '5. Quản lý Tài nguyên', icon: BookOpen },
            { id: 'validation', label: '6. Báo cáo Toàn vẹn', icon: ShieldCheck },
            { id: 'preview', label: '7. Xem trước phòng thi', icon: Monitor },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'validation') runValidation()
                  setActiveTab(tab.id as BuilderTab)
                }}
                className={cn(
                  'flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap',
                  isActive
                    ? 'bg-[#28665F] text-white shadow-xs font-black'
                    : 'hover:bg-[#F2F4F7] hover:text-[#20272E]'
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* =========================================================================
          TAB 1: BULK IMPORT & DATA SOURCES
         ========================================================================= */}
      {activeTab === 'import' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <Card className="p-6 rounded-3xl bg-white border border-[#E3E7EB] space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#E3E7EB]">
                <div>
                  <h3 className="text-base font-black text-[#20272E]">Phương thức nhập câu hỏi hàng loạt</h3>
                  <p className="text-xs text-[#68727D] mt-0.5">
                    Hỗ trợ nhập 40 câu Listening, 40 câu Reading, Writing Tasks hoặc câu hỏi riêng lẻ một lần.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setImportMethod('upload')}
                    className={cn(
                      'px-3 py-1.5 rounded-xl text-xs font-bold transition-all',
                      importMethod === 'upload' ? 'bg-[#28665F] text-white' : 'bg-[#F2F4F7] text-[#68727D]'
                    )}
                  >
                    Tải file (.xlsx/.csv/.json)
                  </button>
                  <button
                    type="button"
                    onClick={() => setImportMethod('paste')}
                    className={cn(
                      'px-3 py-1.5 rounded-xl text-xs font-bold transition-all',
                      importMethod === 'paste' ? 'bg-[#28665F] text-white' : 'bg-[#F2F4F7] text-[#68727D]'
                    )}
                  >
                    Dán văn bản có cấu trúc
                  </button>
                  <button
                    type="button"
                    onClick={() => setImportMethod('ai')}
                    className={cn(
                      'px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1',
                      importMethod === 'ai' ? 'bg-[#28665F] text-white' : 'bg-[#FFF9EE] text-[#D97706]'
                    )}
                  >
                    <Sparkles className="w-3 h-3" />
                    AI Document Assistant
                  </button>
                </div>
              </div>

              {/* Upload File Zone */}
              {importMethod === 'upload' && (
                <div className="space-y-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#28665F]/30 hover:border-[#28665F] bg-[#FAFBFB] hover:bg-[#EAF4EE]/40 p-8 rounded-3xl text-center cursor-pointer transition-all space-y-3"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-[#EAF4EE] text-[#28665F] flex items-center justify-center mx-auto shadow-2xs">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-sm font-black text-[#20272E] block">
                        Kéo thả file vào đây hoặc nhấn để chọn file
                      </span>
                      <span className="text-xs text-[#68727D] block mt-1">
                        Hỗ trợ định dạng JSON chuẩn khảo thí (.json) hoặc bảng tính CSV (.csv, .tsv)
                      </span>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json,.csv,.tsv,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold text-[#68727D] px-2">
                    <span>Cần chuẩn bị file trước?</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleDownloadCSVTemplate}
                        className="text-[#28665F] hover:underline flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" /> Tải Template CSV mẫu
                      </button>
                      <button
                        type="button"
                        onClick={handleDownloadJSONTemplate}
                        className="text-[#28665F] hover:underline flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" /> Tải Schema JSON mẫu
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Paste Structured Text */}
              {importMethod === 'paste' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#20272E] block">
                      Dán nội dung văn bản biên soạn (theo cú pháp SECTION / PASSAGE / GROUP / 1. Câu hỏi):
                    </label>
                    <textarea
                      rows={12}
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      placeholder={`SECTION: Reading\nPASSAGE: The History of Tea\nParagraph 1: Tea cultivation originated millennia ago...\n\nGROUP: Questions 1-3 (True/False/Not Given)\nINSTRUCTIONS: Do the following statements agree with the text?\n1. Tea was discovered by accident.\nA) TRUE\nB) FALSE\nC) NOT GIVEN\nANSWER: A\nEXPLANATION: Paragraph 1 states leaves blew into boiling water.`}
                      className="w-full p-4 text-xs font-mono rounded-2xl border border-[#E3E7EB] bg-[#FAFBFB] focus:bg-white focus:ring-2 focus:ring-[#28665F]/30 outline-none leading-relaxed"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#68727D]">
                      Hệ thống tự động phát hiện số thứ tự, lựa chọn A/B/C/D, đáp án và lời giải thích.
                    </span>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleProcessPastedText}
                      disabled={isParsing || !pastedText.trim()}
                      className="font-bold"
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      {isParsing ? 'Đang phân tích...' : 'Phân tích & Nạp vào đề'}
                    </Button>
                  </div>
                </div>
              )}

              {/* AI Assistant Extraction */}
              {importMethod === 'ai' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#FFF9EE] border border-[#F59E0B]/30 text-xs text-[#92400E] space-y-1">
                    <div className="flex items-center gap-2 font-black">
                      <Sparkles className="w-4 h-4 text-[#D97706]" />
                      <span>Quy tắc bảo toàn dữ liệu khi dùng AI:</span>
                    </div>
                    <p className="font-medium">
                      AI chỉ bóc tách cấu trúc câu hỏi và lựa chọn có sẵn trong văn bản. Hệ thống <strong>không bao giờ tự bịa đáp án</strong>. Mọi trường suy luận đều được đánh dấu &quot;ai_inferred&quot; để admin đối soát.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#20272E] block">
                      Dán tài liệu hoặc câu hỏi thô cần AI xử lý:
                    </label>
                    <textarea
                      rows={10}
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      placeholder="Dán các câu hỏi từ đề thi PDF/Word vào đây..."
                      className="w-full p-4 text-xs font-sans rounded-2xl border border-[#E3E7EB] bg-[#FAFBFB] focus:bg-white focus:ring-2 focus:ring-[#28665F]/30 outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#68727D]">
                      AI Document Parser tự động nhận dạng định dạng câu hỏi và trích xuất.
                    </span>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleProcessAI}
                      disabled={isParsing || !pastedText.trim()}
                      className="font-black bg-[#D97706] hover:bg-[#B45309]"
                      rightIcon={<Sparkles className="w-4 h-4" />}
                    >
                      {isParsing ? 'AI đang bóc tách...' : 'AI Bóc tách & Khớp cấu trúc'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Feedback Alert */}
              {parseError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-3">
                  <XCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
                  <div>
                    <strong className="block">Lỗi phân tích tài liệu:</strong>
                    <span>{parseError}</span>
                  </div>
                </div>
              )}

              {parseSuccessInfo && (
                <div className="p-4 rounded-2xl bg-[#EAF4EE] border border-[#28665F]/30 text-xs text-[#1E4D48] flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-[#16A34A] mt-0.5" />
                  <div>
                    <strong className="block">Nhập dữ liệu thành công!</strong>
                    <span>{parseSuccessInfo}</span>
                    <div className="mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveTab('editor')}
                        className="font-bold text-xs bg-white"
                        rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                      >
                        Chuyển sang tab Biên tập
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Right Info Column */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="p-6 rounded-3xl bg-[#FAFBFB] border border-[#E3E7EB] space-y-4 text-xs">
              <h4 className="text-sm font-black text-[#20272E]">Hướng dẫn nhập đề thi chuẩn</h4>
              <div className="space-y-3 text-[#4B5563] font-medium leading-relaxed">
                <div className="p-3 rounded-2xl bg-white border border-[#E3E7EB] space-y-1">
                  <strong className="text-[#20272E] block">1. Đề thi 4 kỹ năng (Full Mock)</strong>
                  <p className="text-[11px] text-[#68727D]">
                    Listening: 40 câu (4 sections) • Reading: 40 câu (3 passages) • Writing: 2 tasks • Speaking: 3 parts.
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-[#E3E7EB] space-y-1">
                  <strong className="text-[#20272E] block">2. Đề luyện theo dạng bài (Sample Tasks)</strong>
                  <p className="text-[11px] text-[#68727D]">
                    Nhập từ 5 đến 15 câu theo một kỹ năng cụ thể (ví dụ chỉ phần True/False/Not Given).
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-[#E3E7EB] space-y-1">
                  <strong className="text-[#20272E] block">3. Answer Key đa phương án</strong>
                  <p className="text-[11px] text-[#68727D]">
                    Với câu điền từ, có thể khai báo nhiều cách viết đúng cách nhau bằng dấu gạch đứng (ví dụ: centre | center).
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: OUTLINE & HIERARCHICAL GROUPS
         ========================================================================= */}
      {activeTab === 'outline' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-12 space-y-6">
            <Card className="p-6 rounded-3xl bg-white border border-[#E3E7EB] space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E3E7EB]">
                <div>
                  <h3 className="text-base font-black text-[#20272E]">Cấu trúc phân cấp bộ đề (Test $\to$ Section $\to$ Group)</h3>
                  <p className="text-xs text-[#68727D] mt-0.5">
                    Quản lý các phần thi và các nhóm câu hỏi liên kết với bài đọc hoặc file nghe.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newSecName: 'Listening' | 'Reading' | 'Writing' | 'Speaking' =
                        currentTest.sections.some((s) => s.name === 'Listening') ? 'Reading' : 'Listening'
                      const newSec: BuilderSection = {
                        id: `sec-${Date.now().toString().slice(-4)}`,
                        name: newSecName,
                        durationMinutes: 60,
                        totalQuestions: 0,
                        groups: [],
                      }
                      setCurrentTest({ ...currentTest, sections: [...currentTest.sections, newSec] })
                    }}
                    className="font-bold text-xs"
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                  >
                    Thêm phần thi (Section)
                  </Button>
                </div>
              </div>

              {/* Sections Accordion Cards */}
              <div className="space-y-4">
                {currentTest.sections.map((sec, secIdx) => {
                  const isSelected = selectedSectionName === sec.name
                  const qCount = sec.groups.reduce((acc, g) => acc + g.questions.length, 0)

                  return (
                    <div
                      key={sec.id}
                      className={cn(
                        'rounded-3xl border transition-all overflow-hidden',
                        isSelected ? 'border-[#28665F] bg-[#FAFBFB]' : 'border-[#E3E7EB] bg-white'
                      )}
                    >
                      {/* Section Header */}
                      <div
                        onClick={() => setSelectedSectionName(sec.name)}
                        className="p-5 flex items-center justify-between cursor-pointer hover:bg-[#F2F4F7]/60"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-[#EAF4EE] text-[#28665F] font-black text-sm flex items-center justify-center">
                            {sec.name === 'Listening' && <Headphones className="w-5 h-5" />}
                            {sec.name === 'Reading' && <BookOpen className="w-5 h-5" />}
                            {sec.name === 'Writing' && <PenTool className="w-5 h-5" />}
                            {sec.name === 'Speaking' && <Mic className="w-5 h-5" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-base font-black text-[#20272E]">{sec.name} Section</h4>
                              <span className="text-[11px] font-bold text-[#28665F] bg-[#EAF4EE] px-2 py-0.5 rounded-full">
                                {qCount} câu hỏi
                              </span>
                            </div>
                            <span className="text-xs text-[#68727D] font-medium">
                              Thời lượng: {sec.durationMinutes} phút • {sec.groups.length} nhóm câu hỏi
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              const newGrp: BuilderQuestionGroup = {
                                id: `grp-${Date.now().toString().slice(-6)}`,
                                sectionName: sec.name,
                                title: `Nhóm câu hỏi mới ${sec.groups.length + 1}`,
                                instructions: 'Nhập hướng dẫn làm bài...',
                                questionRange: [qCount + 1, qCount + 3] as [number, number],
                                questionType: 'multiple_choice',
                                questions: [],
                              }
                              const updated = currentTest.sections.map((s) =>
                                s.id === sec.id ? { ...s, groups: [...s.groups, newGrp] } : s
                              )
                              setCurrentTest({ ...currentTest, sections: updated })
                              setSelectedGroupId(newGrp.id)
                            }}
                            className="font-bold text-xs"
                            leftIcon={<Plus className="w-3.5 h-3.5" />}
                          >
                            Thêm nhóm
                          </Button>
                        </div>
                      </div>

                      {/* Groups List */}
                      {sec.groups.length > 0 && (
                        <div className="px-5 pb-5 pt-1 space-y-2.5">
                          {sec.groups.map((grp) => (
                            <div
                              key={grp.id}
                              onClick={() => {
                                setSelectedSectionName(sec.name)
                                setSelectedGroupId(grp.id)
                                setActiveTab('editor')
                              }}
                              className={cn(
                                'p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between',
                                selectedGroupId === grp.id
                                  ? 'bg-[#EAF4EE] border-[#28665F]/40 shadow-2xs'
                                  : 'bg-white border-[#E3E7EB] hover:border-[#28665F]/30'
                              )}
                            >
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-black text-[#20272E]">{grp.title}</span>
                                  <span className="text-[10px] font-bold text-[#68727D] bg-[#F2F4F7] px-2 py-0.5 rounded">
                                    {grp.questionType}
                                  </span>
                                </div>
                                <p className="text-[11px] text-[#68727D] line-clamp-1">
                                  {grp.instructions || 'Chưa có hướng dẫn.'}
                                </p>
                              </div>

                              <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-[#28665F]">
                                  {grp.questions.length} câu
                                </span>
                                <ChevronRight className="w-4 h-4 text-[#68727D]" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: GROUP EDITOR (OUTLINE SIDEBAR + QUESTIONS LIST)
         ========================================================================= */}
      {activeTab === 'editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar: Groups Switcher */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="p-4 rounded-3xl bg-white border border-[#E3E7EB] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#E3E7EB]">
                <span className="text-xs font-black uppercase tracking-wider text-[#28665F]">
                  Chọn nhóm câu hỏi
                </span>
                <span className="text-[11px] font-bold text-[#68727D]">
                  {currentSection?.name}
                </span>
              </div>

              <div className="space-y-1.5">
                {currentSection?.groups.map((grp) => (
                  <button
                    key={grp.id}
                    onClick={() => setSelectedGroupId(grp.id)}
                    className={cn(
                      'w-full text-left p-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between',
                      selectedGroupId === grp.id
                        ? 'bg-[#28665F] text-white shadow-xs'
                        : 'bg-[#FAFBFB] text-[#68727D] hover:bg-[#F2F4F7] hover:text-[#20272E]'
                    )}
                  >
                    <span className="line-clamp-1">{grp.title}</span>
                    <span
                      className={cn(
                        'text-[10px] px-2 py-0.5 rounded-full font-mono',
                        selectedGroupId === grp.id ? 'bg-white/20 text-white' : 'bg-[#E3E7EB] text-[#20272E]'
                      )}
                    >
                      {grp.questions.length}
                    </span>
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-[#E3E7EB]">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (!currentSection) return
                    const newGrp: BuilderQuestionGroup = {
                      id: `grp-${Date.now().toString().slice(-6)}`,
                      sectionName: currentSection.name,
                      title: `Nhóm câu hỏi ${currentSection.groups.length + 1}`,
                      instructions: 'Nhập hướng dẫn câu hỏi...',
                      questionRange: [1, 1],
                      questionType: 'multiple_choice',
                      questions: [],
                    }
                    const updated = currentTest.sections.map((s) =>
                      s.id === currentSection.id ? { ...s, groups: [...s.groups, newGrp] } : s
                    )
                    setCurrentTest({ ...currentTest, sections: updated })
                    setSelectedGroupId(newGrp.id)
                  }}
                  className="w-full font-bold text-xs"
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Thêm nhóm trong {currentSection?.name}
                </Button>
              </div>
            </Card>
          </div>

          {/* Right Area: Group Detail & Questions */}
          <div className="lg:col-span-8 space-y-6">
            {currentGroup ? (
              <Card className="p-6 rounded-3xl bg-white border border-[#E3E7EB] space-y-6">
                {/* Group Meta Settings */}
                <div className="space-y-4 pb-4 border-b border-[#E3E7EB]">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <input
                      type="text"
                      value={currentGroup.title}
                      onChange={(e) => {
                        const updated = currentTest.sections.map((sec) => ({
                          ...sec,
                          groups: sec.groups.map((g) => (g.id === currentGroup.id ? { ...g, title: e.target.value } : g)),
                        }))
                        setCurrentTest({ ...currentTest, sections: updated })
                      }}
                      className="text-base font-black text-[#20272E] border-none bg-transparent hover:bg-[#F2F4F7] focus:bg-white focus:ring-2 focus:ring-[#28665F]/30 rounded-xl px-2 py-1 outline-none flex-1"
                      placeholder="Tiêu đề nhóm câu hỏi..."
                    />
                    <select
                      value={currentGroup.questionType}
                      onChange={(e) => {
                        const newType = e.target.value as BuilderQuestionType
                        const updated = currentTest.sections.map((sec) => ({
                          ...sec,
                          groups: sec.groups.map((g) =>
                            g.id === currentGroup.id
                              ? {
                                  ...g,
                                  questionType: newType,
                                  questions: g.questions.map((q) => ({ ...q, type: newType })),
                                }
                              : g
                          ),
                        }))
                        setCurrentTest({ ...currentTest, sections: updated })
                      }}
                      className="text-xs font-bold bg-[#FAFBFB] border border-[#E3E7EB] rounded-xl px-3 py-1.5 text-[#20272E] outline-none"
                    >
                      <option value="multiple_choice">Multiple Choice (Trắc nghiệm)</option>
                      <option value="true_false_not_given">True / False / Not Given</option>
                      <option value="yes_no_not_given">Yes / No / Not Given</option>
                      <option value="fill_blank">Fill in Blank (Điền từ)</option>
                      <option value="matching">Matching (Nối thông tin)</option>
                      <option value="form_completion">Form Completion</option>
                      <option value="note_completion">Note Completion</option>
                      <option value="sentence_completion">Sentence Completion</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-2xs font-bold uppercase text-[#68727D]">Chỉ dẫn làm bài (Instructions):</label>
                    <input
                      type="text"
                      value={currentGroup.instructions}
                      onChange={(e) => {
                        const updated = currentTest.sections.map((sec) => ({
                          ...sec,
                          groups: sec.groups.map((g) =>
                            g.id === currentGroup.id ? { ...g, instructions: e.target.value } : g
                          ),
                        }))
                        setCurrentTest({ ...currentTest, sections: updated })
                      }}
                      className="w-full text-xs font-medium bg-[#FAFBFB] border border-[#E3E7EB] rounded-xl px-3 py-2 text-[#20272E] outline-none"
                      placeholder="e.g. Do the following statements agree with the information in Reading Passage 1?"
                    />
                  </div>

                  {/* Attached Passage selector if in Reading */}
                  {currentSection?.name === 'Reading' && currentSection.passages && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-[#68727D]">Liên kết bài đọc:</span>
                      <select
                        value={currentGroup.passageId || ''}
                        onChange={(e) => {
                          const updated = currentTest.sections.map((sec) => ({
                            ...sec,
                            groups: sec.groups.map((g) =>
                              g.id === currentGroup.id ? { ...g, passageId: e.target.value } : g
                            ),
                          }))
                          setCurrentTest({ ...currentTest, sections: updated })
                        }}
                        className="text-xs font-semibold bg-[#FAFBFB] border border-[#E3E7EB] rounded-xl px-2 py-1 text-[#20272E]"
                      >
                        <option value="">-- Không gán bài đọc riêng --</option>
                        {currentSection.passages.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Bulk Actions Bar */}
                {currentGroup.questions.length > 0 && (
                  <div className="p-3 rounded-2xl bg-[#F2F4F7] flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 font-bold text-[#20272E]">
                      <input
                        type="checkbox"
                        checked={
                          selectedQuestionIds.length > 0 &&
                          selectedQuestionIds.length === currentGroup.questions.length
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedQuestionIds(currentGroup.questions.map((q) => q.id))
                          } else {
                            setSelectedQuestionIds([])
                          }
                        }}
                        className="rounded"
                      />
                      <span>Đã chọn {selectedQuestionIds.length} / {currentGroup.questions.length} câu</span>
                    </div>

                    {selectedQuestionIds.length > 0 && (
                      <div className="flex items-center gap-2">
                        <select
                          onChange={(e) => handleBulkChangeType(e.target.value as BuilderQuestionType)}
                          className="text-xs font-bold bg-white border border-[#E3E7EB] rounded-lg px-2 py-1"
                        >
                          <option value="">-- Đổi dạng bài hàng loạt --</option>
                          <option value="true_false_not_given">True / False / Not Given</option>
                          <option value="multiple_choice">Multiple Choice</option>
                          <option value="fill_blank">Fill in Blank</option>
                          <option value="matching">Matching</option>
                        </select>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleBulkDelete}
                          className="text-rose-600 hover:bg-rose-50 font-bold text-xs"
                          leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                        >
                          Xóa đã chọn
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Questions List */}
                <div className="space-y-4">
                  {currentGroup.questions.map((q) => {
                    const isSelected = selectedQuestionIds.includes(q.id)
                    return (
                      <div
                        key={q.id}
                        className={cn(
                          'p-4 rounded-2xl border transition-all space-y-3',
                          isSelected ? 'border-[#28665F] bg-[#EAF4EE]/20' : 'border-[#E3E7EB] bg-[#FAFBFB]'
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedQuestionIds([...selectedQuestionIds, q.id])
                                } else {
                                  setSelectedQuestionIds(selectedQuestionIds.filter((id) => id !== q.id))
                                }
                              }}
                              className="rounded mt-0.5"
                            />
                            <span className="w-7 h-7 rounded-xl bg-white border border-[#E3E7EB] font-bold text-xs flex items-center justify-center text-[#28665F]">
                              #{q.order}
                            </span>
                            {q.sourceConfidence === 'ai_inferred' && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 flex items-center gap-1">
                                <Sparkles className="w-3 h-3" /> AI suy luận
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => deleteQuestionFromGroup(currentGroup.id, q.id)}
                              className="text-gray-400 hover:text-rose-600 p-1"
                              title="Xóa câu hỏi này"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Prompt Input */}
                        <div>
                          <input
                            type="text"
                            value={q.prompt}
                            onChange={(e) => updateQuestionInGroup(currentGroup.id, q.id, { prompt: e.target.value })}
                            className="w-full text-xs font-bold bg-white border border-[#E3E7EB] rounded-xl px-3 py-2 text-[#20272E] outline-none"
                            placeholder="Nội dung câu hỏi..."
                          />
                        </div>

                        {/* Options if MCQ or TFNG */}
                        {(q.type === 'multiple_choice' || q.type === 'true_false_not_given') && (
                          <div className="space-y-1.5 pt-1">
                            <span className="text-2xs font-bold text-[#68727D] block">Các phương án lựa chọn:</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              {(q.options || ['A) ', 'B) ', 'C) ', 'D) ']).map((opt, optIdx) => (
                                <input
                                  key={optIdx}
                                  type="text"
                                  value={opt}
                                  onChange={(e) => {
                                    const newOpts = [...(q.options || [])]
                                    newOpts[optIdx] = e.target.value
                                    updateQuestionInGroup(currentGroup.id, q.id, { options: newOpts })
                                  }}
                                  className="p-2 rounded-xl bg-white border border-[#E3E7EB] text-xs font-medium"
                                  placeholder={`Lựa chọn ${optIdx + 1}`}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Answer Key & Explanation */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div>
                            <span className="text-2xs font-bold text-[#68727D] block mb-1">
                              Đáp án đúng (Answer Key):
                            </span>
                            <input
                              type="text"
                              value={typeof q.correctAnswer === 'string' ? q.correctAnswer : q.correctAnswer.join(', ')}
                              onChange={(e) => updateQuestionInGroup(currentGroup.id, q.id, { correctAnswer: e.target.value })}
                              className="w-full text-xs font-bold bg-white border border-[#28665F]/40 rounded-xl px-3 py-2 text-[#28665F]"
                              placeholder="e.g. A hoặc TRUE hoặc từ cần điền"
                            />
                          </div>

                          <div>
                            <span className="text-2xs font-bold text-[#68727D] block mb-1">
                              Giải thích / Dẫn chứng (Explanation):
                            </span>
                            <input
                              type="text"
                              value={q.explanation || ''}
                              onChange={(e) => updateQuestionInGroup(currentGroup.id, q.id, { explanation: e.target.value })}
                              className="w-full text-xs font-medium bg-white border border-[#E3E7EB] rounded-xl px-3 py-2 text-[#4B5563]"
                              placeholder="Dẫn chứng đoạn văn..."
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Add New Question Button */}
                <div className="pt-2 text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addNewQuestionToGroup(currentGroup.id)}
                    className="font-bold text-xs"
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Thêm câu hỏi mới vào nhóm này
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="p-8 text-center text-[#68727D] bg-white rounded-3xl border border-[#E3E7EB]">
                <p>Chưa chọn nhóm câu hỏi nào. Hãy chọn nhóm ở danh sách bên trái.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: ANSWER KEY MATRIX
         ========================================================================= */}
      {activeTab === 'answer_matrix' && (
        <Card className="p-6 rounded-3xl bg-white border border-[#E3E7EB] space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E3E7EB]">
            <div>
              <h3 className="text-base font-black text-[#20272E]">Ma trận Đáp án & Quy tắc chấm điểm (Answer Key Matrix)</h3>
              <p className="text-xs text-[#68727D] mt-0.5">
                Xem và chỉnh sửa đáp án nhanh cho toàn bộ câu hỏi trong đề thi.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#EAF4EE] text-[#28665F]">
                Đã nhập:{' '}
                {
                  currentTest.sections.reduce(
                    (acc, s) =>
                      acc +
                      s.groups.reduce(
                        (gAcc, g) => gAcc + g.questions.filter((q) => Boolean(q.correctAnswer)).length,
                        0
                      ),
                    0
                  )
                }{' '}
                câu
              </span>
            </div>
          </div>

          {/* Matrix Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E3E7EB] bg-[#FAFBFB] text-[#68727D] font-bold">
                  <th className="py-3 px-4 w-16">Câu #</th>
                  <th className="py-3 px-4 w-28">Section</th>
                  <th className="py-3 px-4 w-36">Dạng bài</th>
                  <th className="py-3 px-4">Đề bài tóm tắt</th>
                  <th className="py-3 px-4 w-44">Đáp án chính (Answer)</th>
                  <th className="py-3 px-4 w-40">Đáp án phụ (Acceptable)</th>
                  <th className="py-3 px-4 w-20 text-center">Điểm</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E7EB]">
                {currentTest.sections.flatMap((sec) =>
                  sec.groups.flatMap((grp) =>
                    grp.questions.map((q) => {
                      const hasAnswer = Boolean(q.correctAnswer)
                      return (
                        <tr key={q.id} className="hover:bg-[#FAFBFB] transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-[#28665F]">#{q.order}</td>
                          <td className="py-3 px-4 font-semibold text-[#20272E]">{sec.name}</td>
                          <td className="py-3 px-4 text-[#68727D] font-mono text-2xs">{q.type}</td>
                          <td className="py-3 px-4 font-medium text-[#20272E] max-w-xs truncate">{q.prompt}</td>
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              value={typeof q.correctAnswer === 'string' ? q.correctAnswer : q.correctAnswer.join(', ')}
                              onChange={(e) => updateQuestionInGroup(grp.id, q.id, { correctAnswer: e.target.value })}
                              className={cn(
                                'w-full text-xs font-bold rounded-xl px-2.5 py-1.5 outline-none border transition-all',
                                hasAnswer
                                  ? 'bg-[#EAF4EE] text-[#1E4D48] border-[#28665F]/30'
                                  : 'bg-rose-50 text-rose-700 border-rose-300'
                              )}
                              placeholder="Chưa có đáp án..."
                            />
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              value={(q.acceptableAnswers || []).join(' | ')}
                              onChange={(e) =>
                                updateQuestionInGroup(grp.id, q.id, {
                                  acceptableAnswers: e.target.value.split('|').map((a) => a.trim()).filter(Boolean),
                                })
                              }
                              className="w-full text-xs font-medium rounded-xl px-2 py-1.5 bg-white border border-[#E3E7EB]"
                              placeholder="alt1 | alt2"
                            />
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-[#20272E]">{q.points || 1}</td>
                        </tr>
                      )
                    })
                  )
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* =========================================================================
          TAB 5: ASSET MANAGER (AUDIO, PASSAGES & DIAGRAMS)
         ========================================================================= */}
      {activeTab === 'assets' && (
        <Card className="p-6 rounded-3xl bg-white border border-[#E3E7EB] space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E3E7EB]">
            <div>
              <h3 className="text-base font-black text-[#20272E]">Quản lý Tài nguyên (Audio, Bài đọc & Biểu đồ)</h3>
              <p className="text-xs text-[#68727D] mt-0.5">
                Các file âm thanh, bài đọc học thuật và biểu đồ dùng chung cho các câu hỏi.
              </p>
            </div>
          </div>

          {/* Passages List in Reading */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#28665F] flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Danh sách bài đọc (Reading Passages)
            </h4>

            {currentTest.sections
              .filter((s) => s.name === 'Reading')
              .map((sec) => (
                <div key={sec.id} className="space-y-3">
                  {(sec.passages || []).map((p, idx) => (
                    <div key={p.id} className="p-5 rounded-2xl border border-[#E3E7EB] bg-[#FAFBFB] space-y-3">
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={p.title}
                          onChange={(e) => {
                            const updatedPassages = sec.passages?.map((item) =>
                              item.id === p.id ? { ...item, title: e.target.value } : item
                            )
                            const updatedSections = currentTest.sections.map((s) =>
                              s.id === sec.id ? { ...s, passages: updatedPassages } : s
                            )
                            setCurrentTest({ ...currentTest, sections: updatedSections })
                          }}
                          className="font-bold text-sm text-[#20272E] bg-white border border-[#E3E7EB] rounded-xl px-3 py-1.5 flex-1 mr-3"
                        />
                        <span className="text-xs font-mono text-[#68727D]">
                          {p.paragraphs.join(' ').split(/\s+/).length} từ
                        </span>
                      </div>

                      <div className="space-y-1">
                        <label className="text-2xs font-bold text-[#68727D]">Nội dung đoạn văn (Mỗi đoạn cách nhau 1 dòng trống):</label>
                        <textarea
                          rows={6}
                          value={p.paragraphs.join('\n\n')}
                          onChange={(e) => {
                            const newParagraphs = e.target.value.split('\n\n').filter(Boolean)
                            const updatedPassages = sec.passages?.map((item) =>
                              item.id === p.id ? { ...item, paragraphs: newParagraphs } : item
                            )
                            const updatedSections = currentTest.sections.map((s) =>
                              s.id === sec.id ? { ...s, passages: updatedPassages } : s
                            )
                            setCurrentTest({ ...currentTest, sections: updatedSections })
                          }}
                          className="w-full p-3 text-xs font-sans rounded-xl border border-[#E3E7EB] bg-white leading-relaxed outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
          </div>

          {/* Listening Audio Assets */}
          <div className="space-y-4 pt-4 border-t border-[#E3E7EB]">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#28665F] flex items-center gap-2">
              <Headphones className="w-4 h-4" /> File Âm thanh Listening (Audio URL)
            </h4>

            {currentTest.sections
              .filter((s) => s.name === 'Listening')
              .map((sec) => (
                <div key={sec.id} className="p-4 rounded-2xl bg-[#FAFBFB] border border-[#E3E7EB] space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#20272E]">Đường dẫn Audio Stream / MP3:</label>
                    <input
                      type="text"
                      value={sec.audioUrl || ''}
                      onChange={(e) => {
                        const updatedSections = currentTest.sections.map((s) =>
                          s.id === sec.id ? { ...s, audioUrl: e.target.value } : s
                        )
                        setCurrentTest({ ...currentTest, sections: updatedSections })
                      }}
                      className="w-full text-xs font-mono bg-white border border-[#E3E7EB] rounded-xl px-3 py-2 text-[#20272E]"
                      placeholder="https://... audio.mp3"
                    />
                  </div>

                  {sec.audioUrl && (
                    <div className="pt-1">
                      <audio controls className="w-full h-8" src={sec.audioUrl}>
                        Trình duyệt không hỗ trợ thẻ audio.
                      </audio>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </Card>
      )}

      {/* =========================================================================
          TAB 6: VALIDATION REPORT & INTEGRITY CHECKLIST
         ========================================================================= */}
      {activeTab === 'validation' && (
        <Card className="p-6 rounded-3xl bg-white border border-[#E3E7EB] space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E3E7EB]">
            <div>
              <h3 className="text-base font-black text-[#20272E]">Báo cáo Kiểm tra Toàn vẹn Dữ liệu (Validation Report)</h3>
              <p className="text-xs text-[#68727D] mt-0.5">
                Kiểm tra tự động các lỗi logic, thiếu đáp án, trùng số thứ tự trước khi cấp quyền xuất bản.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={runValidation}
              className="font-bold text-xs"
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Chạy kiểm tra lại
            </Button>
          </div>

          {validationReport ? (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-4 rounded-2xl bg-[#FAFBFB] border border-[#E3E7EB]">
                  <span className="text-2xl font-black text-[#20272E] block">
                    {validationReport.stats.totalQuestions}
                  </span>
                  <span className="text-xs text-[#68727D] font-bold">Tổng số câu hỏi</span>
                </div>
                <div className="p-4 rounded-2xl bg-[#EAF4EE] border border-[#28665F]/20">
                  <span className="text-2xl font-black text-[#28665F] block">
                    {validationReport.stats.answeredQuestions}
                  </span>
                  <span className="text-xs text-[#28665F] font-bold">Đã có đáp án</span>
                </div>
                <div
                  className={cn(
                    'p-4 rounded-2xl border',
                    validationReport.stats.missingAnswers > 0
                      ? 'bg-amber-50 border-amber-200 text-amber-800'
                      : 'bg-white border-[#E3E7EB] text-[#68727D]'
                  )}
                >
                  <span className="text-2xl font-black block">{validationReport.stats.missingAnswers}</span>
                  <span className="text-xs font-bold">Chưa có đáp án</span>
                </div>
                <div
                  className={cn(
                    'p-4 rounded-2xl border',
                    validationReport.errors.length > 0
                      ? 'bg-rose-50 border-rose-200 text-rose-800'
                      : 'bg-[#EAF4EE] border-[#28665F]/20 text-[#28665F]'
                  )}
                >
                  <span className="text-2xl font-black block">{validationReport.errors.length}</span>
                  <span className="text-xs font-bold">Lỗi bắt buộc sửa</span>
                </div>
              </div>

              {/* Errors List */}
              {validationReport.errors.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4" /> Các lỗi bắt buộc sửa ({validationReport.errors.length})
                  </h4>
                  <div className="space-y-2">
                    {validationReport.errors.map((err, i) => (
                      <div
                        key={i}
                        className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start justify-between gap-3"
                      >
                        <div>
                          <strong className="block font-black">{err.message}</strong>
                          <span className="text-[11px] text-rose-700 font-medium">💡 Gợi ý sửa: {err.fixHint}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings List */}
              {validationReport.warnings.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" /> Cảnh báo cần xem xét ({validationReport.warnings.length})
                  </h4>
                  <div className="space-y-2">
                    {validationReport.warnings.map((warn, i) => (
                      <div
                        key={i}
                        className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start justify-between gap-3"
                      >
                        <div>
                          <strong className="block font-black">{warn.message}</strong>
                          <span className="text-[11px] text-amber-700 font-medium">💡 Gợi ý: {warn.fixHint}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Success Info */}
              {validationReport.canPublish && (
                <div className="p-4 rounded-2xl bg-[#EAF4EE] border border-[#28665F]/30 text-xs text-[#1E4D48] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-[#16A34A] shrink-0" />
                    <div>
                      <strong className="text-sm block">Đạt tiêu chuẩn xuất bản!</strong>
                      <span>Bộ đề đã sẵn sàng cho học viên thi thử trong Exam Workspace.</span>
                    </div>
                  </div>
                  <Button variant="primary" size="sm" onClick={handlePublish} className="font-bold">
                    Xuất bản ngay
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-[#68727D]">
              <p>Nhấn nút &quot;Chạy kiểm tra lại&quot; để đánh giá toàn vẹn bộ đề.</p>
            </div>
          )}
        </Card>
      )}

      {/* =========================================================================
          TAB 7: AUTHENTIC STUDENT EXAM PREVIEW (CDI WORKSPACE SIMULATION)
         ========================================================================= */}
      {activeTab === 'preview' && (
        <Card className="p-6 rounded-3xl bg-white border border-[#E3E7EB] space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E3E7EB]">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-[#28665F] bg-[#EAF4EE] px-2.5 py-0.5 rounded-lg">
                Chế độ xem trước phòng thi
              </span>
              <h3 className="text-base font-black text-[#20272E] mt-1">
                Giao diện mô phỏng chính xác cách học viên nhìn thấy và làm bài
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#68727D]">
                (Không tạo phiên thi thật và không lưu kết quả vào lịch sử học viên)
              </span>
            </div>
          </div>

          {/* Section Switcher in Preview */}
          <div className="flex items-center gap-2 border-b border-[#E3E7EB] pb-3">
            {currentTest.sections.map((sec) => (
              <button
                key={sec.id}
                onClick={() => setPreviewActiveSection(sec.name)}
                className={cn(
                  'px-4 py-2 rounded-xl text-xs font-black transition-all',
                  previewActiveSection === sec.name
                    ? 'bg-[#28665F] text-white shadow-xs'
                    : 'bg-[#F2F4F7] text-[#68727D] hover:bg-[#EAECEF]'
                )}
              >
                {sec.name} Section
              </button>
            ))}
          </div>

          {/* CDI Exam Workspace Simulation Screen */}
          <div className="rounded-3xl border-2 border-[#20272E] overflow-hidden bg-white shadow-lg">
            {/* Topbar CDI */}
            <div className="px-5 py-3.5 bg-[#20272E] text-white flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{currentTest.title}</span>
                <span className="text-gray-400 font-normal">| {previewActiveSection} Section</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono bg-black/40 px-3 py-1 rounded-lg text-emerald-400 font-bold">
                  ⏱ 59:45
                </span>
              </div>
            </div>

            {/* Split Screen Simulator */}
            <div className="grid grid-cols-1 md:grid-cols-12 min-h-[420px]">
              {/* Left Pane: Passage or Audio */}
              <div className="md:col-span-6 p-6 border-r border-[#E3E7EB] bg-[#FAFBFB] space-y-4 max-h-[500px] overflow-y-auto">
                {previewActiveSection === 'Reading' && (
                  <div className="space-y-3">
                    <h4 className="font-black text-sm text-[#20272E]">
                      {currentSection?.passages?.[0]?.title || 'Reading Passage 1'}
                    </h4>
                    {(currentSection?.passages?.[0]?.paragraphs || []).map((para, pIdx) => (
                      <p key={pIdx} className="text-xs leading-relaxed text-[#4B5563] font-serif">
                        [Đoạn {String.fromCharCode(65 + pIdx)}] {para}
                      </p>
                    ))}
                  </div>
                )}

                {previewActiveSection === 'Listening' && (
                  <div className="space-y-4 text-center py-10">
                    <div className="w-16 h-16 rounded-full bg-[#EAF4EE] text-[#28665F] flex items-center justify-center mx-auto">
                      <Headphones className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-[#20272E]">Listening Audio Track</h4>
                      <p className="text-xs text-[#68727D] mt-1">
                        File âm thanh sẽ tự động phát liên tục trong suốt 30 phút làm bài.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Pane: Questions */}
              <div className="md:col-span-6 p-6 space-y-6 max-h-[500px] overflow-y-auto">
                {currentSection?.groups.flatMap((g) => g.questions).map((q) => (
                  <div key={q.id} className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-[#20272E]">
                        Câu {q.order}: {q.prompt}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (previewFlagged.includes(q.order)) {
                            setPreviewFlagged(previewFlagged.filter((o) => o !== q.order))
                          } else {
                            setPreviewFlagged([...previewFlagged, q.order])
                          }
                        }}
                        className={cn(
                          'text-[10px] font-bold px-2 py-0.5 rounded',
                          previewFlagged.includes(q.order)
                            ? 'bg-amber-100 text-amber-800'
                            : 'text-gray-400 hover:text-gray-600'
                        )}
                      >
                        ⚐ Đánh dấu
                      </button>
                    </div>

                    {q.options && q.options.length > 0 ? (
                      <div className="space-y-1.5 pl-2">
                        {q.options.map((opt, i) => (
                          <label
                            key={i}
                            className="flex items-center gap-2 p-2 rounded-xl bg-[#FAFBFB] hover:bg-[#EAF4EE] cursor-pointer"
                          >
                            <input type="radio" name={`prev-q-${q.id}`} className="text-[#28665F]" />
                            <span className="text-xs text-[#20272E]">{opt}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <input
                        type="text"
                        placeholder="Nhập câu trả lời..."
                        className="w-full p-2.5 rounded-xl border border-[#E3E7EB] text-xs font-mono"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Navigator */}
            <div className="px-5 py-3 bg-[#F2F4F7] border-t border-[#E3E7EB] flex items-center justify-between text-xs font-bold text-[#68727D]">
              <div className="flex items-center gap-2">
                <span>Bảng câu hỏi:</span>
                <div className="flex items-center gap-1">
                  {currentSection?.groups
                    .flatMap((g) => g.questions)
                    .map((q) => (
                      <span
                        key={q.id}
                        className={cn(
                          'w-6 h-6 rounded flex items-center justify-center font-mono text-2xs',
                          previewFlagged.includes(q.order)
                            ? 'bg-amber-400 text-black font-black'
                            : 'bg-white border border-[#E3E7EB] text-[#28665F]'
                        )}
                      >
                        {q.order}
                      </span>
                    ))}
                </div>
              </div>
              <span className="text-[#28665F] font-bold">Giao diện đạt chuẩn Exam Workspace ✓</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
