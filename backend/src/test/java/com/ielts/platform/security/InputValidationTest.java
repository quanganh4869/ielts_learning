package com.ielts.platform.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ielts.platform.admin.settings.dto.ServicePlanDtos;
import com.ielts.platform.admin.users.dto.RoleDtos;
import com.ielts.platform.admin.users.dto.UserDtos;
import com.ielts.platform.study.dto.StudyDtos;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class InputValidationTest {

    private static Validator validator;

    @BeforeAll
    static void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    @DisplayName("ServicePlan: rejects blank name and negative prices")
    void testServicePlanValidation() {
        ServicePlanDtos.UpsertRequest invalidRequest = new ServicePlanDtos.UpsertRequest(
                "", // Blank name
                new BigDecimal("-5.00"), // Negative monthly price
                new BigDecimal("-10.00"), // Negative yearly price
                "{}",
                true
        );

        Set<ConstraintViolation<ServicePlanDtos.UpsertRequest>> violations = validator.validate(invalidRequest);
        assertThat(violations).hasSizeGreaterThanOrEqualTo(3);
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("name"));
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("monthlyPrice"));
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("yearlyPrice"));

        // Valid plan passes
        ServicePlanDtos.UpsertRequest validRequest = new ServicePlanDtos.UpsertRequest(
                "IELTS Master Pro",
                new BigDecimal("29.99"),
                new BigDecimal("299.99"),
                "{}",
                true
        );
        assertThat(validator.validate(validRequest)).isEmpty();
    }

    @Test
    @DisplayName("User: rejects invalid email, short password and out-of-range target band")
    void testUserValidation() {
        UserDtos.CreateUserRequest invalidUser = UserDtos.CreateUserRequest.builder()
                .name("A") // Too short (< 2)
                .email("not-an-email") // Invalid email
                .password("123") // Too short (< 6)
                .targetBand(new BigDecimal("10.5")) // Out of range (> 9.0)
                .build();

        Set<ConstraintViolation<UserDtos.CreateUserRequest>> violations = validator.validate(invalidUser);
        assertThat(violations).hasSizeGreaterThanOrEqualTo(4);
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("name"));
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("email"));
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("password"));
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("targetBand"));

        // Valid user passes
        UserDtos.CreateUserRequest validUser = UserDtos.CreateUserRequest.builder()
                .name("Nguyen Van A")
                .email("nguyen.a@example.com")
                .password("SecureP@ss123")
                .targetBand(new BigDecimal("7.5"))
                .build();
        assertThat(validator.validate(validUser)).isEmpty();
    }

    @Test
    @DisplayName("Role: rejects role names not conforming to ROLE_ pattern")
    void testRoleNamePatternValidation() {
        RoleDtos.UpsertRequest invalidRole = new RoleDtos.UpsertRequest(
                "custom_role_lower", // Not starting with ROLE_ and uppercase
                "Custom Role",
                "Description",
                null
        );

        Set<ConstraintViolation<RoleDtos.UpsertRequest>> violations = validator.validate(invalidRole);
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("name"));

        RoleDtos.UpsertRequest validRole = new RoleDtos.UpsertRequest(
                "ROLE_CONTENT_CREATOR",
                "Content Creator",
                "Can manage questions and vocabularies",
                null
        );
        assertThat(validator.validate(validRole)).isEmpty();
    }

    @Test
    @DisplayName("Study: rejects invalid skill enum and band scores above 9.0")
    void testStudyValidation() {
        StudyDtos.CreatePracticeSessionRequest invalidSession = StudyDtos.CreatePracticeSessionRequest.builder()
                .skill("INVALID_SKILL") // Not LISTENING/READING/WRITING/SPEAKING
                .build();

        Set<ConstraintViolation<StudyDtos.CreatePracticeSessionRequest>> violations = validator.validate(invalidSession);
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("skill"));

        StudyDtos.CompletePracticeSessionRequest invalidCompletion = StudyDtos.CompletePracticeSessionRequest.builder()
                .totalQuestions(10)
                .correctAnswers(8)
                .bandScore(new BigDecimal("9.5")) // Out of range (> 9.0)
                .build();

        Set<ConstraintViolation<StudyDtos.CompletePracticeSessionRequest>> compViolations = validator.validate(invalidCompletion);
        assertThat(compViolations).anyMatch(v -> v.getPropertyPath().toString().equals("bandScore"));

        StudyDtos.UpdateVocabularyMasteryRequest invalidMastery = StudyDtos.UpdateVocabularyMasteryRequest.builder()
                .masteryLevel(10) // Out of range (> 5)
                .build();

        Set<ConstraintViolation<StudyDtos.UpdateVocabularyMasteryRequest>> masteryViolations = validator.validate(invalidMastery);
        assertThat(masteryViolations).anyMatch(v -> v.getPropertyPath().toString().equals("masteryLevel"));
    }

    @Test
    @DisplayName("AuthProfileResponse: Jackson serialization includes admin and isAdmin")
    void testAuthProfileResponseSerialization() throws Exception {
        com.ielts.platform.admin.users.dto.AuthProfileResponse profile =
                com.ielts.platform.admin.users.dto.AuthProfileResponse.builder()
                        .id("u_1")
                        .email("admin@ieltsplatform.com")
                        .isAdmin(true)
                        .roles(java.util.List.of("ROLE_ADMIN"))
                        .build();

        String json = new ObjectMapper().writeValueAsString(profile);
        assertThat(json).contains("\"admin\":true");
        assertThat(json).contains("\"isAdmin\":true");
    }

    @Test
    @DisplayName("Mass Assignment Defense: UpdateProfileRequest has no role or isAdmin properties")
    void testMassAssignmentDefense() {
        // Verify via reflection that UpdateProfileRequest does NOT expose role, roles, or isAdmin
        boolean hasRoleField = false;
        boolean hasIsAdminField = false;

        for (java.lang.reflect.Field field : UserDtos.UpdateProfileRequest.class.getDeclaredFields()) {
            if ("role".equalsIgnoreCase(field.getName()) || "roles".equalsIgnoreCase(field.getName())) {
                hasRoleField = true;
            }
            if ("isAdmin".equalsIgnoreCase(field.getName())) {
                hasIsAdminField = true;
            }
        }

        assertThat(hasRoleField).isFalse();
        assertThat(hasIsAdminField).isFalse();
    }
}
