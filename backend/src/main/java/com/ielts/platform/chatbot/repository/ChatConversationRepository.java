package com.ielts.platform.chatbot.repository;

import com.ielts.platform.chatbot.domain.ChatConversation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChatConversationRepository extends JpaRepository<ChatConversation, String> {

    Page<ChatConversation> findByUserIdAndArchivedFalseOrderByUpdatedAtDesc(String userId, Pageable pageable);

    Optional<ChatConversation> findByIdAndUserId(String id, String userId);

    long countByUserIdAndArchivedFalse(String userId);
}
