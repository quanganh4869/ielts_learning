import React, { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { apiService } from '@/services/apiService'
import { TutorMessage } from '@/types/aiTutor'
import { useLanguage } from '@/context/LanguageContext'

export const AiTutorPage: React.FC = () => {
  const { t, tText, language } = useLanguage()

  const getInitialMessage = (): TutorMessage => ({
    id: 'init-1',
    role: 'assistant',
    content: t('aitutor.initial_msg'),
    timestamp: '10:00',
    suggestedFollowUps: [
      t('aitutor.followup_1'),
      t('aitutor.followup_2'),
      t('aitutor.followup_3'),
    ],
  })

  const [messages, setMessages] = useState<TutorMessage[]>([getInitialMessage()])
  const [inputVal, setInputVal] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  // Update initial message if language changes and user hasn't started chatting yet
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'init-1') {
        return [getInitialMessage()]
      }
      return prev
    })
  }, [language])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

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
    <div className="space-y-4 max-w-4xl mx-auto h-[calc(100vh-160px)] flex flex-col">
      <PageHeader
        title={t('aitutor.title')}
        description={t('aitutor.desc')}
      />

      {/* CHAT CONTAINER */}
      <Card
        padding="none"
        className="flex-1 bg-white border border-[#E3E7EB] rounded-2xl flex flex-col overflow-hidden shadow-xs min-h-0"
      >
        {/* MESSAGES SCROLL AREA */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user'

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div className={`flex items-start gap-2.5 max-w-[85%] sm:max-w-[75%] ${isUser ? 'justify-end' : 'justify-start'}`}>
                  {!isUser && (
                    <div className="w-7 h-7 rounded-lg bg-[#EAF3F1] border border-[#28665F]/20 flex items-center justify-center shrink-0 mt-1 overflow-hidden shadow-2xs">
                      <img src="/brand/nori-mascot-sm.png" alt="Tutor" className="w-5 h-5 object-contain" />
                    </div>
                  )}
                  <div
                    className={`rounded-2xl p-4 text-sm leading-relaxed ${
                      isUser
                        ? 'bg-[#28665F] text-white rounded-br-xs'
                        : 'bg-[#F7F8FA] border border-[#E3E7EB] text-[#20272E] rounded-bl-xs'
                    }`}
                  >
                    <div className="whitespace-pre-wrap space-y-2">
                      {msg.content}
                    </div>
                    <span
                      className={`text-[10px] block mt-1.5 ${
                        isUser ? 'text-white/70 text-right' : 'text-[#68727D]'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>

                {/* SUGGESTED FOLLOW UPS UNDER ASSISTANT MESSAGE */}
                {!isUser && msg.suggestedFollowUps && (
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-[85%]">
                    {msg.suggestedFollowUps.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(prompt)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-white border border-[#E3E7EB] text-[#28665F] hover:bg-[#EAF3F1] transition-colors text-left font-medium"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          {isLoading && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[#F7F8FA] border border-[#E3E7EB] text-xs text-[#68727D] w-fit">
              <div className="w-3.5 h-3.5 border-2 border-[#28665F] border-t-transparent rounded-full animate-spin" />
              <span>{tText('AI Tutor đang soạn câu trả lời...', 'AI Tutor is drafting a response...')}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* INPUT COMPOSER */}
        <div className="p-4 bg-white border-t border-[#E3E7EB] flex items-center gap-3">
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
            className="h-11 px-4"
            disabled={!inputVal.trim() || isLoading}
            onClick={() => handleSend()}
            title={t('aitutor.send')}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  )
}
