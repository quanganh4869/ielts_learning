package com.ielts.platform.schemas.auth;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthProfileResponse {
    private String id;
    private String email;
    private String name;
    private String avatarUrl;

    @JsonProperty("isAdmin")
    private boolean isAdmin;

    @JsonProperty("admin")
    public boolean getAdmin() {
        return isAdmin;
    }

    private List<String> roles;
    private List<String> permissions;
}
