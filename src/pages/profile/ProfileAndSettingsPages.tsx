import React, { useState } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { Card } from '@/components/common/Card'
import { Input } from '@/components/common/Input'
import { Button } from '@/components/common/Button'
import { Modal } from '@/components/common/Modal'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/components/common/Toast'
import { useLanguage } from '@/context/LanguageContext'

// 1. PROFILE PAGE
export const ProfilePage: React.FC = () => {
  const { tText } = useLanguage()
  const { user, updateUser } = useAuth()
  const { showToast } = useToast()

  const [fullName, setFullName] = useState(user?.fullName || 'Nguyễn Quang Anh')
  const [email] = useState(user?.email || 'quanganh.ielts@example.com')
  const [targetBand, setTargetBand] = useState(user?.targetBand || 7.0)
  const [testType, setTestType] = useState(user?.testType || 'academic')
  const [examDate, setExamDate] = useState(user?.examDate || '2026-12-15')

  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveProfile = () => {
    // If target band is changed, prompt confirmation
    if (targetBand !== user?.targetBand) {
      setShowConfirmModal(true)
    } else {
      applyUpdate()
    }
  }

  const applyUpdate = () => {
    setIsSaving(true)
    setTimeout(() => {
      updateUser({
        fullName,
        targetBand,
        testType,
        examDate,
      })
      setIsSaving(false)
      setShowConfirmModal(false)
      showToast({
        title: tText('Cập nhật thành công', 'Updated successfully'),
        description: tText('Thông tin hồ sơ và mục tiêu đã được lưu vào hệ thống.', 'Profile details and target band have been saved.'),
        type: 'success',
      })
    }, 400)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title={tText('Hồ sơ cá nhân & Mục tiêu', 'Profile & Target Band')}
        description={tText('Quản lý thông tin tài khoản và điều chỉnh mục tiêu điểm số IELTS', 'Manage account details and calibrate your IELTS target band score')}
      />

      <Card className="p-6 sm:p-8 bg-white border border-[#E3E7EB] rounded-xl space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-[#E3E7EB]">
          <div className="w-16 h-16 rounded-2xl bg-[#EAF3F1] border border-[#28665F]/30 text-[#28665F] font-bold text-xl flex items-center justify-center">
            {fullName.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#20272E]">{fullName}</h2>
            <p className="text-xs text-[#68727D]">{email}</p>
            <span className="text-[11px] px-2 py-0.5 rounded bg-[#F7F8FA] border border-[#E3E7EB] text-[#28665F] font-semibold mt-1 inline-block">
              {testType === 'academic' ? 'IELTS Academic Module' : 'IELTS General Training'}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <Input
            label={tText('Họ và tên hiển thị', 'Full Name')}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <Input
            label={tText('Địa chỉ Email', 'Email Address')}
            value={email}
            disabled
            helperText={tText('Địa chỉ email tài khoản không thể tự ý thay đổi trực tiếp.', 'Account email address cannot be modified directly.')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-[#20272E] block mb-1.5">
                {tText('Loại bài thi IELTS', 'IELTS Exam Type')}
              </label>
              <select
                value={testType}
                onChange={(e) => setTestType(e.target.value as 'academic' | 'general')}
                className="w-full h-10 rounded-lg bg-white border border-[#E3E7EB] text-sm px-3.5 focus:outline-none focus:border-[#28665F]"
              >
                <option value="academic">IELTS Academic</option>
                <option value="general">IELTS General Training</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#20272E] block mb-1.5">
                {tText('Band mục tiêu', 'Target Band')}
              </label>
              <select
                value={targetBand}
                onChange={(e) => setTargetBand(Number(e.target.value))}
                className="w-full h-10 rounded-lg bg-white border border-[#E3E7EB] text-sm px-3.5 focus:outline-none focus:border-[#28665F]"
              >
                {[5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5].map((b) => (
                  <option key={b} value={b}>
                    Band {b.toFixed(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label={tText('Ngày thi dự kiến', 'Expected Exam Date')}
            type="date"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-[#E3E7EB]">
          <Button variant="primary" size="md" isLoading={isSaving} onClick={handleSaveProfile}>
            {tText('Lưu thay đổi', 'Save Changes')}
          </Button>
        </div>
      </Card>

      {/* CONFIRMATION MODAL IF CHANGING TARGET BAND */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title={tText('Xác nhận thay đổi mục tiêu Band', 'Confirm Target Band Change')}
        description={tText('Việc thay đổi mục tiêu điểm số có thể làm điều chỉnh khối lượng bài học trong lộ trình hiện tại của bạn.', 'Adjusting your target band score may recalibrate the study workload in your current learning path.')}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setShowConfirmModal(false)}>
              {tText('Hủy bỏ', 'Cancel')}
            </Button>
            <Button variant="primary" size="sm" onClick={applyUpdate}>
              {tText('Đồng ý cập nhật', 'Confirm Update')}
            </Button>
          </>
        }
      >
        <p className="text-xs text-[#68727D] leading-relaxed py-2">
          {tText(
            `Bạn đang đổi mục tiêu từ Band ${user?.targetBand} sang Band ${targetBand}. Hệ thống sẽ giữ nguyên toàn bộ lịch sử bài học và điểm thi cũ của bạn.`,
            `You are changing your target from Band ${user?.targetBand} to Band ${targetBand}. All previous lesson history and test results will be safely retained.`
          )}
        </p>
      </Modal>
    </div>
  )
}

// 2. SETTINGS PAGE
export const SettingsPage: React.FC = () => {
  const { tText } = useLanguage()
  const { showToast } = useToast()

  const [daysPerWeek, setDaysPerWeek] = useState(4)
  const [minutesPerDay, setMinutesPerDay] = useState(60)
  const [emailNotification, setEmailNotification] = useState(true)
  const [reminderNotification, setReminderNotification] = useState(true)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSaveSchedule = () => {
    showToast({
      title: tText('Lịch học đã cập nhật', 'Schedule updated'),
      description: tText(`Đã thiết lập ${daysPerWeek} buổi / tuần (${minutesPerDay} phút/buổi).`, `Set to ${daysPerWeek} days/week (${minutesPerDay} mins/day).`),
      type: 'success',
    })
  }

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 6) {
      showToast({
        title: tText('Mật khẩu quá ngắn', 'Password too short'),
        description: tText('Mật khẩu mới phải có ít nhất 6 ký tự.', 'New password must be at least 6 characters long.'),
        type: 'error',
      })
      return
    }
    if (newPassword !== confirmPassword) {
      showToast({
        title: tText('Mật khẩu không khớp', 'Passwords do not match'),
        description: tText('Vui lòng xác nhận lại mật khẩu mới.', 'Please verify your new password again.'),
        type: 'error',
      })
      return
    }
    showToast({
      title: tText('Đổi mật khẩu thành công', 'Password changed successfully'),
      description: tText('Mật khẩu tài khoản đã được thay đổi an toàn.', 'Your account password has been updated securely.'),
      type: 'success',
    })
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title={tText('Cài đặt & Lịch học', 'Settings & Study Schedule')}
        description={tText('Điều chỉnh lịch học hàng tuần, thông báo và bảo mật tài khoản', 'Configure weekly study frequency, notification preferences, and account credentials')}
      />

      {/* SCHEDULE SETTINGS */}
      <Card className="p-6 bg-white border border-[#E3E7EB] rounded-xl space-y-4">
        <h3 className="text-base font-bold text-[#20272E]">{tText('Lịch học hàng tuần', 'Weekly Study Schedule')}</h3>
        <p className="text-xs text-[#68727D]">
          {tText('Thiết lập số buổi và thời gian học dự kiến để hệ thống phân bổ nhiệm vụ hợp lý.', 'Set desired weekly frequency and session duration for adaptive schedule planning.')}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="text-xs font-semibold text-[#20272E] block mb-1.5">
              {tText('Số ngày học mỗi tuần', 'Study Days Per Week')}
            </label>
            <select
              value={daysPerWeek}
              onChange={(e) => setDaysPerWeek(Number(e.target.value))}
              className="w-full h-10 rounded-lg bg-white border border-[#E3E7EB] text-sm px-3.5 focus:outline-none focus:border-[#28665F]"
            >
              {[2, 3, 4, 5, 6, 7].map((d) => (
                <option key={d} value={d}>
                  {d} {tText('buổi / tuần', 'days / week')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#20272E] block mb-1.5">
              {tText('Thời lượng mỗi buổi', 'Duration Per Session')}
            </label>
            <select
              value={minutesPerDay}
              onChange={(e) => setMinutesPerDay(Number(e.target.value))}
              className="w-full h-10 rounded-lg bg-white border border-[#E3E7EB] text-sm px-3.5 focus:outline-none focus:border-[#28665F]"
            >
              {[30, 45, 60, 90, 120].map((m) => (
                <option key={m} value={m}>
                  {m} {tText('phút', 'minutes')}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="primary" size="sm" onClick={handleSaveSchedule}>
            {tText('Lưu cài đặt lịch học', 'Save Schedule')}
          </Button>
        </div>
      </Card>

      {/* NOTIFICATIONS */}
      <Card className="p-6 bg-white border border-[#E3E7EB] rounded-xl space-y-4">
        <h3 className="text-base font-bold text-[#20272E]">{tText('Tùy chọn thông báo', 'Notification Preferences')}</h3>

        <div className="space-y-3 pt-1">
          <label className="flex items-center justify-between p-3 rounded-lg bg-[#F7F8FA] border border-[#E3E7EB] cursor-pointer">
            <div>
              <span className="text-xs font-bold text-[#20272E] block">
                {tText('Nhắc nhở lịch học hàng ngày', 'Daily Study Reminders')}
              </span>
              <span className="text-[11px] text-[#68727D]">
                {tText('Gửi nhắc nhở khi đến khung giờ học đã chọn', 'Receive push alerts at your scheduled study hour')}
              </span>
            </div>
            <input
              type="checkbox"
              checked={reminderNotification}
              onChange={(e) => setReminderNotification(e.target.checked)}
              className="accent-[#28665F] w-4 h-4 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-lg bg-[#F7F8FA] border border-[#E3E7EB] cursor-pointer">
            <div>
              <span className="text-xs font-bold text-[#20272E] block">
                {tText('Báo cáo tiến độ qua Email hàng tuần', 'Weekly Email Progress Digest')}
              </span>
              <span className="text-[11px] text-[#68727D]">
                {tText('Tóm tắt số giờ học và kết quả bài tập đã hoàn thành', 'Summary of study hours, milestones, and practice scores')}
              </span>
            </div>
            <input
              type="checkbox"
              checked={emailNotification}
              onChange={(e) => setEmailNotification(e.target.checked)}
              className="accent-[#28665F] w-4 h-4 cursor-pointer"
            />
          </label>
        </div>
      </Card>

      {/* CHANGE PASSWORD */}
      <Card className="p-6 bg-white border border-[#E3E7EB] rounded-xl space-y-4">
        <h3 className="text-base font-bold text-[#20272E]">{tText('Đổi mật khẩu tài khoản', 'Change Password')}</h3>

        <form onSubmit={handleChangePassword} className="space-y-3.5 pt-1">
          <Input
            label={tText('Mật khẩu hiện tại', 'Current Password')}
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder={tText('Nhập mật khẩu hiện tại...', 'Enter current password...')}
            required
          />

          <Input
            label={tText('Mật khẩu mới', 'New Password')}
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder={tText('Tối thiểu 6 ký tự...', 'At least 6 characters...')}
            required
          />

          <Input
            label={tText('Xác nhận mật khẩu mới', 'Confirm New Password')}
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={tText('Nhập lại mật khẩu mới...', 'Re-enter new password...')}
            required
          />

          <div className="flex justify-end pt-2">
            <Button variant="outline" size="sm" type="submit">
              {tText('Cập nhật mật khẩu', 'Update Password')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
