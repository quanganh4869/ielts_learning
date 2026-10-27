import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  Send,
  Plus,
  Trash2,
  MessageSquare,
  Sparkles,
  BookOpen,
  ShieldCheck,
  RefreshCw,
  PanelLeftClose,
  PanelLeftOpen,
  Cpu,
} from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { chatService } from '@/services/chatService'
import { TutorMessage, TutorSession, ChatSuggestion, ChatStatus } from '@/types/aiTutor'
import { useLanguage } from '@/context/LanguageContext'
import { MarkdownRenderer } from '@/components/common/MarkdownRenderer'
import { cn } from '@/utils/cn'

export const AiTutorPage: React.FC = () => {
  const { t, tText, language } = useLanguage()

  // State
  const [conversations, setConversations] = useState<TutorSession[]>([])
  const [activeConvId, setActiveConvId] = useState<string | null>(null)
  const [messages, setMessages] = useState<TutorMessage[]>([])
  const [inputVal, setInputVal] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [suggestions, setSuggestions] = useState<ChatSuggestion[]>([])
  const [chatStatus, setChatStatus] = useState<ChatStatus | null>(null)

  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const defaultGreeting: TutorMessage = {
    id: 'init-tutor-greeting',
    role: 'assistant',
    content:
      language === 'en'
        ? 'Hello! I am your dedicated IELTS Academic Tutor. I can assist you with test-taking strategies, vocabulary precision, grammar corrections, question explanations, and personal study insights.\n\nHow can I help you excel today?'
        : 'Xin chào! Tôi là Trợ lý Học thuật IELTS chuyên sâu của bạn. Tôi sẵn sàng hỗ trợ bạn về chiến thuật làm bài, từ vựng học thuật, ngữ pháp nâng cao, giải thích đề thi và tra cứu tiến độ học tập của bạn.\n\nHôm nay bạn muốn cùng tôi rèn luyện phần nào?',
    timestamp: 'Just now',
    suggestedFollowUps:
      language === 'en'
        ? [
            'Band 7.0+ vocabulary for Education & Environment',
            'How to distinguish TRUE vs NOT GIVEN in Reading',
            'Summarize my recent IELTS practice progress',
          ]
        : [
            'Từ vựng Band 7.0+ chủ đề Môi trường và Giáo dục',
            'Mẹo phân biệt TRUE và NOT GIVEN trong Reading',
            'Tổng kết kết quả luyện thi gần đây của tôi',
          ],
  }

  // Load conversations and suggestions on mount
  const loadConversations = useCallback(async () => {
    try {
      const res = await chatService.getConversations(0, 30)
      setConversations(res.items)
      if (res.items.length > 0 && !activeConvId) {
        selectConversation(res.items[0].id)
      } else if (res.items.length === 0) {
        setMessages([defaultGreeting])
      }
    } catch {
      setMessages([defaultGreeting])
    }
  }, [activeConvId])

  useEffect(() => {
    loadConversations()
    chatService.getSuggestions().then(setSuggestions).catch(() => {})
    chatService.getStatus().then(setChatStatus).catch(() => {})
  }, [])

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  // Select a conversation and load its messages
  const selectConversation = async (convId: string) => {
    setActiveConvId(convId)
    setIsLoading(true)
    try {
      const msgs = await chatService.getMessages(convId, 0, 50)
      if (msgs.length === 0) {
        setMessages([defaultGreeting])
      } else {
        setMessages(msgs)
      }
    } catch {
      setMessages([defaultGreeting])
    } finally {
      setIsLoading(false)
    }
  }

  // Create new conversation
  const handleCreateNewChat = async () => {
    setIsLoading(true)
    try {
      const title =
        language === 'en'
          ? `IELTS Session ${conversations.length + 1}`
          : `Buổi học IELTS ${conversations.length + 1}`
      const newConv = await chatService.createConversation(title)
      setConversations((prev) => [newConv, ...prev])
      setActiveConvId(newConv.id)
      setMessages([defaultGreeting])
    } catch (err: any) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // Delete conversation
  const handleDeleteConversation = async (e: React.MouseEvent, convId: string) => {
    e.stopPropagation()
    try {
      await chatService.deleteConversation(convId)
      const filtered = conversations.filter((c) => c.id !== convId)
      setConversations(filtered)
      if (activeConvId === convId) {
        if (filtered.length > 0) {
          selectConversation(filtered[0].id)
        } else {
          setActiveConvId(null)
          setMessages([defaultGreeting])
        }
      }
    } catch (err: any) {
      console.error(err)
    }
  }

  // Send message
  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputVal).trim()
    if (!text || isLoading) return

    const userMsg: TutorMessage = {
      id: 'usr-' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    setInputVal('')
    setIsLoading(true)

    try {
      let currentConvId = activeConvId
      if (!currentConvId) {
        const title = text.slice(0, 32)
        const newConv = await chatService.createConversation(title)
        setConversations((prev) => [newConv, ...prev])
        currentConvId = newConv.id
        setActiveConvId(newConv.id)
      }

      const response = await chatService.sendMessage(currentConvId, text)
      setMessages((prev) => [...prev, response])
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          role: 'assistant',
          content:
            err?.message ||
            (language === 'en'
              ? 'Sorry, I encountered an issue generating a response. Please try again.'
              : 'Xin lỗi bạn, đã xảy ra lỗi trong quá trình xử lý câu hỏi. Vui lòng thử lại.'),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const activeTitle = conversations.find((c) => c.id === activeConvId)?.title

  return (
    <div className="space-y-4 max-w-7xl mx-auto h-[calc(100vh-140px)] flex flex-col">
      <div className="flex items-center justify-between">
        <PageHeader
          title={t('aitutor.title')}
          description={t('aitutor.desc')}
        />
        {chatStatus && (
          <div className="hidden sm:flex items-center gap-2 text-xs text-[#68727D] bg-white border border-[#E3E7EB] px-3 py-1.5 rounded-full shadow-2xs">
            <Cpu className="w-3.5 h-3.5 text-[#28665F]" />
            <span>
              {chatStatus.activeProvider.toUpperCase()} ({chatStatus.modelName})
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </div>
        )}
      </div>

      {/* MAIN CONTAINER */}
      <Card
        padding="none"
        className="flex-1 bg-white border border-[#E3E7EB] rounded-2xl flex overflow-hidden shadow-xs min-h-0"
      >
        {/* SIDEBAR: CONVERSATION LIST */}
        <div
          className={cn(
            'border-r border-[#E3E7EB] bg-[#F7F8FA] flex flex-col transition-all duration-200 shrink-0',
            isSidebarOpen ? 'w-64 sm:w-72' : 'w-0 border-r-0 overflow-hidden'
          )}
        >
          {/* SIDEBAR HEADER */}
          <div className="p-3 border-b border-[#E3E7EB] flex items-center justify-between">
            <h3 className="font-extrabold text-xs text-[#20272E] uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-[#28665F]" />
              {tText('Lịch sử hội thoại', 'Conversations')}
            </h3>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1 rounded-lg text-[#68727D] hover:bg-black/5"
              title={tText('Thu gọn danh sách', 'Collapse sidebar')}
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          {/* NEW CHAT BUTTON */}
          <div className="p-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCreateNewChat}
              disabled={isLoading}
              className="w-full justify-center gap-2 bg-white hover:bg-[#EAF3F1] border-[#28665F]/30 text-[#28665F] font-bold text-xs shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              {tText('Cuộc trò chuyện mới', 'New Chat')}
            </Button>
          </div>

          {/* SESSIONS LIST */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#9AA4AF]">
                {tText('Chưa có cuộc trò chuyện nào.', 'No conversations yet.')}
              </div>
            ) : (
              conversations.map((c) => {
                const isActive = c.id === activeConvId
                return (
                  <div
                    key={c.id}
                    onClick={() => selectConversation(c.id)}
                    className={cn(
                      'group flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs transition-colors',
                      isActive
                        ? 'bg-white text-[#28665F] font-bold shadow-2xs border border-[#28665F]/20'
                        : 'text-[#505D68] hover:bg-white/70 font-medium'
                    )}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <MessageSquare className={cn('w-3.5 h-3.5 shrink-0', isActive ? 'text-[#28665F]' : 'text-[#9AA4AF]')} />
                      <span className="truncate">{c.title || tText('Hội thoại IELTS', 'IELTS Chat')}</span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteConversation(e, c.id)}
                      title={tText('Xóa cuộc trò chuyện', 'Delete')}
                      className="opacity-0 group-hover:opacity-100 p-1 text-[#9AA4AF] hover:text-red-500 rounded-md transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* CHAT AREA */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          {/* CHAT HEADER */}
          <div className="px-4 py-3 border-b border-[#E3E7EB] flex items-center justify-between shrink-0 bg-white">
            <div className="flex items-center gap-2.5">
              {!isSidebarOpen && (
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-1.5 rounded-lg text-[#68727D] hover:bg-[#F7F8FA] border border-[#E3E7EB]"
                  title={tText('Mở danh sách hội thoại', 'Open sidebar')}
                >
                  <PanelLeftOpen className="w-4 h-4" />
                </button>
              )}
              <div className="w-8 h-8 rounded-full bg-[#EAF3F1] border border-[#28665F]/20 flex items-center justify-center shrink-0">
                <img src="/brand/nori-mascot-sm.png" alt="Tutor" className="w-5 h-5 object-contain" />
              </div>
              <div>
                <h2 className="font-extrabold text-sm text-[#20272E] leading-none">
                  {activeTitle || tText('IELTS AI Academic Tutor', 'IELTS AI Academic Tutor')}
                </h2>
                <span className="text-[10px] text-[#28665F] font-bold flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  {tText('Phạm vi IELTS chuẩn xác & Không suy diễn', 'Strict IELTS & Zero-hallucination')}
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCreateNewChat}
              disabled={isLoading}
              className="hidden sm:inline-flex text-xs h-8"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              {tText('Đổi chủ đề', 'New Topic')}
            </Button>
          </div>

          {/* MESSAGES SCROLL AREA */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#F7F8FA]">
            {messages.map((msg) => {
              const isUser = msg.role === 'user'

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={cn(
                      'flex items-start gap-2.5 max-w-[92%] sm:max-w-[80%]',
                      isUser ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {!isUser && (
                      <div className="w-7 h-7 rounded-lg bg-[#EAF3F1] border border-[#28665F]/20 flex items-center justify-center shrink-0 mt-1 shadow-2xs">
                        <img src="/brand/nori-mascot-sm.png" alt="Tutor" className="w-5 h-5 object-contain" />
                      </div>
                    )}

                    <div
                      className={cn(
                        'rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-2xs',
                        isUser
                          ? 'bg-[#28665F] text-white rounded-br-xs'
                          : 'bg-white border border-[#E3E7EB] text-[#20272E] rounded-bl-xs'
                      )}
                    >
                      <MarkdownRenderer content={msg.content} />

                      {/* VERIFIED CITATIONS */}
                      {!isUser && msg.citations && msg.citations.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-gray-100 flex flex-wrap gap-1.5">
                          <span className="text-[10px] text-[#68727D] font-bold flex items-center gap-1 w-full">
                            <BookOpen className="w-3 h-3 text-[#28665F]" />
                            {tText('Nguồn tham khảo đã được xác minh:', 'Verified Citations & Tool Invocations:')}
                          </span>
                          {msg.citations.map((c, idx) => (
                            <div
                              key={idx}
                              className="text-[11px] bg-[#EAF3F1] text-[#28665F] font-semibold px-2.5 py-1 rounded-md border border-[#28665F]/20 flex items-center gap-1.5"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-[#28665F]" />
                              <span>{c.title}</span>
                              {c.section && <span className="text-[10px] opacity-75">({c.section})</span>}
                            </div>
                          ))}
                        </div>
                      )}

                      <span
                        className={cn(
                          'text-[9px] block mt-2 font-medium',
                          isUser ? 'text-white/70 text-right' : 'text-[#9AA4AF]'
                        )}
                      >
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>

                  {/* SUGGESTED FOLLOW UPS UNDER ASSISTANT MESSAGE */}
                  {!isUser && msg.suggestedFollowUps && (
                    <div className="flex flex-wrap gap-1.5 mt-2 pl-9 max-w-[85%]">
                      {msg.suggestedFollowUps.map((prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(prompt)}
                          className="text-xs px-3 py-1.5 rounded-xl bg-white border border-[#E3E7EB] text-[#28665F] font-medium hover:bg-[#EAF3F1] transition-colors text-left shadow-2xs cursor-pointer"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}

            {/* SUGGESTIONS PILLS FOR FRESH CHAT */}
            {messages.length === 1 && suggestions.length > 0 && (
              <div className="pt-2 pl-9">
                <span className="text-xs font-bold text-[#68727D] block mb-2 uppercase tracking-wide">
                  {tText('Câu hỏi mẫu được đề xuất:', 'Recommended Questions:')}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-2xl">
                  {suggestions.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleSend(s.prompt)}
                      className="p-3 text-left rounded-xl bg-white hover:bg-[#EAF3F1] border border-[#E3E7EB] hover:border-[#28665F]/40 transition-colors shadow-2xs group cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#28665F] mb-1">
                        <Sparkles className="w-3.5 h-3.5 text-[#28665F] group-hover:scale-110 transition-transform" />
                        <span>{s.title}</span>
                      </div>
                      <p className="text-[11px] text-[#68727D] line-clamp-2">{s.prompt}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isLoading && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-white border border-[#E3E7EB] text-xs text-[#68727D] w-fit shadow-2xs ml-9">
                <RefreshCw className="w-3.5 h-3.5 text-[#28665F] animate-spin" />
                <span>{tText('AI Tutor đang phân tích kiến thức và dữ liệu...', 'AI Tutor is retrieving data and formulating response...')}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT COMPOSER */}
          <div className="p-4 bg-white border-t border-[#E3E7EB] flex items-center gap-3 shrink-0">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('aitutor.placeholder')}
              className="flex-1 h-11 px-4 rounded-xl bg-[#F7F8FA] border border-[#E3E7EB] text-sm text-[#20272E] placeholder:text-[#9AA4AF] focus:outline-none focus:border-[#28665F] focus:bg-white transition-colors"
            />
            <Button
              variant="primary"
              size="md"
              className="h-11 px-5"
              disabled={!inputVal.trim() || isLoading}
              onClick={() => handleSend()}
              title={t('aitutor.send')}
            >
              <Send className="w-4 h-4 mr-1.5" />
              <span>{tText('Gửi', 'Send')}</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
