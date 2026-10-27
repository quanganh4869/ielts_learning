package com.ielts.platform.chatbot.api;

import com.ielts.platform.chatbot.api.dto.*;
import com.ielts.platform.chatbot.application.ChatService;
import com.ielts.platform.chatbot.application.ConversationService;
import com.ielts.platform.chatbot.domain.ChatConversation;
import com.ielts.platform.chatbot.domain.ChatMessage;
import com.ielts.platform.chatbot.infrastructure.ai.AIProviderFactory;
import com.ielts.platform.chatbot.repository.ChatMessageRepository;
import com.ielts.platform.chatbot.repository.KnowledgeChunkRepository;
import com.ielts.platform.chatbot.tools.ToolRegistry;
import com.ielts.platform.common.ApiResponse;
import com.ielts.platform.common.PageResponse;
import com.ielts.platform.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/chat")
@Tag(name = "AI Chatbot", description = "Enterprise IELTS AI Tutor & Conversational Assistance Endpoints")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final ConversationService conversationService;
    private final ChatMessageRepository messageRepository;
    private final ToolRegistry toolRegistry;
    private final KnowledgeChunkRepository knowledgeChunkRepository;
    private final AIProviderFactory aiProviderFactory;

    @PostMapping("/conversations")
    @Operation(summary = "Tạo cuộc hội thoại mới với Trợ lý AI")
    public ResponseEntity<ApiResponse<ConversationDto>> createConversation(
            @Valid @RequestBody(required = false) CreateConversationRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String title = (request != null) ? request.getTitle() : null;
        ChatConversation conv = conversationService.createConversation(principal.getId(), title);
        ConversationDto dto = ConversationDto.builder()
                .id(conv.getId())
                .title(conv.getTitle())
                .createdAt(conv.getCreatedAt())
                .updatedAt(conv.getUpdatedAt())
                .messageCount(0)
                .build();
        return ResponseEntity.ok(ApiResponse.ok(dto));
    }

    @GetMapping("/conversations")
    @Operation(summary = "Lấy danh sách các cuộc hội thoại của học viên")
    public ResponseEntity<ApiResponse<PageResponse<ConversationDto>>> getConversations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Page<ChatConversation> paged = conversationService.getUserConversations(
                principal.getId(), PageRequest.of(page, size));

        List<ConversationDto> dtos = paged.getContent().stream()
                .map(c -> ConversationDto.builder()
                        .id(c.getId())
                        .title(c.getTitle())
                        .createdAt(c.getCreatedAt())
                        .updatedAt(c.getUpdatedAt())
                        .messageCount(messageRepository.countByConversationId(c.getId()))
                        .build())
                .toList();

        PageResponse<ConversationDto> pageResp = PageResponse.<ConversationDto>builder()
                .items(dtos)
                .pageNumber(paged.getNumber())
                .pageSize(paged.getSize())
                .totalElements(paged.getTotalElements())
                .totalPages(paged.getTotalPages())
                .isFirst(paged.isFirst())
                .isLast(paged.isLast())
                .build();

        return ResponseEntity.ok(ApiResponse.ok(pageResp));
    }

    @GetMapping("/conversations/{conversationId}")
    @Operation(summary = "Xem chi tiết một cuộc hội thoại")
    public ResponseEntity<ApiResponse<ConversationDto>> getConversation(
            @PathVariable String conversationId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        ChatConversation c = conversationService.getConversation(conversationId, principal.getId());
        ConversationDto dto = ConversationDto.builder()
                .id(c.getId())
                .title(c.getTitle())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .messageCount(messageRepository.countByConversationId(c.getId()))
                .build();
        return ResponseEntity.ok(ApiResponse.ok(dto));
    }

    @PatchMapping("/conversations/{conversationId}")
    @Operation(summary = "Đổi tiêu đề cuộc hội thoại")
    public ResponseEntity<ApiResponse<ConversationDto>> updateTitle(
            @PathVariable String conversationId,
            @Valid @RequestBody UpdateConversationRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        ChatConversation c = conversationService.updateTitle(conversationId, request.getTitle(), principal.getId());
        ConversationDto dto = ConversationDto.builder()
                .id(c.getId())
                .title(c.getTitle())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .messageCount(messageRepository.countByConversationId(c.getId()))
                .build();
        return ResponseEntity.ok(ApiResponse.ok(dto));
    }

    @DeleteMapping("/conversations/{conversationId}")
    @Operation(summary = "Xóa cuộc hội thoại")
    public ResponseEntity<ApiResponse<Void>> deleteConversation(
            @PathVariable String conversationId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        conversationService.deleteConversation(conversationId, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Đã xóa hội thoại thành công", null));
    }

    @PostMapping("/conversations/{conversationId}/messages")
    @Operation(summary = "Gửi câu hỏi và nhận câu trả lời từ AI Tutor")
    public ResponseEntity<ApiResponse<ChatResponse>> sendMessage(
            @PathVariable String conversationId,
            @Valid @RequestBody ChatRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        ChatResponse resp = chatService.processUserMessage(conversationId, request.getMessage(), principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(resp));
    }

    @GetMapping("/conversations/{conversationId}/messages")
    @Operation(summary = "Lấy lịch sử tin nhắn trong cuộc hội thoại")
    public ResponseEntity<ApiResponse<PageResponse<ChatMessage>>> getMessages(
            @PathVariable String conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Page<ChatMessage> paged = conversationService.getConversationMessages(
                conversationId, principal.getId(), PageRequest.of(page, size));

        PageResponse<ChatMessage> pageResp = PageResponse.<ChatMessage>builder()
                .items(paged.getContent())
                .pageNumber(paged.getNumber())
                .pageSize(paged.getSize())
                .totalElements(paged.getTotalElements())
                .totalPages(paged.getTotalPages())
                .isFirst(paged.isFirst())
                .isLast(paged.isLast())
                .build();

        return ResponseEntity.ok(ApiResponse.ok(pageResp));
    }

    @GetMapping("/suggestions")
    @Operation(summary = "Lấy danh sách các câu hỏi gợi ý chuẩn IELTS")
    public ResponseEntity<ApiResponse<List<SuggestionDto>>> getSuggestions() {
        List<SuggestionDto> suggestions = List.of(
                SuggestionDto.builder()
                        .id("sug_01")
                        .category("Writing")
                        .title("Cấu trúc P-E-E Task 2")
                        .prompt("Giải thích công thức P-E-E để phát triển luận điểm mạch lạc trong IELTS Writing Task 2?")
                        .build(),
                SuggestionDto.builder()
                        .id("sug_02")
                        .category("Reading")
                        .title("Mẹo True / False / Not Given")
                        .prompt("Cách phân biệt chính xác giữa đáp án False và Not Given trong IELTS Reading?")
                        .build(),
                SuggestionDto.builder()
                        .id("sug_03")
                        .category("Personal Progress")
                        .title("Tiến độ học tập của tôi")
                        .prompt("Hệ thống kiểm tra giúp tôi: Tôi đã làm được những bài thi nào và điểm số trung bình là bao nhiêu?")
                        .build(),
                SuggestionDto.builder()
                        .id("sug_04")
                        .category("Grammar")
                        .title("Đảo ngữ Band 7.5+")
                        .prompt("Cho tôi ví dụ về cấu trúc đảo ngữ với 'Not only... but also' và 'Under no circumstances' trong bài luận IELTS.")
                        .build(),
                SuggestionDto.builder()
                        .id("sug_05")
                        .category("Platform Guide")
                        .title("Hướng dẫn thi thử")
                        .prompt("Tôi muốn làm bài thi thử chuẩn Cambridge thì vào mục nào trên nền tảng?")
                        .build()
        );
        return ResponseEntity.ok(ApiResponse.ok(suggestions));
    }

    @GetMapping("/status")
    @Operation(summary = "Kiểm tra trạng thái sẵn sàng của AI Chatbot")
    public ResponseEntity<ApiResponse<ChatStatusDto>> getChatStatus() {
        var provider = aiProviderFactory.getActiveProvider();
        ChatStatusDto status = ChatStatusDto.builder()
                .status(provider.isConfigured() ? "ONLINE" : "FALLBACK_MODE")
                .activeProvider(provider.getProviderName())
                .configured(provider.isConfigured())
                .modelName(provider.getProviderName())
                .availableTools(toolRegistry.getAllDefinitions().stream().map(d -> d.getName()).toList())
                .approvedKnowledgeChunks(knowledgeChunkRepository.count())
                .build();
        return ResponseEntity.ok(ApiResponse.ok(status));
    }
}
