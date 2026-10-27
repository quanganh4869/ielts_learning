import { supabase } from '@/services/supabase'
import { withCsrfHeaders } from '@/services/csrf'
import { TutorMessage, TutorSession, ChatSuggestion, ChatStatus } from '@/types/aiTutor'

const BACKEND_BASE_URL = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080') + '/api/v1'

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
  try {
    const { data } = await supabase.auth.getSession()
    if (data?.session?.access_token) {
      headers['Authorization'] = `Bearer ${data.session.access_token}`
    }
  } catch {
    // fallback without token in guest mode
  }
  return headers
}

async function requestApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method || 'GET').toUpperCase()
  let headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    headers = withCsrfHeaders(headers)
  }

  const res = await fetch(`${BACKEND_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  })

  const json = await res.json()
  if (!res.ok || json.success === false) {
    throw new Error(json.message || `Lỗi máy chủ (${res.status})`)
  }
  return json.data
}

export const chatService = {
  /**
   * Tạo cuộc hội thoại mới với AI Tutor
   */
  async createConversation(title?: string): Promise<TutorSession> {
    const data = await requestApi<{ id: string; title: string; createdAt: string; updatedAt: string }>('/chat/conversations', {
      method: 'POST',
      body: JSON.stringify({ title }),
    })
    return {
      id: data.id,
      title: data.title,
      updatedAt: data.updatedAt,
      messages: [],
    }
  },

  /**
   * Lấy danh sách hội thoại của người dùng
   */
  async getConversations(page = 0, size = 20): Promise<{ items: TutorSession[]; total: number }> {
    const data = await requestApi<{ items: any[]; totalElements: number }>(`/chat/conversations?page=${page}&size=${size}`)
    const items: TutorSession[] = (data.items || []).map((c) => ({
      id: c.id,
      title: c.title,
      updatedAt: c.updatedAt,
      messageCount: c.messageCount || 0,
      messages: [],
    }))
    return { items, total: data.totalElements }
  },

  /**
   * Lấy chi tiết một cuộc hội thoại
   */
  async getConversation(conversationId: string): Promise<TutorSession> {
    const data = await requestApi<{ id: string; title: string; updatedAt: string }>('/chat/conversations/' + conversationId)
    return {
      id: data.id,
      title: data.title,
      updatedAt: data.updatedAt,
      messages: [],
    }
  },

  /**
   * Lấy lịch sử tin nhắn của cuộc hội thoại
   */
  async getMessages(conversationId: string, page = 0, size = 50): Promise<TutorMessage[]> {
    const data = await requestApi<{ items: any[] }>(`/chat/conversations/${conversationId}/messages?page=${page}&size=${size}`)
    const rawList = data.items || []

    return rawList.map((m) => {
      let citations = undefined
      if (m.citations) {
        try {
          citations = typeof m.citations === 'string' ? JSON.parse(m.citations) : m.citations
        } catch {
          // ignore parsing error
        }
      }
      return {
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: m.content,
        timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: m.status,
        citations,
      }
    })
  },

  /**
   * Gửi câu hỏi vào hội thoại và nhận câu trả lời có nguồn trích dẫn
   */
  async sendMessage(conversationId: string, message: string): Promise<TutorMessage> {
    const data = await requestApi<{
      messageId: string
      conversationId: string
      role: 'assistant'
      content: string
      latencyMs: number
      status: string
      citations: any[]
      createdAt: string
    }>(`/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    })

    return {
      id: data.messageId,
      role: 'assistant',
      content: data.content,
      timestamp: new Date(data.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      citations: data.citations,
      status: data.status,
    }
  },

  /**
   * Xóa cuộc hội thoại
   */
  async deleteConversation(conversationId: string): Promise<void> {
    await requestApi(`/chat/conversations/${conversationId}`, { method: 'DELETE' })
  },

  /**
   * Lấy danh sách câu hỏi gợi ý chuẩn IELTS
   */
  async getSuggestions(): Promise<ChatSuggestion[]> {
    return requestApi<ChatSuggestion[]>('/chat/suggestions')
  },

  /**
   * Kiểm tra trạng thái AI Provider & Công cụ
   */
  async getStatus(): Promise<ChatStatus> {
    return requestApi<ChatStatus>('/chat/status')
  },
}
