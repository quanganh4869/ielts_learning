package com.ielts.platform.chatbot.application;

import com.ielts.platform.chatbot.domain.ChatConversation;
import com.ielts.platform.chatbot.domain.ChatMessage;
import com.ielts.platform.chatbot.repository.ChatConversationRepository;
import com.ielts.platform.chatbot.repository.ChatMessageRepository;
import com.ielts.platform.common.BusinessException;
import com.ielts.platform.common.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ConversationService {

    private final ChatConversationRepository conversationRepository;
    private final ChatMessageRepository messageRepository;

    @Transactional
    public ChatConversation createConversation(String userId, String initialTitle) {
        String title = (initialTitle != null && !initialTitle.isBlank()) ? initialTitle.trim() : "Hội thoại IELTS mới";
        if (title.length() > 200) title = title.substring(0, 200);

        ChatConversation conv = ChatConversation.builder()
                .id("conv_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16))
                .userId(userId)
                .title(title)
                .archived(false)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        return conversationRepository.save(conv);
    }

    public Page<ChatConversation> getUserConversations(String userId, Pageable pageable) {
        return conversationRepository.findByUserIdAndArchivedFalseOrderByUpdatedAtDesc(userId, pageable);
    }

    public ChatConversation getConversation(String conversationId, String userId) {
        return conversationRepository.findByIdAndUserId(conversationId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy cuộc hội thoại hoặc bạn không có quyền truy cập"));
    }

    @Transactional
    public ChatConversation updateTitle(String conversationId, String newTitle, String userId) {
        ChatConversation conv = getConversation(conversationId, userId);
        String title = (newTitle != null && !newTitle.isBlank()) ? newTitle.trim() : "Hội thoại IELTS";
        if (title.length() > 200) title = title.substring(0, 200);
        conv.setTitle(title);
        return conversationRepository.save(conv);
    }

    @Transactional
    public void deleteConversation(String conversationId, String userId) {
        ChatConversation conv = getConversation(conversationId, userId);
        conv.setArchived(true);
        conversationRepository.save(conv);
        log.info("Archived conversation {} for user {}", conversationId, userId);
    }

    public Page<ChatMessage> getConversationMessages(String conversationId, String userId, Pageable pageable) {
        // IDOR check: Verify user owns this conversation
        getConversation(conversationId, userId);
        return messageRepository.findByConversationIdOrderByCreatedAtDesc(conversationId, pageable);
    }
}
