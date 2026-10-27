package com.ielts.platform.chatbot;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ielts.platform.chatbot.api.dto.ChatRequest;
import com.ielts.platform.chatbot.api.dto.CreateConversationRequest;
import com.ielts.platform.chatbot.domain.ChatConversation;
import com.ielts.platform.chatbot.repository.ChatConversationRepository;
import com.ielts.platform.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
class ChatbotIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ChatConversationRepository conversationRepository;

    private UserPrincipal userA;
    private UserPrincipal userB;

    @BeforeEach
    void setUp() {
        userA = UserPrincipal.builder()
                .id("usr_student_alpha")
                .email("student.alpha@ielts.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_USER")))
                .build();

        userB = UserPrincipal.builder()
                .id("usr_student_beta")
                .email("student.beta@ielts.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_USER")))
                .build();
    }

    @Test
    @DisplayName("Should successfully create conversation, send IELTS question, and fetch suggestions")
    void testCreateAndSendMessage() throws Exception {
        // 1. Create conversation for User A
        CreateConversationRequest createReq = CreateConversationRequest.builder()
                .title("Luyện tập Writing Task 2")
                .build();

        String convResponse = mockMvc.perform(post("/chat/conversations")
                        .with(user(userA))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").isNotEmpty())
                .andExpect(jsonPath("$.data.title").value("Luyện tập Writing Task 2"))
                .andReturn().getResponse().getContentAsString();

        String convId = objectMapper.readTree(convResponse).path("data").path("id").asText();

        // 2. Send IELTS Academic Question
        ChatRequest chatReq = ChatRequest.builder()
                .message("Cho tôi biết 4 tiêu chí chấm điểm của IELTS Writing Task 2 là gì?")
                .build();

        mockMvc.perform(post("/chat/conversations/" + convId + "/messages")
                        .with(user(userA))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(chatReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.conversationId").value(convId))
                .andExpect(jsonPath("$.data.role").value("assistant"))
                .andExpect(jsonPath("$.data.content").isNotEmpty())
                .andExpect(jsonPath("$.data.content", containsString("Writing")));

        // 3. Fetch Messages History
        mockMvc.perform(get("/chat/conversations/" + convId + "/messages")
                        .with(user(userA)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items", hasSize(greaterThanOrEqualTo(2))));
    }

    @Test
    @DisplayName("Should enforce IDOR protection: User B cannot access User A's conversation")
    void testIdorProtection() throws Exception {
        // Create conversation owned by User A
        ChatConversation convA = conversationRepository.save(ChatConversation.builder()
                .id("conv_alpha_secret")
                .userId(userA.getId())
                .title("Cuộc trò chuyện riêng của Alpha")
                .archived(false)
                .build());

        // User B attempts to read User A's conversation
        mockMvc.perform(get("/chat/conversations/" + convA.getId())
                        .with(user(userB)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));

        // User B attempts to send message to User A's conversation
        ChatRequest chatReq = ChatRequest.builder().message("Hack attempt").build();
        mockMvc.perform(post("/chat/conversations/" + convA.getId() + "/messages")
                        .with(user(userB))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(chatReq)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Should politely reject out-of-scope questions")
    void testOutOfScopeRefusal() throws Exception {
        ChatConversation conv = conversationRepository.save(ChatConversation.builder()
                .id("conv_scope_test")
                .userId(userA.getId())
                .title("Test Phạm Vi")
                .archived(false)
                .build());

        ChatRequest chatReq = ChatRequest.builder()
                .message("Dự báo thời tiết ngày mai ở Hà Nội có mưa không bạn?")
                .build();

        mockMvc.perform(post("/chat/conversations/" + conv.getId() + "/messages")
                        .with(user(userA))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(chatReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", containsString("IELTS Learning Platform")));
    }

    @Test
    @DisplayName("Should retrieve public suggestions and chatbot status")
    void testPublicSuggestionsAndStatus() throws Exception {
        mockMvc.perform(get("/chat/suggestions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(greaterThan(0))));

        mockMvc.perform(get("/chat/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.availableTools", hasSize(greaterThan(0))));
    }
}
