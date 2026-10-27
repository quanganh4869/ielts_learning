# IELTS AI Chatbot - REST API Specification

**Base Path**: `/api/v1/chat`  
**Authentication**: Bearer JWT via Supabase Auth (Header: `Authorization: Bearer <token>`)

---

## 1. Public Endpoints (No Auth Required)

### 1.1 Get Suggestions
- **Endpoint**: `GET /api/v1/chat/suggestions`
- **Description**: Returns approved, recommended IELTS prompts and sample questions across different skill bands.
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "sug-1",
      "category": "WRITING",
      "title": "Tiêu chí Lexical Resource",
      "prompt": "Tiêu chí chấm điểm Lexical Resource trong Writing Task 2 gồm những gì?"
    },
    {
      "id": "sug-2",
      "category": "READING",
      "title": "Mẹo True / False / Not Given",
      "prompt": "Làm thế nào để phân biệt chắc chắn giữa FALSE và NOT GIVEN?"
    }
  ]
}
```

### 1.2 Get Chatbot System Status
- **Endpoint**: `GET /api/v1/chat/status`
- **Description**: Healthcheck returning current provider, active model, and count of indexed knowledge chunks.
- **Response**:
```json
{
  "success": true,
  "data": {
    "status": "HEALTHY",
    "activeProvider": "openai",
    "configured": true,
    "modelName": "gpt-4o-mini",
    "availableTools": [
      "getUserStudyProfile",
      "getUserExamResults",
      "getUserSkillProgress",
      "getUserVocabulary",
      "getUserPracticeHistory",
      "searchPlatformLessons",
      "getPlatformGuide"
    ],
    "approvedKnowledgeChunks": 4
  }
}
```

---

## 2. Authenticated Chat Endpoints

### 2.1 Create Conversation
- **Endpoint**: `POST /api/v1/chat/conversations`
- **Request Body**:
```json
{
  "title": "Luyện Writing Task 2"
}
```
- **Response**:
```json
{
  "success": true,
  "data": {
    "id": "c7f93ad4-42b7-4c7b-a312-32b0d0c3f568",
    "userId": "sb-user-uuid",
    "title": "Luyện Writing Task 2",
    "messageCount": 0,
    "createdAt": "2026-10-28T00:15:30Z",
    "updatedAt": "2026-10-28T00:15:30Z"
  }
}
```

### 2.2 List User Conversations
- **Endpoint**: `GET /api/v1/chat/conversations?page=0&size=20`
- **Response**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "c7f93ad4-42b7-4c7b-a312-32b0d0c3f568",
        "title": "Luyện Writing Task 2",
        "messageCount": 4,
        "createdAt": "2026-10-28T00:15:30Z",
        "updatedAt": "2026-10-28T00:20:12Z"
      }
    ],
    "pageNumber": 0,
    "pageSize": 20,
    "totalElements": 1,
    "totalPages": 1
  }
}
```

### 2.3 Send Message to Conversation
- **Endpoint**: `POST /api/v1/chat/conversations/{conversationId}/messages`
- **Request Body**:
```json
{
  "message": "Điểm kiểm tra gần đây của tôi là bao nhiêu và tôi cần cải thiện kỹ năng gì?"
}
```
- **Response**:
```json
{
  "success": true,
  "data": {
    "messageId": "msg-992144",
    "conversationId": "c7f93ad4-42b7-4c7b-a312-32b0d0c3f568",
    "role": "assistant",
    "content": "Dựa trên kết quả bài thi gần nhất của bạn vào ngày 26/10/2026, bạn đạt Overall 6.5 (Listening: 7.0, Reading: 6.5, Writing: 6.0, Speaking: 6.0)...",
    "latencyMs": 850,
    "status": "SAFE_ANSWER",
    "citations": [
      {
        "type": "USER_DATA",
        "title": "Kết quả bài thi gần nhất",
        "source": "Hồ sơ cá nhân: getUserExamResults"
      },
      {
        "type": "KNOWLEDGE_BASE",
        "title": "IELTS Academic Writing Criteria",
        "source": "Cambridge IELTS Official Guide",
        "section": "Band Descriptors"
      }
    ],
    "createdAt": "2026-10-28T00:21:00Z"
  }
}
```

### 2.4 Delete Conversation
- **Endpoint**: `DELETE /api/v1/chat/conversations/{conversationId}`
- **Response**:
```json
{
  "success": true,
  "data": null
}
```

---

## 3. Admin Knowledge Management Endpoints (`ROLE_ADMIN`)

- **Create Knowledge Document**: `POST /api/v1/admin/knowledge/documents`
- **List Documents**: `GET /api/v1/admin/knowledge/documents`
- **Add Document Chunk**: `POST /api/v1/admin/knowledge/documents/{documentId}/chunks`
- **Approve Chunk**: `PUT /api/v1/admin/knowledge/chunks/{chunkId}/approve`
- **Reject Chunk**: `PUT /api/v1/admin/knowledge/chunks/{chunkId}/reject`
