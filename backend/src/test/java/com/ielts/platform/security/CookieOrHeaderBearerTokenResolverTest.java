package com.ielts.platform.security;

import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

import static org.junit.jupiter.api.Assertions.*;

class CookieOrHeaderBearerTokenResolverTest {

    private final CookieOrHeaderBearerTokenResolver resolver = new CookieOrHeaderBearerTokenResolver();

    @Test
    @DisplayName("Should extract token from HttpOnly access_token cookie")
    void shouldExtractTokenFromCookie() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setCookies(new Cookie("access_token", "sample-cookie-jwt-token"));

        String token = resolver.resolve(request);
        assertEquals("sample-cookie-jwt-token", token);
    }

    @Test
    @DisplayName("Should prioritize cookie over Authorization header to prevent token desync")
    void shouldPrioritizeCookieOverHeader() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setCookies(new Cookie("access_token", "cookie-token"));
        request.addHeader("Authorization", "Bearer header-token");

        String token = resolver.resolve(request);
        assertEquals("cookie-token", token);
    }

    @Test
    @DisplayName("Should fallback to Authorization header when cookie is missing")
    void shouldFallbackToAuthorizationHeader() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer header-token-xyz");

        String token = resolver.resolve(request);
        assertEquals("header-token-xyz", token);
    }

    @Test
    @DisplayName("Should fallback to header when access_token cookie is blank")
    void shouldFallbackWhenCookieIsBlank() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setCookies(new Cookie("access_token", "   "));
        request.addHeader("Authorization", "Bearer fallback-header-token");

        String token = resolver.resolve(request);
        assertEquals("fallback-header-token", token);
    }

    @Test
    @DisplayName("Should return null when neither cookie nor header is provided")
    void shouldReturnNullWhenBothAreMissing() {
        MockHttpServletRequest request = new MockHttpServletRequest();

        String token = resolver.resolve(request);
        assertNull(token);
    }
}
