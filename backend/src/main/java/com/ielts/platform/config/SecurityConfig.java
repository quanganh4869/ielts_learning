package com.ielts.platform.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ielts.platform.common.ApiResponse;
import com.ielts.platform.security.CookieOrHeaderBearerTokenResolver;
import com.ielts.platform.security.CsrfCookieFilter;
import com.ielts.platform.security.SpaCsrfTokenRequestHandler;
import com.ielts.platform.security.supabase.SupabaseAudienceValidator;
import com.ielts.platform.security.supabase.SupabaseJwtAuthenticationConverter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.util.StringUtils;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final AuthProperties authProperties;
    private final SupabaseProperties supabaseProperties;
    private final SupabaseJwtAuthenticationConverter supabaseJwtAuthenticationConverter;
    private final ObjectMapper objectMapper;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        String jwksUri = supabaseProperties.getEffectiveJwksUri();
        if (StringUtils.hasText(jwksUri)) {
            log.info("Configuring Supabase JWT Resource Server with JWKS URI: {}", jwksUri);
            NimbusJwtDecoder decoder = NimbusJwtDecoder.withJwkSetUri(jwksUri)
                    .jwsAlgorithms(algs -> {
                        algs.add(SignatureAlgorithm.RS256);
                        algs.add(SignatureAlgorithm.ES256);
                        algs.add(SignatureAlgorithm.ES384);
                        algs.add(SignatureAlgorithm.ES512);
                    })
                    .build();
            OAuth2TokenValidator<Jwt> defaultValidator = JwtValidators.createDefault();
            OAuth2TokenValidator<Jwt> audienceValidator = new SupabaseAudienceValidator(supabaseProperties.getAudience());
            decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(defaultValidator, audienceValidator));
            return decoder;
        }

        String secret = supabaseProperties.getJwtSecret();
        if (!StringUtils.hasText(secret)) {
            // Safe fallback HMAC secret for testing / local execution without network JWKS
            secret = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
        }

        log.info("Configuring Supabase JWT Resource Server with symmetric HMAC-SHA256 signature verification");
        SecretKey key = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withSecretKey(key).build();
        OAuth2TokenValidator<Jwt> defaultValidator = JwtValidators.createDefault();
        OAuth2TokenValidator<Jwt> audienceValidator = new SupabaseAudienceValidator(supabaseProperties.getAudience());
        decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(defaultValidator, audienceValidator));
        return decoder;
    }

    @Bean
    @Order(1)
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        CsrfTokenRequestAttributeHandler requestHandler = new CsrfTokenRequestAttributeHandler();
        requestHandler.setCsrfRequestAttributeName(null);

        CookieCsrfTokenRepository csrfTokenRepository = CookieCsrfTokenRepository.withHttpOnlyFalse();
        csrfTokenRepository.setCookiePath("/");

        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf
                        .csrfTokenRepository(csrfTokenRepository)
                        .csrfTokenRequestHandler(requestHandler)
                        .ignoringRequestMatchers(
                                "/swagger-ui",
                                "/swagger-ui/",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/swagger",
                                "/docs",
                                "/v3/api-docs",
                                "/v3/api-docs/**",
                                "/actuator/**",
                                "/auth/session",
                                "/auth/login"
                        )
                )
                .addFilterAfter(new CsrfCookieFilter(), org.springframework.security.web.csrf.CsrfFilter.class)
                .headers(headers -> headers
                        .frameOptions(frame -> frame.deny())
                        .contentTypeOptions(content -> {})
                        .contentSecurityPolicy(csp -> csp
                                .policyDirectives("default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' http://localhost:* https://*.supabase.co;")
                        )
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers(
                                "/swagger-ui",
                                "/swagger-ui/",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/swagger",
                                "/docs",
                                "/v3/api-docs",
                                "/v3/api-docs/**",
                                "/actuator/health",
                                "/actuator/info",
                                "/auth/status",
                                "/auth/session",
                                "/auth/refresh",
                                "/auth/logout",
                                "/auth/login",
                                "/chat/suggestions",
                                "/chat/status"
                        ).permitAll()
                        // Strict Admin-only endpoints
                        .requestMatchers("/admin/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                        // Protected Storage, Study, User & AI Chat endpoints
                        .requestMatchers("/storage/**").authenticated()
                        .requestMatchers("/study/**").authenticated()
                        .requestMatchers("/users/me").authenticated()
                        .requestMatchers("/auth/me").authenticated()
                        .requestMatchers("/chat/**").authenticated()
                        .anyRequest().authenticated()
                )
                // Supabase Auth JWT Resource Server
                .oauth2ResourceServer(oauth2 -> oauth2
                        .bearerTokenResolver(new CookieOrHeaderBearerTokenResolver())
                        .jwt(jwt -> jwt
                                .decoder(jwtDecoder())
                                .jwtAuthenticationConverter(supabaseJwtAuthenticationConverter)
                        )
                        .authenticationEntryPoint(restAuthenticationEntryPoint())
                        .accessDeniedHandler(restAccessDeniedHandler())
                )
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(restAuthenticationEntryPoint())
                        .accessDeniedHandler(restAccessDeniedHandler())
                );

        return http.build();
    }

    @Bean
    public AuthenticationEntryPoint restAuthenticationEntryPoint() {
        return (request, response, authException) -> {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            ApiResponse<Void> apiResponse = ApiResponse.error("UNAUTHORIZED", "Authentication required: Valid Supabase access token is missing, expired, or invalid");
            response.getOutputStream().println(objectMapper.writeValueAsString(apiResponse));
        };
    }

    @Bean
    public AccessDeniedHandler restAccessDeniedHandler() {
        return (request, response, accessDeniedException) -> {
            response.setStatus(HttpStatus.FORBIDDEN.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            ApiResponse<Void> apiResponse = ApiResponse.error("FORBIDDEN", "Access denied: You do not have the required administrative or resource permission");
            response.getOutputStream().println(objectMapper.writeValueAsString(apiResponse));
        };
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        String allowedOrigins = authProperties.getCors() != null && authProperties.getCors().getAllowedOrigins() != null
                ? authProperties.getCors().getAllowedOrigins()
                : "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173";
        List<String> origins = Arrays.asList(allowedOrigins.split(","));
        configuration.setAllowedOrigins(origins);
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type",
                "Accept",
                "X-XSRF-TOKEN",
                "X-Requested-With",
                "Origin"
        ));
        configuration.setExposedHeaders(Arrays.asList("X-XSRF-TOKEN", "Set-Cookie"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
