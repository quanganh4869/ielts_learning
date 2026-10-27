package com.ielts.platform.admin.questions.repository;

public interface QuestionAndAssessmentRepositories {
    interface QuestionRepository extends com.ielts.platform.admin.questions.repository.QuestionRepository {}
    interface AssessmentRepository extends com.ielts.platform.admin.questions.repository.AssessmentRepository {}
    interface AssessmentAttemptRepository extends com.ielts.platform.admin.questions.repository.AssessmentAttemptRepository {}
    interface LearningPlanRepository extends com.ielts.platform.admin.questions.repository.LearningPlanRepository {}
}
