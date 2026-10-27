export interface CitationItem {
  type: string
  title: string
  source: string
  section?: string
}

export interface TutorMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  contextSnippet?: string
  suggestedFollowUps?: string[]
  citations?: CitationItem[]
  status?: string
}

export interface TutorSession {
  id: string
  title: string
  updatedAt: string
  messages: TutorMessage[]
  topicContext?: string
  messageCount?: number
}

export interface ChatSuggestion {
  id: string
  category: string
  title: string
  prompt: string
}

export interface ChatStatus {
  status: string
  activeProvider: string
  configured: boolean
  modelName: string
  availableTools: string[]
  approvedKnowledgeChunks: number
}
