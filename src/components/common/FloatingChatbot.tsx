import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  X,
  Send,
  Sparkles,
  Maximize2,
  RefreshCw,
  BookOpen,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react'
import { chatService } from '@/services/chatService'
import { TutorMessage, ChatSuggestion } from '@/types/aiTutor'
import { useLanguage } from '@/context/LanguageContext'
import { cn } from '@/utils/cn'
import { MarkdownRenderer } from './MarkdownRenderer'

export const FloatingChatbot: React.FC = () => {
  const { tText, language } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [inputVal, setInputVal] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<ChatSuggestion[]>([])
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const defaultGreeting: TutorMessage = {
    id: 'floating-init',
    role: 'assistant',
    content:
      language === 'en'
        ? 'Hello! I am your 24/7 IELTS AI Tutor. Feel free to ask about grammar rules, vocabulary collocations, band criteria, or your personal study progress!'
        : 'Xin chào! Tôi là Trợ lý AI IELTS chuyên sâu 24/7. Bạn có thể hỏi về từ vựng, ngữ pháp, tiêu chí chấm thi, hoặc tra cứu tiến độ học tập của mình nhé!',
    timestamp: 'Just now',
    suggestedFollowUps:
      language === 'en'
        ? [
            'How are Lexical Resource band scores calculated?',
            'Tips for TRUE / FALSE / NOT GIVEN in Reading',
            'Summarize my recent IELTS practice progress',
          ]
        : [
            'Tiêu chí chấm điểm Lexical Resource trong Writing?',
            'Mẹo phân biệt TRUE, FALSE và NOT GIVEN trong Reading',
            'Thống kê tiến độ luyện thi gần đây của tôi',
          ],
  }

  const [messages, setMessages] = useState<TutorMessage[]>([defaultGreeting])

  // Load suggestions when opened
  useEffect(() => {
    if (isOpen && suggestions.length === 0) {
      chatService
        .getSuggestions()
        .then((data) => {
          if (data && data.length > 0) {
            setSuggestions(data)
          }
        })
        .catch(() => {
          // Graceful fallback to default followups
        })
    }
  }, [isOpen, suggestions.length])

  // Update greeting when language changes if no user interaction yet
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'floating-init') {
        return [defaultGreeting]
      }
      return prev
    })
  }, [language])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isLoading, isOpen])

  const handleStartNewChat = async () => {
    setIsLoading(true)
    try {
      const conv = await chatService.createConversation('Floating Chat')
      setConversationId(conv.id)
      setMessages([defaultGreeting])
    } catch {
      setMessages([defaultGreeting])
      setConversationId(null)
    } finally {
      setIsLoading(false)
    }
  }

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
      let activeConvId = conversationId
      if (!activeConvId) {
        try {
          const newConv = await chatService.createConversation(text.slice(0, 30))
          activeConvId = newConv.id
          setConversationId(newConv.id)
        } catch {
          // continue with fallback
        }
      }

      if (activeConvId) {
        const response = await chatService.sendMessage(activeConvId, text)
        setMessages((prev) => [...prev, response])
      } else {
        // Fallback message
        setMessages((prev) => [
          ...prev,
          {
            id: 'err-' + Date.now(),
            role: 'assistant',
            content:
              language === 'en'
                ? 'Unable to establish a secure session with the AI backend. Please check your login status or try again.'
                : 'Không thể kết nối phiên bảo mật với hệ thống AI. Vui lòng đăng nhập hoặc kiểm tra kết nối mạng.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ])
      }
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
              : 'Xin lỗi bạn, đã có lỗi kết nối khi xử lý câu trả lời. Vui lòng thử lại nhé.'),
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

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* CHATBOT POPUP WINDOW */}
      {isOpen && (
        <div className="mb-3 w-[360px] sm:w-[410px] h-[560px] max-h-[85vh] bg-white border border-[#E3E7EB] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* HEADER */}
          <div className="bg-[#28665F] text-white p-3.5 flex items-center justify-between shrink-0 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-white/15 border border-white/30 flex items-center justify-center overflow-hidden">
                  <img
                    src="/brand/nori-mascot-sm.png"
                    alt="AI Tutor"
                    className="w-6 h-6 object-contain"
                  />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#28665F] rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm text-white leading-none">
                    IELTS AI Tutor
                  </h3>
                  <span className="text-[9px] bg-white/20 text-white font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-0.5">
                    <ShieldCheck className="w-2.5 h-2.5" />
                    Verified
                  </span>
                </div>
                <p className="text-[10.5px] text-white/80 mt-0.5">
                  {tText('Trợ lý học thuật chuyên sâu', 'Academic IELTS Assistant')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-white/85">
              <button
                onClick={handleStartNewChat}
                disabled={isLoading}
                title={tText('Bắt đầu cuộc trò chuyện mới', 'New conversation')}
                className="p-1.5 hover:bg-white/15 rounded-lg transition-colors text-white"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <Link
                to="/app/ai-tutor"
                onClick={() => setIsOpen(false)}
                title={tText('Mở toàn màn hình', 'Open full workspace')}
                className="p-1.5 hover:bg-white/15 rounded-lg transition-colors text-white"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                title={tText('Thu nhỏ', 'Minimize')}
                className="p-1.5 hover:bg-white/15 rounded-lg transition-colors text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* MESSAGES SCROLL CONTAINER */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-[#F7F8FA] text-xs">
            {messages.map((msg) => {
              const isUser = msg.role === 'user'

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={cn(
                      'max-w-[88%] rounded-2xl p-3 leading-relaxed shadow-2xs',
                      isUser
                        ? 'bg-[#28665F] text-white rounded-br-xs'
                        : 'bg-white border border-[#E3E7EB] text-[#20272E] rounded-bl-xs'
                    )}
                  >
                    <MarkdownRenderer content={msg.content} />

                    {/* CITATIONS LIST */}
                    {!isUser && msg.citations && msg.citations.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-gray-100 flex flex-wrap gap-1">
                        <span className="text-[10px] text-[#68727D] font-medium flex items-center gap-1 w-full">
                          <BookOpen className="w-3 h-3 text-[#28665F]" />
                          {tText('Nguồn tham khảo đã xác minh:', 'Verified Sources:')}
                        </span>
                        {msg.citations.map((c, cIdx) => (
                          <span
                            key={cIdx}
                            className="text-[10px] bg-[#EAF3F1] text-[#28665F] font-semibold px-2 py-0.5 rounded-md border border-[#28665F]/15"
                            title={c.section ? `${c.source} (${c.section})` : c.source}
                          >
                            {c.title}
                          </span>
                        ))}
                      </div>
                    )}

                    <span
                      className={`text-[9px] block mt-1.5 ${
                        isUser ? 'text-white/70 text-right' : 'text-[#9AA4AF]'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>

                  {/* QUICK SUGGESTIONS */}
                  {!isUser && msg.suggestedFollowUps && (
                    <div className="flex flex-col gap-1.5 mt-2 w-full max-w-[90%]">
                      {msg.suggestedFollowUps.map((prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(prompt)}
                          className="text-left text-[11px] p-2 rounded-xl bg-white hover:bg-[#EAF3F1] border border-[#E3E7EB] text-[#28665F] font-semibold transition-colors flex items-center gap-1.5 group shadow-2xs"
                        >
                          <Sparkles className="w-3 h-3 shrink-0 text-[#28665F] group-hover:scale-110 transition-transform" />
                          <span className="truncate">{prompt}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}

            {/* SUGGESTION PILLS IF ONLY GREETING EXISTS */}
            {messages.length === 1 && suggestions.length > 0 && (
              <div className="pt-1">
                <span className="text-[10px] uppercase font-bold text-[#68727D] tracking-wider block mb-1.5">
                  {tText('Gợi ý câu hỏi phổ biến:', 'Popular Questions:')}
                </span>
                <div className="flex flex-col gap-1.5">
                  {suggestions.slice(0, 3).map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleSend(s.prompt)}
                      className="text-left text-[11px] p-2 rounded-xl bg-white hover:bg-[#EAF3F1] border border-[#E3E7EB] text-[#28665F] font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
                    >
                      <Sparkles className="w-3 h-3 shrink-0 text-[#28665F]" />
                      <span className="truncate">{s.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isLoading && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-[#E3E7EB] text-[#68727D] w-fit shadow-2xs">
                <RefreshCw className="w-3.5 h-3.5 text-[#28665F] animate-spin" />
                <span className="text-[11px]">
                  {tText('AI Tutor đang soạn câu trả lời...', 'AI Tutor is thinking...')}
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT FORM */}
          <div className="p-3 bg-white border-t border-[#E3E7EB] flex items-center gap-2 shrink-0">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={tText('Hỏi về từ vựng, ngữ pháp, mẹo thi...', 'Ask about vocab, grammar, tips...')}
              className="flex-1 h-9 px-3 rounded-xl bg-[#F7F8FA] border border-[#E3E7EB] text-xs text-[#20272E] placeholder:text-[#9AA4AF] focus:outline-none focus:border-[#28665F] focus:bg-white transition-colors"
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputVal.trim() || isLoading}
              className="w-9 h-9 rounded-xl bg-[#28665F] hover:bg-[#20534D] disabled:opacity-40 text-white flex items-center justify-center transition-colors shrink-0 shadow-2xs cursor-pointer"
              title={tText('Gửi tin nhắn', 'Send')}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* FLOATING TRIGGER BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle IELTS AI Chatbot"
        className={cn(
          'group flex items-center gap-2.5 px-4 py-3 rounded-full shadow-lg border transition-all duration-300 focus:outline-none active:scale-95 cursor-pointer',
          isOpen
            ? 'bg-white text-[#28665F] border-[#E3E7EB] hover:bg-[#F7F8FA]'
            : 'bg-[#28665F] text-white border-[#28665F] hover:bg-[#20534D] hover:shadow-xl'
        )}
      >
        <div className="relative flex items-center justify-center">
          {isOpen ? (
            <X className="w-5 h-5 stroke-[2.5]" />
          ) : (
            <div className="relative">
              <img
                src="/brand/nori-mascot-sm.png"
                alt="AI Mascot"
                className="w-6 h-6 object-contain group-hover:scale-110 transition-transform"
              />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#28665F] rounded-full animate-pulse" />
            </div>
          )}
        </div>

        <span className="font-extrabold text-xs tracking-wide">
          {isOpen
            ? tText('Đóng Chatbot', 'Close Chat')
            : tText('Hỏi AI Tutor', 'AI Tutor')}
        </span>
      </button>
    </div>
  )
}
