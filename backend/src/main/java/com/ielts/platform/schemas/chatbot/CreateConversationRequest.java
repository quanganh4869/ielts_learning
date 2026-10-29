package com.ielts.platform.schemas.chatbot;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateConversationRequest {

    @Size(max = 200, message = "Tiêu đề hội thoại tối đa 200 ký tự")
    private String title;
}
