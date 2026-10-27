package com.ielts.platform.chatbot.repository;

import com.ielts.platform.chatbot.domain.ChatToolCall;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatToolCallRepository extends JpaRepository<ChatToolCall, String> {

    List<ChatToolCall> findByMessageId(String messageId);
}
