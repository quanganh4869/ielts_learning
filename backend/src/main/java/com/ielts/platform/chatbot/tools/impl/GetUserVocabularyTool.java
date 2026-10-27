package com.ielts.platform.chatbot.tools.impl;

import com.ielts.platform.chatbot.tools.ChatbotTool;
import com.ielts.platform.chatbot.tools.ToolDefinition;
import com.ielts.platform.chatbot.tools.ToolResult;
import com.ielts.platform.study.model.UserVocabularyEntity;
import com.ielts.platform.study.repository.UserVocabularyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

import java.util.*;

@Slf4j
@Component
@RequiredArgsConstructor
public class GetUserVocabularyTool implements ChatbotTool {

    private final UserVocabularyRepository userVocabularyRepository;

    @Override
    public ToolDefinition getDefinition() {
        return ToolDefinition.builder()
                .name("getUserVocabulary")
                .description("Lấy danh sách từ vựng cá nhân mà học viên đã lưu vào sổ từ để ôn tập.")
                .parameters(Map.of("type", "object", "properties", Map.of()))
                .build();
    }

    @Override
    public ToolResult execute(String currentUserId, Map<String, Object> arguments) {
        long start = System.currentTimeMillis();
        if (currentUserId == null || currentUserId.isBlank()) {
            return ToolResult.denied("getUserVocabulary", "Chưa xác thực danh tính người dùng");
        }

        var vocabList = userVocabularyRepository.findByUserIdOrderByCreatedAtDesc(
                currentUserId, PageRequest.of(0, 15)).getContent();

        List<Map<String, Object>> words = new ArrayList<>();
        for (UserVocabularyEntity item : vocabList) {
            words.add(Map.of(
                    "word", item.getWord(),
                    "definition", item.getDefinition() != null ? item.getDefinition() : "",
                    "partOfSpeech", item.getPartOfSpeech() != null ? item.getPartOfSpeech() : "",
                    "masteryLevel", item.getMasteryLevel()
            ));
        }

        Map<String, Object> response = Map.of(
                "totalSavedWords", words.size(),
                "words", words
        );

        return ToolResult.success("getUserVocabulary", response, "Sổ từ vựng cá nhân của học viên", System.currentTimeMillis() - start);
    }
}
