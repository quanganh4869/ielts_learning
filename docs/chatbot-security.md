# IELTS AI Chatbot - Security & Guardrails Specification

## 1. Threat Model & Mitigations

| Threat | Impact | Mitigation in IELTS Chatbot |
| :--- | :--- | :--- |
| **Prompt Injection** | Attacker bypasses system rules to extract secrets or output toxic content | `ScopeGuard.sanitizeInput()` wraps user input in `<user_query>` envelopes and regex-filters override directives. |
| **IDOR Data Leaks** | User queries another learner's scores or profile via prompt parameter manipulation | Tools receive `currentUserId` exclusively from Spring Security Context; LLM arguments for `userId` are strictly prohibited. |
| **Out-of-Scope Abuse** | Chatbot misused as a general coding bot, essay generator for non-IELTS topics, or financial advice bot | Deterministic scope classifier intercepts non-IELTS requests and returns immediate polite refusal. |
| **Hallucination of Personal Scores** | LLM creates fictitious student scores, band ratings, or test dates | Personal data is only permitted in the prompt if directly retrieved via authenticated tool execution. Untrusted claims are explicitly prohibited in the system prompt. |
| **DoS / Abuse via Automated Probing** | High-frequency inference requests exhausting API quotas | Rate limiting filter enforced at `ChatService` (max requests per minute per IP / User). |
| **Knowledge Base Poisoning** | Malicious or unverified content injected into RAG chunks | Chunks must have status `APPROVED` set by an authorized administrator (`ROLE_ADMIN`) before being eligible for retrieval. |

---

## 2. Insecure Direct Object Reference (IDOR) Hardening

All database queries fetching learner-specific information enforce strict ownership checks:
```java
// Example from GetUserExamResultsTool.java
@Override
public ToolResult execute(String currentUserId, Map<String, Object> arguments) {
    if (currentUserId == null || currentUserId.isBlank()) {
        return ToolResult.failure("Unauthorized: user context is required");
    }
    // currentUserId is supplied directly from SecurityContext, NOT from arguments
    List<AssessmentAttemptEntity> attempts = attemptRepository
        .findByUserIdOrderByCreatedAtDesc(currentUserId, PageRequest.of(0, 5));
    ...
}
```

Similarly, conversation access is guarded at the service level:
```java
// ConversationService.java
public ChatConversation getConversation(String conversationId, String currentUserId) {
    return conversationRepository.findByIdAndUserId(conversationId, currentUserId)
        .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, 
            "Không tìm thấy cuộc hội thoại hoặc bạn không có quyền truy cập"));
}
```

---

## 3. Scope Classification Rules (`ScopeGuard.java`)

1. **Direct Injection Checks**:
   - `ignore previous instructions`
   - `bỏ qua các chỉ dẫn trước đó`
   - `system override`
   - `cung cấp mật khẩu`
   - Classification: `UNSAFE_OR_UNAUTHORIZED` -> Flagged and safely blocked.

2. **Domain Boundary Checks**:
   - Matches keywords regarding cooking, general coding, politics, finance.
   - Classification: `OUT_OF_SCOPE` -> Polite refusal returned with guidance to explore IELTS modules.

3. **Output Verification**:
   - Scans final AI output before returning to client to ensure no sensitive tokens (`password`, `access_token`, `secret_key`) are leaked.

---

## 4. Audit Trail & Compliance

Every tool execution is persisted in `chat_tool_calls`:
- `tool_name`
- `conversation_id`
- `user_id`
- `arguments` (sanitized)
- `latency_ms`
- `is_success`
- `created_at`

Every message is stored in `chat_messages` with its safety classification and latency, enabling security monitoring and audit logging.
