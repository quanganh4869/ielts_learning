package com.ielts.platform.api.auth;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.ielts.platform.config.properties.AuthProperties;
import com.ielts.platform.config.properties.SupabaseProperties;
import com.ielts.platform.core.common.ApiResponse;
import com.ielts.platform.core.security.ClientIpResolver;
import com.ielts.platform.core.security.UserPrincipal;
import com.ielts.platform.db.model.LoginEventEntity;
import com.ielts.platform.db.repository.LoginEventRepository;
import com.ielts.platform.db.repository.UserSessionRepository;
import com.ielts.platform.schemas.auth.AuthProfileResponse;
import com.ielts.platform.schemas.user.UserDtos;
import com.ielts.platform.services.UserProvisioningService;
import com.ielts.platform.services.UserService;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Authentication & Session", description = "Current user profile, session state, token exchange, and logout")
public class AuthController {

    private final AuthProperties authProperties;
    private final SupabaseProperties supabaseProperties;
    private final UserSessionRepository userSessionRepository;
    private final LoginEventRepository loginEventRepository;
    private final UserService userService;
    private final ClientIpResolver clientIpResolver;
    private final JwtDecoder jwtDecoder;
    private final UserProvisioningService userProvisioningService;
    private final ObjectMapper objectMapper;

    public record SessionRequest(
            @NotBlank(message = "Access token is required")
            @Size(max = 8192, message = "Access token length is invalid")
            String accessToken,

            @Size(max = 8192, message = "Refresh token length is invalid")
            String refreshToken
    ) {}

    public record RefreshTokenRequest(
            @Size(max = 8192, message = "Refresh token length is invalid")
            String refreshToken
    ) {}

    @PostMapping("/session")
    @Operation(summary = "Exchange client-side Supabase tokens for HttpOnly access and refresh cookies")
    public ResponseEntity<ApiResponse<AuthProfileResponse>> establishSession(
            @Valid @RequestBody SessionRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse
    ) {
        if (request == null || !StringUtils.hasText(request.accessToken())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("INVALID_REQUEST", "Access token is required"));
        }

        try {
            Jwt jwt = jwtDecoder.decode(request.accessToken().trim());
            String sub = jwt.getSubject();
            String email = jwt.getClaimAsString("email");
            boolean emailVerified = resolveEmailVerified(jwt);

            Map<String, Object> userMetadata = jwt.getClaim("user_metadata");
            String name = null;
            String pictureUrl = null;
            if (userMetadata != null) {
                Object nameObj = userMetadata.getOrDefault("full_name", userMetadata.get("name"));
                if (nameObj != null) name = String.valueOf(nameObj);
                Object avatarObj = userMetadata.getOrDefault("avatar_url", userMetadata.get("picture"));
                if (avatarObj != null) pictureUrl = String.valueOf(avatarObj);
            }

            UserPrincipal principal = userProvisioningService.processSupabaseUser(
                    sub, email, emailVerified, name, pictureUrl, jwt.getClaims()
            );

            // Compute cookie Max-Age from JWT expiration
            long maxAge = 3600L;
            if (jwt.getExpiresAt() != null) {
                maxAge = Math.max(0, jwt.getExpiresAt().getEpochSecond() - Instant.now().getEpochSecond());
            }

            // Issue HttpOnly, SameSite=Lax access_token cookie
            ResponseCookie accessCookie = ResponseCookie.from("access_token", request.accessToken().trim())
                    .path("/")
                    .httpOnly(true)
                    .secure(authProperties.getAuth().isCookieSecure())
                    .sameSite("Lax")
                    .maxAge(maxAge)
                    .build();
            httpResponse.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());

