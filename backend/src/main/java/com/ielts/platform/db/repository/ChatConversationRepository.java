package com.ielts.platform.db.repository;

import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.ielts.platform.db.model.ChatConversation;

@Repository
public interface ChatConversationRepository extends JpaRepository<ChatConversation, String> {

    Page<ChatConversation> findByUserIdAndArchivedFalseOrderByUpdatedAtDesc(String userId, Pageable pageable);

    Optional<ChatConversation> findByIdAndUserId(String id, String userId);

    long countByUserIdAndArchivedFalse(String userId);
}
