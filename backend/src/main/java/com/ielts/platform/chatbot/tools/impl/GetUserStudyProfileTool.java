package com.ielts.platform.chatbot.tools.impl;

import com.ielts.platform.admin.users.model.UserEntity;
import com.ielts.platform.admin.users.repository.UserRepository;
import com.ielts.platform.chatbot.tools.ChatbotTool;
import com.ielts.platform.chatbot.tools.ToolDefinition;
import com.ielts.platform.chatbot.tools.ToolResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class GetUserStudyProfileTool implements ChatbotTool {

    private final UserRepository userRepository;

    @Override
    public ToolDefinition getDefinition() {
        return ToolDefinition.builder()
                .name("getUserStudyProfile")
                .description("Tra cứu hồ sơ học tập thực tế của học viên gồm tên, mục tiêu band điểm IELTS và trạng thái tài khoản.")
                .parameters(Map.of("type", "object", "properties", Map.of()))
                .build();
    }

    @Override
    public ToolResult execute(String currentUserId, Map<String, Object> arguments) {
        long start = System.currentTimeMillis();
        if (currentUserId == null || currentUserId.isBlank()) {
            return ToolResult.denied("getUserStudyProfile", "Chưa xác thực danh tính người dùng");
        }

        Optional<UserEntity> userOpt = userRepository.findById(currentUserId);
        if (userOpt.isEmpty()) {
            return ToolResult.failure("getUserStudyProfile", "Không tìm thấy hồ sơ người dùng trong hệ thống", System.currentTimeMillis() - start);
        }

        UserEntity user = userOpt.get();
        Map<String, Object> profile = new HashMap<>();
        profile.put("userId", user.getId());
        profile.put("name", user.getName());
        profile.put("targetBand", user.getTargetBand() != null ? user.getTargetBand() : "Chưa đặt mục tiêu");
        profile.put("status", user.getStatus().name());

        return ToolResult.success("getUserStudyProfile", profile, "Dữ liệu hồ sơ người dùng tại hệ thống IELTS Platform", System.currentTimeMillis() - start);
    }
}