            // Issue HttpOnly refresh_token cookie scoped to /api/v1/auth
            if (StringUtils.hasText(request.refreshToken())) {
                ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", request.refreshToken().trim())
                        .path("/api/v1/auth")
                        .httpOnly(true)
                        .secure(authProperties.getAuth().isCookieSecure())
                        .sameSite("Lax")
                        .maxAge(30 * 24 * 3600L) // 30 days
                        .build();
                httpResponse.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());
            }

            // Record login audit event
            String ipAddress = clientIpResolver.resolveClientIp(httpRequest);
            String ua = httpRequest.getHeader("User-Agent");
            LoginEventEntity event = LoginEventEntity.builder()
                    .id("evt_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16))
                    .userId(principal.getId())
                    .userEmail(principal.getEmail())
                    .ipAddress(ipAddress != null && ipAddress.length() > 45 ? ipAddress.substring(0, 45) : ipAddress)
                    .device(ua != null && ua.length() > 100 ? ua.substring(0, 100) : (ua != null ? ua : "Unknown Device"))
                    .status("SUCCESS")
                    .reason("Session established via OAuth token exchange")
                    .createdAt(Instant.now())
                    .build();
            loginEventRepository.save(event);

            AuthProfileResponse profile = mapToProfileResponse(principal);
            log.info("Session established successfully for user ID={}", principal.getId());
            return ResponseEntity.ok(ApiResponse.ok("Session established successfully", profile));
        } catch (JwtException e) {
            log.warn("Invalid JWT presented to /auth/session: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("UNAUTHORIZED", "Invalid or expired Supabase token: " + e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to establish session: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("AUTH_ERROR", "Failed to establish session: " + e.getMessage()));
        }
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh session using HttpOnly refresh_token cookie or body")
    public ResponseEntity<ApiResponse<AuthProfileResponse>> refreshSession(
            @RequestBody(required = false) RefreshTokenRequest requestBody,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse
    ) {
        String refreshToken = null;

        // 1. Inspect cookies first
        if (httpRequest.getCookies() != null) {
            for (Cookie c : httpRequest.getCookies()) {
                if ("refresh_token".equals(c.getName()) && StringUtils.hasText(c.getValue())) {
                    refreshToken = c.getValue().trim();
                    break;
                }
            }
        }

        // 2. Fallback to request body
        if (!StringUtils.hasText(refreshToken) && requestBody != null && StringUtils.hasText(requestBody.refreshToken())) {
            refreshToken = requestBody.refreshToken().trim();
        }

        if (!StringUtils.hasText(refreshToken)) {
            expireAuthCookies(httpResponse);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("UNAUTHORIZED", "Refresh token is missing"));
        }

        // 3. Exchange refresh token with Supabase Auth API
        String supabaseUrl = supabaseProperties.getUrl();
        String apiKey = StringUtils.hasText(supabaseProperties.getPublishableKey())
                ? supabaseProperties.getPublishableKey()
                : supabaseProperties.getJwtSecret();

        if (StringUtils.hasText(supabaseUrl) && StringUtils.hasText(apiKey)) {
            try {
                String tokenEndpoint = supabaseUrl.replaceAll("/+$", "") + "/auth/v1/token?grant_type=refresh_token";
                Map<String, String> payload = Map.of("refresh_token", refreshToken);
                String jsonBody = objectMapper.writeValueAsString(payload);

                java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();
                java.net.http.HttpRequest req = java.net.http.HttpRequest.newBuilder()
                        .uri(java.net.URI.create(tokenEndpoint))
                        .header("Content-Type", "application/json")
                        .header("apikey", apiKey)
                        .POST(java.net.http.HttpRequest.BodyPublishers.ofString(jsonBody))
                        .build();

                java.net.http.HttpResponse<String> resp = client.send(req, java.net.http.HttpResponse.BodyHandlers.ofString());

                if (resp.statusCode() == 200) {
                    Map<String, Object> respMap = objectMapper.readValue(resp.body(), Map.class);
                    String newAccessToken = (String) respMap.get("access_token");
                    String newRefreshToken = (String) respMap.get("refresh_token");

                    if (StringUtils.hasText(newAccessToken)) {
                        Jwt jwt = jwtDecoder.decode(newAccessToken);
                        String sub = jwt.getSubject();
                        String email = jwt.getClaimAsString("email");
                        boolean emailVerified = resolveEmailVerified(jwt);

                        Map<String, Object> userMetadata = jwt.getClaim("user_metadata");
                        String name = null;
                        String pictureUrl = null;
                        if (userMetadata != null) {
                            Object nameObj = userMetadata.getOrDefault("full_name", userMetadata.get("name"));
                            if (nameObj != null) name = String.valueOf(nameObj);
                            Object avatarObj = userMetadata.getOrDefault("avatar_url", userMetadata.get("picture"));
                            if (avatarObj != null) pictureUrl = String.valueOf(avatarObj);
                        }

                        UserPrincipal principal = userProvisioningService.processSupabaseUser(
                                sub, email, emailVerified, name, pictureUrl, jwt.getClaims()
                        );

                        long maxAge = 3600L;
                        if (jwt.getExpiresAt() != null) {
                            maxAge = Math.max(0, jwt.getExpiresAt().getEpochSecond() - Instant.now().getEpochSecond());
                        }

                        ResponseCookie accessCookie = ResponseCookie.from("access_token", newAccessToken)
                                .path("/")
                                .httpOnly(true)
                                .secure(authProperties.getAuth().isCookieSecure())
                                .sameSite("Lax")
                                .maxAge(maxAge)
                                .build();
                        httpResponse.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());

                        if (StringUtils.hasText(newRefreshToken)) {
                            ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", newRefreshToken)
                                    .path("/api/v1/auth")
                                    .httpOnly(true)
                                    .secure(authProperties.getAuth().isCookieSecure())
                                    .sameSite("Lax")
                                    .maxAge(30 * 24 * 3600L)
                                    .build();
                            httpResponse.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());
                        }

                        AuthProfileResponse profile = mapToProfileResponse(principal);
                        log.info("Session refreshed successfully for user ID={}", principal.getId());
                        return ResponseEntity.ok(ApiResponse.ok("Session refreshed successfully", profile));
                    }
                }
            } catch (Exception e) {
                log.warn("Supabase token refresh failed: {}", e.getMessage());
            }
        }

        // If refresh failed or could not be completed, expire cookies and reject with 401
        expireAuthCookies(httpResponse);
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("UNAUTHORIZED", "Failed to refresh session: Token expired or invalid"));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user profile and safe permissions")
    public ApiResponse<AuthProfileResponse> getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ApiResponse.error("UNAUTHORIZED", "Not authenticated");
        }
        return ApiResponse.ok(mapToProfileResponse(principal));
    }

    @PatchMapping("/me")
    @Operation(summary = "Update current authenticated user profile")
    public ApiResponse<UserDtos.UserResponse> updateCurrentProfile(
            @RequestBody UserDtos.UpdateProfileRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (principal == null) {
            return ApiResponse.error("UNAUTHORIZED", "Not authenticated");
        }
        return ApiResponse.ok("Profile updated successfully", userService.updateProfile(principal.getId(), request));
    }

    @GetMapping("/status")
    @Operation(summary = "Check current authentication status")
    public ApiResponse<Map<String, Object>> getAuthStatus(@AuthenticationPrincipal UserPrincipal principal) {
        Map<String, Object> status = new HashMap<>();
        boolean authenticated = principal != null;
        status.put("authenticated", authenticated);
        if (authenticated) {
            boolean isAdmin = principal.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .anyMatch(a -> "ROLE_ADMIN".equals(a) || "ROLE_SUPER_ADMIN".equals(a));
            status.put("userId", principal.getId());
            status.put("email", principal.getEmail());
            status.put("isAdmin", isAdmin);
        }
        return ApiResponse.ok(status);
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout user, invalidate session, and clear all authentication cookies")
    public ApiResponse<Map<String, String>> logout(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) {
        String userId = "anonymous";
        String email = "unknown";

        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal principal) {
            userId = principal.getId();
            email = principal.getEmail();
        }

        HttpSession session = request.getSession(false);
        if (session != null) {
            String sessionId = session.getId();
            userSessionRepository.findById(sessionId).ifPresent(s -> {
                s.setActive(false);
                userSessionRepository.save(s);
            });
            session.invalidate();
        }
        SecurityContextHolder.clearContext();

        // Expire all auth-related cookies
        expireAuthCookies(response);

        // Audit logout event
        String ipAddress = clientIpResolver.resolveClientIp(request);
        String ua = request.getHeader("User-Agent");
        if (ua != null && ua.length() > 100) {
            ua = ua.substring(0, 100);
        }
        LoginEventEntity event = LoginEventEntity.builder()
                .id("evt_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16))
                .userId(userId)
                .userEmail(email)
                .ipAddress(ipAddress != null && ipAddress.length() > 45 ? ipAddress.substring(0, 45) : ipAddress)
                .device(ua != null ? ua : "Unknown Device")
                .status("SUCCESS")
                .reason("User Logout")
                .createdAt(Instant.now())
                .build();
        loginEventRepository.save(event);

        log.info("User logged out: ID={}", userId);
        return ApiResponse.ok("Logged out successfully", Map.of("message", "Logged out successfully"));
    }

    private void expireAuthCookies(HttpServletResponse response) {
        ResponseCookie accessCookie = ResponseCookie.from("access_token", "")
                .path("/")
                .maxAge(0)
                .httpOnly(true)
                .secure(authProperties.getAuth().isCookieSecure())
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());

        ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", "")
                .path("/api/v1/auth")
                .maxAge(0)
                .httpOnly(true)
                .secure(authProperties.getAuth().isCookieSecure())
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());

        ResponseCookie jsessionCookie = ResponseCookie.from("JSESSIONID", "")
                .path("/api/v1")
                .maxAge(0)
                .httpOnly(true)
                .secure(authProperties.getAuth().isCookieSecure())
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, jsessionCookie.toString());

        ResponseCookie xsrfCookie = ResponseCookie.from("XSRF-TOKEN", "")
                .path("/")
                .maxAge(0)
                .httpOnly(false)
                .secure(authProperties.getAuth().isCookieSecure())
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, xsrfCookie.toString());
    }

    private boolean resolveEmailVerified(Jwt jwt) {
        Boolean rootVerified = jwt.getClaimAsBoolean("email_verified");
        if (Boolean.TRUE.equals(rootVerified)) {
            return true;
        }

        if (jwt.hasClaim("email_confirmed_at") && jwt.getClaim("email_confirmed_at") != null) {
            return true;
        }
        if (jwt.hasClaim("confirmed_at") && jwt.getClaim("confirmed_at") != null) {
            return true;
        }

        Map<String, Object> userMetadata = jwt.getClaim("user_metadata");
        if (userMetadata != null && userMetadata.get("email_verified") != null) {
            if (Boolean.TRUE.equals(userMetadata.get("email_verified")) ||
                "true".equalsIgnoreCase(String.valueOf(userMetadata.get("email_verified")))) {
                return true;
            }
        }

        Map<String, Object> appMetadata = jwt.getClaim("app_metadata");
        if (appMetadata != null) {
            if ("google".equalsIgnoreCase(String.valueOf(appMetadata.get("provider")))) {
                return true;
            }
            Object providers = appMetadata.get("providers");
            if (providers instanceof Iterable<?> iterable) {
                for (Object p : iterable) {
                    if ("google".equalsIgnoreCase(String.valueOf(p))) {
                        return true;
                    }
                }
            }
        }

        // Valid Supabase authenticated token containing an email claim is accepted
        return StringUtils.hasText(jwt.getClaimAsString("email"));
    }

    private AuthProfileResponse mapToProfileResponse(UserPrincipal principal) {
        boolean isAdmin = principal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> "ROLE_ADMIN".equals(a) || "ROLE_SUPER_ADMIN".equals(a));

        List<String> roles = principal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(a -> a.startsWith("ROLE_"))
                .toList();

        List<String> permissions = principal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(a -> !a.startsWith("ROLE_"))
                .toList();

        return AuthProfileResponse.builder()
                .id(principal.getId())
                .email(principal.getEmail())
                .name(principal.getName())
                .avatarUrl(principal.getAvatarUrl())
                .isAdmin(isAdmin)
                .roles(roles)
                .permissions(permissions)
                .build();
    }
}
