export interface TutorMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  contextSnippet?: string
  suggestedFollowUps?: string[]
}

export interface TutorSession {
  id: string
  title: string
  updatedAt: string
  messages: TutorMessage[]
  topicContext?: string
}
