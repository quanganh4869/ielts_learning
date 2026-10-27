import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, Plus } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { PageHeader } from '../../components/PageHeader'
import { DataToolbar } from '../../components/DataToolbar'
import { FilterPanel } from '../../components/FilterPanel'
import { DataTable, Column } from '../../components/DataTable'
import { StatusBadge } from '../../components/StatusBadge'
import { adminService } from '../../services/adminService'
import { AdminQuestion } from '../../types/admin'

export const QuestionBankPage: React.FC = () => {
  const navigate = useNavigate()
  const [questions, setQuestions] = useState<AdminQuestion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [search, setSearch] = useState('')
  const [skillFilter, setSkillFilter] = useState('all')
  const [diffFilter, setDiffFilter] = useState('all')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Sorting
  const [sortColumn, setSortColumn] = useState<string>('code')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const handleSort = (key: string) => {
    if (sortColumn === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortColumn(key)
      setSortDirection('asc')
    }
  }

  const loadQuestions = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await adminService.getQuestions()
      setQuestions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải ngân hàng câu hỏi')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadQuestions()
  }, [])

  const filtered = useMemo(() => {
    const list = questions.filter((q) => {
      const matchSearch =
        q.prompt.toLowerCase().includes(search.toLowerCase()) ||
        q.code.toLowerCase().includes(search.toLowerCase())

      const matchSkill = skillFilter === 'all' || q.skill === skillFilter
      const matchDiff = diffFilter === 'all' || q.difficulty === diffFilter

      return matchSearch && matchSkill && matchDiff
    })

    return [...list].sort((a, b) => {
      let cmp = 0
      if (sortColumn === 'code') cmp = a.code.localeCompare(b.code)
      else if (sortColumn === 'skill') cmp = a.skill.localeCompare(b.skill)
      else if (sortColumn === 'difficulty') cmp = a.difficulty.localeCompare(b.difficulty)
      else if (sortColumn === 'status') cmp = a.status.localeCompare(b.status)
      return sortDirection === 'asc' ? cmp : -cmp
    })
  }, [questions, search, skillFilter, diffFilter, sortColumn, sortDirection])

  const columns: Column<AdminQuestion>[] = [
    {
      key: 'code',
      header: 'Mã câu hỏi',
      width: '130px',
      sortable: true,
      render: (q) => <span className="font-mono font-bold text-xs text-[#28665F]">{q.code}</span>,
    },
    {
      key: 'prompt',
      header: 'Nội dung câu hỏi',
      render: (q) => (
        <div>
          <div className="font-medium text-xs text-[#20272E] max-w-md line-clamp-2">{q.prompt}</div>
          <div className="text-2xs text-[#68727D] mt-0.5">
            Dạng bài: <span className="font-semibold text-[#20272E]">{q.type}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'skill',
      header: 'Kỹ năng',
      render: (q) => (
        <span className="capitalize text-xs font-semibold px-2 py-0.5 rounded bg-[#F7F8FA] border border-[#E3E7EB]">
          {q.skill}
        </span>
      ),
    },
    {
      key: 'difficulty',
      header: 'Độ khó',
      render: (q) => (
        <span
          className={`capitalize text-2xs font-bold px-2 py-0.5 rounded ${
            q.difficulty === 'hard'
              ? 'bg-rose-50 text-rose-700'
              : q.difficulty === 'medium'
              ? 'bg-amber-50 text-amber-700'
              : 'bg-emerald-50 text-emerald-700'
          }`}
        >
          {q.difficulty}
        </span>
      ),
    },
    {
      key: 'usageCount',
      header: 'Sử dụng trong đề',
      render: (q) => <span className="text-xs font-semibold text-[#20272E]">{q.usageCount} lượt</span>,
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (q) => <StatusBadge status={q.status} />,
    },
    {
      key: 'actions',
      header: 'Chi tiết',
      align: 'right',
      render: (q) => (
        <button
          type="button"
          onClick={() => navigate(`/admin/question-bank/${q.id}`)}
          className="p-1.5 text-[#68727D] hover:text-[#28665F] hover:bg-[#EAF3F1] rounded-lg transition-colors"
          title="Xem chi tiết câu hỏi"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ngân hàng Câu hỏi Tập trung (Item Bank)"
        subtitle={`Quản lý toàn bộ câu hỏi tái sử dụng trong bài luyện, placement test và mock test (${filtered.length} câu)`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/admin/assessments/builder')}
              className="font-bold shadow-xs"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Question Set Builder (Nhập hàng loạt)
            </Button>
          </div>
        }
      />

      <DataToolbar
        searchPlaceholder="Tìm theo mã câu hỏi hoặc từ khóa trong đề..."
        searchValue={search}
        onSearchChange={setSearch}
        isFilterOpen={isFilterOpen}
        onToggleFilter={() => setIsFilterOpen(!isFilterOpen)}
        activeFilterCount={(skillFilter !== 'all' ? 1 : 0) + (diffFilter !== 'all' ? 1 : 0)}
      />

      <FilterPanel
        isOpen={isFilterOpen}
        onReset={() => {
          setSkillFilter('all')
          setDiffFilter('all')
        }}
      >
        <div>
          <label className="text-2xs font-bold text-[#20272E] block mb-1">Kỹ năng</label>
          <select
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            className="w-full h-8 text-xs rounded border border-[#E3E7EB] bg-white px-2 focus:outline-none focus:border-[#28665F]"
          >
            <option value="all">Tất cả kỹ năng</option>
            <option value="listening">Listening</option>
            <option value="reading">Reading</option>
            <option value="writing">Writing</option>
            <option value="speaking">Speaking</option>
          </select>
        </div>

        <div>
          <label className="text-2xs font-bold text-[#20272E] block mb-1">Độ khó</label>
          <select
            value={diffFilter}
            onChange={(e) => setDiffFilter(e.target.value)}
            className="w-full h-8 text-xs rounded border border-[#E3E7EB] bg-white px-2 focus:outline-none focus:border-[#28665F]"
          >
            <option value="all">Tất cả độ khó</option>
            <option value="easy">Easy (Band 5.0 - 6.0)</option>
            <option value="medium">Medium (Band 6.5 - 7.5)</option>
            <option value="hard">Hard (Band 8.0+)</option>
          </select>
        </div>
      </FilterPanel>

      <DataTable
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        error={error}
        onRetry={loadQuestions}
        keyExtractor={(q) => q.id}
        onRowClick={(q) => navigate(`/admin/question-bank/${q.id}`)}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
      />
    </div>
  )
}
