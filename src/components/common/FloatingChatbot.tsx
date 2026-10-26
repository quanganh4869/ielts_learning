import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  X,
  Send,
  Sparkles,
  Maximize2,
  RefreshCw,
} from 'lucide-react'
import { apiService } from '@/services/apiService'
import { TutorMessage } from '@/types/aiTutor'
import { useLanguage } from '@/context/LanguageContext'
import { cn } from '@/utils/cn'

export const FloatingChatbot: React.FC = () => {
  const { tText, language } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [inputVal, setInputVal] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const defaultGreeting: TutorMessage = {
    id: 'floating-init',
    role: 'assistant',
    content:
      language === 'en'
        ? 'Hello! I am your 24/7 IELTS AI Tutor. Feel free to ask about grammar rules, vocabulary collocations, or exam strategies!'
        : 'Xin chào! Tôi là Trợ lý AI IELTS đồng hành cùng bạn. Bạn muốn giải thích ngữ pháp, tra cứu từ vựng học thuật hay hỏi mẹo làm bài?',
    timestamp: 'Just now',
    suggestedFollowUps:
      language === 'en'
        ? [
            'Band 7.0+ vocabulary for Education',
            'How to use Inversion in Writing Task 2',
            'Tips for TRUE / FALSE / NOT GIVEN',
          ]
        : [
            'Gợi ý từ vựng 7.0+ chủ đề Environment',
            'Cách dùng cấu trúc đảo ngữ trong Writing',
            'Mẹo phân biệt TRUE và NOT GIVEN',
          ],
  }

  const [messages, setMessages] = useState<TutorMessage[]>([defaultGreeting])

  // Update greeting when language changes if no interaction yet
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
      const response = await apiService.sendTutorMessage(text)
      setMessages((prev) => [...prev, response])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          role: 'assistant',
          content:
            language === 'en'
              ? 'Sorry, I encountered an issue generating a response. Please try again.'
              : 'Xin lỗi bạn, đã có lỗi kết nối khi xử lý câu trả lời. Vui lòng thử lại nhé.',
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
        <div className="mb-3 w-[360px] sm:w-[390px] h-[520px] max-h-[82vh] bg-white border border-[#E3E7EB] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* HEADER */}
          <div className="bg-[#28665F] text-white p-4 flex items-center justify-between shrink-0 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-white/15 border border-white/30 flex items-center justify-center overflow-hidden">
                  <img
                    src="/brand/nori-mascot-sm.png"
                    alt="AI Tutor"
                    className="w-7 h-7 object-contain"
                  />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#28665F] rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm text-white leading-none">
                    IELTS AI Tutor
                  </h3>
                  <span className="text-[10px] bg-white/20 text-white font-semibold px-1.5 py-0.2 rounded-full">
                    24/7
                  </span>
                </div>
                <p className="text-[11px] text-white/80 mt-0.5">
                  {tText('Trợ lý học thuật trực tuyến', 'Online Academic Tutor')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-white/85">
              <Link
                to="/app/ai-tutor"
                onClick={() => setIsOpen(false)}
                title={tText('Mở toàn màn hình', 'Open full workspace')}
                className="p-1.5 hover:bg-white/15 rounded-lg transition-colors"
              >
                <Maximize2 className="w-4 h-4" />
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                title={tText('Thu nhỏ', 'Minimize')}
                className="p-1.5 hover:bg-white/15 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* MESSAGES SCROLL CONTAINER */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F7F8FA] text-xs">
            {messages.map((msg) => {
              const isUser = msg.role === 'user'

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={cn(
                      'max-w-[85%] rounded-2xl p-3 leading-relaxed',
                      isUser
                        ? 'bg-[#28665F] text-white rounded-br-xs'
                        : 'bg-white border border-[#E3E7EB] text-[#20272E] rounded-bl-xs shadow-2xs'
                    )}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    <span
                      className={`text-[9px] block mt-1 ${
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
                          className="text-left text-[11px] p-2 rounded-xl bg-white hover:bg-[#EAF3F1] border border-[#E3E7EB] text-[#28665F] font-semibold transition-colors flex items-center gap-1.5 group"
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
              placeholder={tText('Hỏi AI Tutor điều gì đó...', 'Ask AI Tutor anything...')}
              className="flex-1 h-9 px-3 rounded-xl bg-[#F7F8FA] border border-[#E3E7EB] text-xs text-[#20272E] placeholder:text-[#9AA4AF] focus:outline-none focus:border-[#28665F] focus:bg-white transition-colors"
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputVal.trim() || isLoading}
              className="w-9 h-9 rounded-xl bg-[#28665F] hover:bg-[#20534D] disabled:opacity-40 text-white flex items-center justify-center transition-colors shrink-0 shadow-2xs"
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
          'group flex items-center gap-2.5 px-4 py-3 rounded-full shadow-lg border transition-all duration-300 focus:outline-none active:scale-95',
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
