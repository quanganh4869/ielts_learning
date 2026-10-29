package com.ielts.platform.schemas.chatbot;

import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationDto {
    private String id;
    private String title;
    private Instant createdAt;
    private Instant updatedAt;
    private long messageCount;
}
