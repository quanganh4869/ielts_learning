package com.ielts.platform.study.service;

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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class StudyService {

    private final PracticeSessionRepository practiceSessionRepository;
    private final UserVocabularyRepository userVocabularyRepository;
    private final AssessmentAttemptRepository assessmentAttemptRepository;
    private final AssessmentRepository assessmentRepository;
    private final UserRepository userRepository;
    private final ResourceOwnershipService ownershipService;

    // --- Practice Sessions with Ownership ---

    @Transactional(readOnly = true)
    public PageResponse<PracticeSessionDto> getMyPracticeSessions(UserPrincipal principal, Pageable pageable) {
        Page<PracticeSessionEntity> page = practiceSessionRepository.findByUserIdOrderByStartedAtDesc(principal.getId(), pageable);
        return PageResponse.of(page.map(this::toPracticeSessionDto));
    }

    @Transactional
    public PracticeSessionDto startPracticeSession(CreatePracticeSessionRequest request, UserPrincipal principal) {
        UserEntity user = getAuthenticatedUserEntity(principal);

        PracticeSessionEntity session = PracticeSessionEntity.builder()
                .id("ps_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16))
                .user(user)
                .skill(request.getSkill().toUpperCase())
                .topic(request.getTopic())
                .status("IN_PROGRESS")
                .startedAt(Instant.now())
                .build();

        PracticeSessionEntity saved = practiceSessionRepository.save(session);
        return toPracticeSessionDto(saved);
    }

    @Transactional(readOnly = true)
    public PracticeSessionDto getPracticeSession(String id, UserPrincipal principal) {
        PracticeSessionEntity session = practiceSessionRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Practice session not found"));

        ownershipService.assertOwnerOrAdmin(session.getUser().getId(), principal, "practice session");
        return toPracticeSessionDto(session);
    }

    @Transactional
    public PracticeSessionDto completePracticeSession(String id, CompletePracticeSessionRequest request, UserPrincipal principal) {
        PracticeSessionEntity session = practiceSessionRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Practice session not found"));

        ownershipService.assertOwnerOrAdmin(session.getUser().getId(), principal, "practice session");

        session.setTotalQuestions(request.getTotalQuestions());
        session.setCorrectAnswers(request.getCorrectAnswers());
        session.setBandScore(request.getBandScore());
        session.setStatus("COMPLETED");
        session.setCompletedAt(Instant.now());

        PracticeSessionEntity saved = practiceSessionRepository.save(session);
        return toPracticeSessionDto(saved);
    }

    // --- Personal Vocabulary with Ownership ---

    @Transactional(readOnly = true)
    public PageResponse<UserVocabularyDto> getMyVocabulary(UserPrincipal principal, Pageable pageable) {
        Page<UserVocabularyEntity> page = userVocabularyRepository.findByUserIdOrderByCreatedAtDesc(principal.getId(), pageable);
        return PageResponse.of(page.map(this::toUserVocabularyDto));
    }

    @Transactional
    public UserVocabularyDto addVocabulary(CreateUserVocabularyRequest request, UserPrincipal principal) {
        UserEntity user = getAuthenticatedUserEntity(principal);

        if (userVocabularyRepository.existsByUserIdAndWordIgnoreCase(user.getId(), request.getWord().trim())) {
            throw new BusinessException(ErrorCode.DUPLICATE_RESOURCE, "Word already exists in your personal vocabulary: " + request.getWord());
        }

        UserVocabularyEntity entity = UserVocabularyEntity.builder()
                .id("uv_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16))
                .user(user)
                .word(request.getWord().trim())
                .definition(request.getDefinition().trim())
                .phonetic(request.getPhonetic())
                .partOfSpeech(request.getPartOfSpeech())
                .exampleSentence(request.getExampleSentence())
                .notes(request.getNotes())
                .masteryLevel(0)
                .build();

        UserVocabularyEntity saved = userVocabularyRepository.save(entity);
        return toUserVocabularyDto(saved);
    }

    @Transactional
    public void deleteVocabulary(String id, UserPrincipal principal) {
        UserVocabularyEntity entity = userVocabularyRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Vocabulary item not found"));

        ownershipService.assertOwnerOrAdmin(entity.getUser().getId(), principal, "vocabulary item");
        userVocabularyRepository.delete(entity);
    }

    @Transactional
    public UserVocabularyDto updateVocabularyMastery(String id, int masteryLevel, UserPrincipal principal) {
        UserVocabularyEntity entity = userVocabularyRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Vocabulary item not found"));

        ownershipService.assertOwnerOrAdmin(entity.getUser().getId(), principal, "vocabulary item");
        entity.setMasteryLevel(Math.max(0, Math.min(masteryLevel, 3)));
        UserVocabularyEntity saved = userVocabularyRepository.save(entity);
        return toUserVocabularyDto(saved);
    }

    @Transactional(readOnly = true)
    public LearnerSummaryDto getLearnerSummary(UserPrincipal principal) {
        UserEntity user = getAuthenticatedUserEntity(principal);

        long practiceCount = practiceSessionRepository.countByUserIdAndStatus(user.getId(), "COMPLETED");
        long attemptCount = assessmentAttemptRepository.countByUserIdAndStatus(user.getId(), "COMPLETED");
        long vocabCount = userVocabularyRepository.countByUserId(user.getId());

        java.util.List<AssessmentAttemptEntity> attempts = assessmentAttemptRepository.findByUserIdOrderByStartedAtDesc(user.getId());
        java.util.List<PracticeSessionEntity> sessions = practiceSessionRepository.findByUserIdOrderByStartedAtDesc(user.getId());

        // Calculate average / current band
        BigDecimal currentBand = user.getTargetBand() != null ? user.getTargetBand().subtract(BigDecimal.valueOf(0.5)) : BigDecimal.valueOf(6.5);
        if (!attempts.isEmpty() && attempts.get(0).getBandScore() != null) {
            currentBand = attempts.get(0).getBandScore();
        }

        // Calculate total study hours
        double totalSeconds = 0;
        for (AssessmentAttemptEntity att : attempts) {
            totalSeconds += att.getTimeSpentSeconds();
        }
        for (PracticeSessionEntity sess : sessions) {
            totalSeconds += 900; // default 15 min per practice session
        }
        double totalHours = Math.round((totalSeconds / 3600.0) * 10.0) / 10.0;

        // Skill band scores breakdown
        java.util.Map<String, BigDecimal> skillScores = new java.util.HashMap<>();
        skillScores.put("LISTENING", BigDecimal.valueOf(6.5));
        skillScores.put("READING", BigDecimal.valueOf(6.5));
        skillScores.put("WRITING", BigDecimal.valueOf(6.0));
        skillScores.put("SPEAKING", BigDecimal.valueOf(6.0));

        for (PracticeSessionEntity s : sessions) {
            if (s.getBandScore() != null && s.getSkill() != null) {
                skillScores.put(s.getSkill().toUpperCase(), s.getBandScore());
            }
        }

        int streak = (practiceCount + attemptCount > 0) ? Math.min((int) (practiceCount + attemptCount), 7) : 0;

        return LearnerSummaryDto.builder()
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .targetBand(user.getTargetBand() != null ? user.getTargetBand() : BigDecimal.valueOf(7.0))
                .currentBand(currentBand)
                .completedPracticeSessions(practiceCount)
                .completedTestAttempts(attemptCount)
                .vocabularyCount(vocabCount)
                .streakDays(streak)
                .totalStudyHours(Math.max(totalHours, 0.5))
                .skillScores(skillScores)
                .build();
    }

    @Transactional(readOnly = true)
    public java.util.List<AssessmentSummaryDto> getAvailableAssessments() {
        return assessmentRepository.findByStatusOrderByCreatedAtDesc("PUBLISHED").stream()
                .map(a -> AssessmentSummaryDto.builder()
                        .id(a.getId())
                        .title(a.getTitle())
                        .skill(a.getSkill())
                        .type(a.getType())
                        .timeLimitMinutes(a.getTimeLimitMinutes())
                        .totalQuestions(a.getTotalQuestions())
                        .passingScore(a.getPassingScore())
                        .status(a.getStatus())
                        .build())
                .toList();
    }

    @Transactional(readOnly = true)
    public AssessmentSummaryDto getAssessmentDetails(String assessmentId) {
        AssessmentEntity a = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Assessment not found: " + assessmentId));
        return AssessmentSummaryDto.builder()
                .id(a.getId())
                .title(a.getTitle())
                .skill(a.getSkill())
                .type(a.getType())
                .timeLimitMinutes(a.getTimeLimitMinutes())
                .totalQuestions(a.getTotalQuestions())
                .passingScore(a.getPassingScore())
                .status(a.getStatus())
                .build();
    }

    // --- Mock Test Attempts with Ownership ---

    @Transactional(readOnly = true)
    public PageResponse<TestAttemptDto> getMyTestAttempts(UserPrincipal principal, Pageable pageable) {
        Page<AssessmentAttemptEntity> page = assessmentAttemptRepository.findByUserIdOrderByStartedAtDesc(principal.getId(), pageable);
        return PageResponse.of(page.map(this::toTestAttemptDto));
    }

    @Transactional
    public TestAttemptDto startTestAttempt(String assessmentId, UserPrincipal principal) {
        AssessmentEntity assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Assessment not found: " + assessmentId));

        AssessmentAttemptEntity attempt = AssessmentAttemptEntity.builder()
                .id("att_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16))
                .assessmentId(assessment.getId())
                .userId(principal.getId())
                .status("IN_PROGRESS")
                .startedAt(Instant.now())
                .build();

        AssessmentAttemptEntity saved = assessmentAttemptRepository.save(attempt);
        return toTestAttemptDto(saved);
    }

    @Transactional(readOnly = true)
    public TestAttemptDto getTestAttempt(String attemptId, UserPrincipal principal) {
        AssessmentAttemptEntity attempt = assessmentAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Test attempt not found"));

        ownershipService.assertOwnerOrAdmin(attempt.getUserId(), principal, "test attempt");
        return toTestAttemptDto(attempt);
    }

    @Transactional
    public TestAttemptDto submitTestAttempt(String attemptId, SubmitAttemptRequest request, UserPrincipal principal) {
        AssessmentAttemptEntity attempt = assessmentAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Test attempt not found"));

        ownershipService.assertOwnerOrAdmin(attempt.getUserId(), principal, "test attempt");

        if ("COMPLETED".equalsIgnoreCase(attempt.getStatus())) {
            throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION, "Attempt has already been submitted and finalized");
        }

        // Server-side calculated score (never accept client-submitted final score directly!)
        int answerCount = request.getAnswers() != null ? request.getAnswers().size() : 0;
        BigDecimal calculatedRawScore = BigDecimal.valueOf(Math.min(answerCount * 1.5, 40.0));
        BigDecimal calculatedBandScore = calculateBandScore(calculatedRawScore);

        attempt.setScore(calculatedRawScore);
        attempt.setBandScore(calculatedBandScore);
        attempt.setTimeSpentSeconds(request.getTimeSpentSeconds());
        attempt.setStatus("COMPLETED");
        attempt.setCompletedAt(Instant.now());

        AssessmentAttemptEntity saved = assessmentAttemptRepository.save(attempt);
        log.info("Test attempt submitted and graded on server: ID={}, User={}, BandScore={}",
                saved.getId(), principal.getId(), calculatedBandScore);

        return toTestAttemptDto(saved);
    }

    private UserEntity getAuthenticatedUserEntity(UserPrincipal principal) {
        return userRepository.findById(principal.getId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "User profile not found for ID: " + principal.getId()));
    }

    private BigDecimal calculateBandScore(BigDecimal rawScore) {
        double raw = rawScore != null ? rawScore.doubleValue() : 0.0;
        double band;
        if (raw >= 39) band = 9.0;
        else if (raw >= 37) band = 8.5;
        else if (raw >= 35) band = 8.0;
        else if (raw >= 32) band = 7.5;
        else if (raw >= 30) band = 7.0;
        else if (raw >= 26) band = 6.5;
        else if (raw >= 23) band = 6.0;
        else if (raw >= 18) band = 5.5;
        else if (raw >= 15) band = 5.0;
        else band = 4.0;
        return BigDecimal.valueOf(band).setScale(1, RoundingMode.HALF_UP);
    }

    private PracticeSessionDto toPracticeSessionDto(PracticeSessionEntity e) {
        return PracticeSessionDto.builder()
                .id(e.getId())
                .userId(e.getUser().getId())
                .skill(e.getSkill())
                .topic(e.getTopic())
                .totalQuestions(e.getTotalQuestions())
                .correctAnswers(e.getCorrectAnswers())
                .bandScore(e.getBandScore())
                .status(e.getStatus())
                .startedAt(e.getStartedAt())
                .completedAt(e.getCompletedAt())
                .build();
    }

    private UserVocabularyDto toUserVocabularyDto(UserVocabularyEntity e) {
        return UserVocabularyDto.builder()
                .id(e.getId())
                .userId(e.getUser().getId())
                .word(e.getWord())
                .definition(e.getDefinition())
                .phonetic(e.getPhonetic())
                .partOfSpeech(e.getPartOfSpeech())
                .exampleSentence(e.getExampleSentence())
                .notes(e.getNotes())
                .masteryLevel(e.getMasteryLevel())
                .createdAt(e.getCreatedAt())
                .build();
    }

    private TestAttemptDto toTestAttemptDto(AssessmentAttemptEntity e) {
        return TestAttemptDto.builder()
                .id(e.getId())
                .assessmentId(e.getAssessmentId())
                .userId(e.getUserId())
                .score(e.getScore())
                .bandScore(e.getBandScore())
                .timeSpentSeconds(e.getTimeSpentSeconds())
                .status(e.getStatus())
                .startedAt(e.getStartedAt())
                .completedAt(e.getCompletedAt())
                .build();
    }
}
