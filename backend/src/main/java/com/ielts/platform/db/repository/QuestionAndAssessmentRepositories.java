package com.ielts.platform.db.repository;


public interface QuestionAndAssessmentRepositories {
    interface QuestionRepository extends com.ielts.platform.db.repository.QuestionRepository {}
    interface AssessmentRepository extends com.ielts.platform.db.repository.AssessmentRepository {}
    interface AssessmentAttemptRepository extends com.ielts.platform.db.repository.AssessmentAttemptRepository {}
    interface LearningPlanRepository extends com.ielts.platform.db.repository.LearningPlanRepository {}
}
