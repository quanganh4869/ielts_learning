package com.ielts.platform.admin.users.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthProfileResponse {
    private String id;
    private String email;
    private String name;
    private String avatarUrl;
    private boolean isAdmin;
    private List<String> roles;
    private List<String> permissions;
}
