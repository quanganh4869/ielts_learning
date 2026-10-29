package com.ielts.platform.schemas.auth;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private String tokenType;
    private String userId;
    private String name;
    private String email;
    private List<String> roles;
    private List<String> permissions;
}
