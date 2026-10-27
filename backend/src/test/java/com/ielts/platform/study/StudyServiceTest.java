package com.ielts.platform.study;

import com.ielts.platform.admin.questions.model.AssessmentAttemptEntity;
import com.ielts.platform.admin.questions.model.AssessmentEntity;
import com.ielts.platform.admin.questions.repository.AssessmentAttemptRepository;
import com.ielts.platform.admin.questions.repository.AssessmentRepository;
import com.ielts.platform.admin.users.model.UserEntity;
import com.ielts.platform.admin.users.repository.UserRepository;
import com.ielts.platform.common.BusinessException;
import com.ielts.platform.common.ErrorCode;
import com.ielts.platform.common.PageResponse;
import com.ielts.platform.security.ResourceOwnershipService;
import com.ielts.platform.security.UserPrincipal;
import com.ielts.platform.study.dto.StudyDtos.*;
import com.ielts.platform.study.model.PracticeSessionEntity;
import com.ielts.platform.study.model.UserVocabularyEntity;
import com.ielts.platform.study.repository.PracticeSessionRepository;
import com.ielts.platform.study.repository.UserVocabularyRepository;
import com.ielts.platform.study.service.StudyService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StudyServiceTest {

    @Mock
    private PracticeSessionRepository practiceSessionRepository;

    @Mock
    private UserVocabularyRepository userVocabularyRepository;

    @Mock
    private AssessmentAttemptRepository assessmentAttemptRepository;

    @Mock
    private AssessmentRepository assessmentRepository;

    @Mock
    private UserRepository userRepository;

    private ResourceOwnershipService ownershipService;
    private StudyService studyService;

    private UserPrincipal userA;
    private UserPrincipal userB;
    private UserPrincipal adminUser;
    private UserEntity userEntityA;

    @BeforeEach
    void setUp() {
        ownershipService = new ResourceOwnershipService();
        studyService = new StudyService(
                practiceSessionRepository,
                userVocabularyRepository,
                assessmentAttemptRepository,
                assessmentRepository,
                userRepository,
                ownershipService
        );

        userA = UserPrincipal.builder()
                .id("usr_learner_a")
                .email("studentA@example.com")
                .name("Student A")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_USER")))
                .build();

        userB = UserPrincipal.builder()
                .id("usr_learner_b")
                .email("studentB@example.com")
                .name("Student B")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_USER")))
                .build();

        adminUser = UserPrincipal.builder()
                .id("usr_admin_1")
                .email("admin@platform.edu.vn")
                .name("Admin Staff")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_ADMIN"), new SimpleGrantedAuthority("TEST_MANAGE")))
                .build();

        userEntityA = UserEntity.builder()
                .id("usr_learner_a")
                .email("studentA@example.com")
                .name("Student A")
                .status(UserEntity.UserStatus.ACTIVE)
                .build();
    }

    @Test
    @DisplayName("1. User A retrieves own practice sessions successfully")
    void testGetMyPracticeSessions() {
        Pageable pageable = PageRequest.of(0, 10);
        PracticeSessionEntity session = PracticeSessionEntity.builder()
                .id("ps_1")
                .user(userEntityA)
                .skill("READING")
                .topic("Academic Reading Test 1")
                .status("IN_PROGRESS")
                .startedAt(Instant.now())
                .build();

        when(practiceSessionRepository.findByUserIdOrderByStartedAtDesc("usr_learner_a", pageable))
                .thenReturn(new PageImpl<>(List.of(session)));

        PageResponse<PracticeSessionDto> result = studyService.getMyPracticeSessions(userA, pageable);

        assertThat(result.getItems()).hasSize(1);
        assertThat(result.getItems().get(0).getId()).isEqualTo("ps_1");
        assertThat(result.getItems().get(0).getUserId()).isEqualTo("usr_learner_a");
    }

    @Test
    @DisplayName("2. User A starts a new practice session bound to User A ID")
    void testStartPracticeSession() {
        when(userRepository.findById("usr_learner_a")).thenReturn(Optional.of(userEntityA));
        when(practiceSessionRepository.save(any(PracticeSessionEntity.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        CreatePracticeSessionRequest request = CreatePracticeSessionRequest.builder()
                .skill("LISTENING")
                .topic("Section 1 - Hotel Reservation")
                .build();

        PracticeSessionDto dto = studyService.startPracticeSession(request, userA);

        assertThat(dto).isNotNull();
        assertThat(dto.getUserId()).isEqualTo("usr_learner_a");
        assertThat(dto.getSkill()).isEqualTo("LISTENING");
        assertThat(dto.getStatus()).isEqualTo("IN_PROGRESS");
    }

    @Test
    @DisplayName("3. User A accesses own practice session -> 200 OK")
    void testGetPracticeSession_OwnerSuccess() {
        PracticeSessionEntity session = PracticeSessionEntity.builder()
                .id("ps_1")
                .user(userEntityA)
                .skill("SPEAKING")
                .status("IN_PROGRESS")
                .build();

        when(practiceSessionRepository.findById("ps_1")).thenReturn(Optional.of(session));

        PracticeSessionDto dto = studyService.getPracticeSession("ps_1", userA);

        assertThat(dto.getId()).isEqualTo("ps_1");
        assertThat(dto.getUserId()).isEqualTo("usr_learner_a");
    }

    @Test
    @DisplayName("4. User B attempts to access User A's practice session -> 403 Forbidden (Ownership protection)")
    void testGetPracticeSession_OtherUserForbidden() {
        PracticeSessionEntity session = PracticeSessionEntity.builder()
                .id("ps_1")
                .user(userEntityA)
                .skill("SPEAKING")
                .status("IN_PROGRESS")
                .build();

        when(practiceSessionRepository.findById("ps_1")).thenReturn(Optional.of(session));

        assertThatThrownBy(() -> studyService.getPracticeSession("ps_1", userB))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("You do not have permission to access or modify this practice session");
    }

    @Test
    @DisplayName("5. Admin accesses User A's practice session -> Allowed with Admin privilege")
    void testGetPracticeSession_AdminAllowed() {
        PracticeSessionEntity session = PracticeSessionEntity.builder()
                .id("ps_1")
                .user(userEntityA)
                .skill("SPEAKING")
                .status("IN_PROGRESS")
                .build();

        when(practiceSessionRepository.findById("ps_1")).thenReturn(Optional.of(session));

        PracticeSessionDto dto = studyService.getPracticeSession("ps_1", adminUser);

        assertThat(dto.getId()).isEqualTo("ps_1");
        assertThat(dto.getUserId()).isEqualTo("usr_learner_a");
    }

    @Test
    @DisplayName("6. User A adds word to personal vocabulary -> Success")
    void testAddVocabulary_Success() {
        when(userRepository.findById("usr_learner_a")).thenReturn(Optional.of(userEntityA));
        when(userVocabularyRepository.existsByUserIdAndWordIgnoreCase("usr_learner_a", "ubiquitous"))
                .thenReturn(false);
        when(userVocabularyRepository.save(any(UserVocabularyEntity.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        CreateUserVocabularyRequest req = CreateUserVocabularyRequest.builder()
                .word("ubiquitous")
                .definition("present, appearing, or found everywhere")
                .partOfSpeech("adjective")
                .build();

        UserVocabularyDto dto = studyService.addVocabulary(req, userA);

        assertThat(dto.getWord()).isEqualTo("ubiquitous");
        assertThat(dto.getUserId()).isEqualTo("usr_learner_a");
    }

    @Test
    @DisplayName("7. Duplicate word in user's personal notebook throws DUPLICATE_RESOURCE")
    void testAddVocabulary_Duplicate() {
        when(userRepository.findById("usr_learner_a")).thenReturn(Optional.of(userEntityA));
        when(userVocabularyRepository.existsByUserIdAndWordIgnoreCase("usr_learner_a", "ubiquitous"))
                .thenReturn(true);

        CreateUserVocabularyRequest req = CreateUserVocabularyRequest.builder()
                .word("ubiquitous")
                .definition("present everywhere")
                .build();

        assertThatThrownBy(() -> studyService.addVocabulary(req, userA))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.DUPLICATE_RESOURCE);
    }

    @Test
    @DisplayName("8. User B attempts to delete User A's vocabulary word -> 403 Forbidden")
    void testDeleteVocabulary_ForbiddenForOtherUser() {
        UserVocabularyEntity vocab = UserVocabularyEntity.builder()
                .id("uv_1")
                .user(userEntityA)
                .word("meticulous")
                .build();

        when(userVocabularyRepository.findById("uv_1")).thenReturn(Optional.of(vocab));

        assertThatThrownBy(() -> studyService.deleteVocabulary("uv_1", userB))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("You do not have permission to access or modify this vocabulary item");
    }

    @Test
    @DisplayName("9. User A starts test attempt on valid assessment -> Success with IN_PROGRESS")
    void testStartTestAttempt() {
        AssessmentEntity assessment = AssessmentEntity.builder()
                .id("asm_cambridge_18_t1")
                .title("Cambridge 18 Academic Test 1")
                .build();

        when(assessmentRepository.findById("asm_cambridge_18_t1")).thenReturn(Optional.of(assessment));
        when(assessmentAttemptRepository.save(any(AssessmentAttemptEntity.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        TestAttemptDto attempt = studyService.startTestAttempt("asm_cambridge_18_t1", userA);

        assertThat(attempt.getAssessmentId()).isEqualTo("asm_cambridge_18_t1");
        assertThat(attempt.getUserId()).isEqualTo("usr_learner_a");
        assertThat(attempt.getStatus()).isEqualTo("IN_PROGRESS");
    }

    @Test
    @DisplayName("10. User B attempts to submit answers to User A's test attempt -> 403 Forbidden")
    void testSubmitTestAttempt_ForbiddenForOtherUser() {
        AssessmentAttemptEntity attempt = AssessmentAttemptEntity.builder()
                .id("att_99")
                .assessmentId("asm_1")
                .userId("usr_learner_a")
                .status("IN_PROGRESS")
                .build();

        when(assessmentAttemptRepository.findById("att_99")).thenReturn(Optional.of(attempt));

        SubmitAttemptRequest req = SubmitAttemptRequest.builder()
                .answers(Map.of("q1", "A", "q2", "C"))
                .timeSpentSeconds(1800)
                .build();

        assertThatThrownBy(() -> studyService.submitTestAttempt("att_99", req, userB))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("You do not have permission to access or modify this test attempt");
    }

    @Test
    @DisplayName("11. User A submits test attempt -> Graded on server with valid IELTS band score")
    void testSubmitTestAttempt_SuccessServerGrading() {
        AssessmentAttemptEntity attempt = AssessmentAttemptEntity.builder()
                .id("att_99")
                .assessmentId("asm_1")
                .userId("usr_learner_a")
                .status("IN_PROGRESS")
                .build();

        when(assessmentAttemptRepository.findById("att_99")).thenReturn(Optional.of(attempt));
        when(assessmentAttemptRepository.save(any(AssessmentAttemptEntity.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        Map<String, Object> answers = new HashMap<>();
        for (int i = 1; i <= 24; i++) {
            answers.put("q" + i, "Answer " + i);
        }

        SubmitAttemptRequest req = SubmitAttemptRequest.builder()
                .answers(answers)
                .timeSpentSeconds(3500)
                .build();

        TestAttemptDto completed = studyService.submitTestAttempt("att_99", req, userA);

        assertThat(completed.getStatus()).isEqualTo("COMPLETED");
        assertThat(completed.getBandScore()).isNotNull();
        assertThat(completed.getBandScore()).isGreaterThan(BigDecimal.valueOf(5.0));
        assertThat(completed.getTimeSpentSeconds()).isEqualTo(3500);
    }

    @Test
    @DisplayName("12. Re-submitting already completed attempt throws BUSINESS_RULE_VIOLATION")
    void testSubmitTestAttempt_AlreadyCompletedThrows() {
        AssessmentAttemptEntity attempt = AssessmentAttemptEntity.builder()
                .id("att_99")
                .assessmentId("asm_1")
                .userId("usr_learner_a")
                .status("COMPLETED")
                .build();

        when(assessmentAttemptRepository.findById("att_99")).thenReturn(Optional.of(attempt));

        SubmitAttemptRequest req = SubmitAttemptRequest.builder()
                .answers(Map.of("q1", "A"))
                .timeSpentSeconds(120)
                .build();

        assertThatThrownBy(() -> studyService.submitTestAttempt("att_99", req, userA))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.BUSINESS_RULE_VIOLATION);
    }
}
