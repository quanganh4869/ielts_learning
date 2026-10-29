package com.ielts.platform.db.model;


public enum ScopeClassification {
    IELTS_KNOWLEDGE,        // Listening, Reading, Writing, Speaking, Grammar, Vocabulary
    PLATFORM_HELP,          // How to use Dashboard, Mock Tests, Practice, etc.
    PERSONAL_LEARNING_DATA, // User's band progress, skill scores, study history
    SUPPORTED_PRACTICE,     // Interactive IELTS writing/speaking practice or exercise
    OUT_OF_SCOPE,           // General knowledge, non-IELTS topics (politics, general coding, gossip, etc.)
    NEEDS_CLARIFICATION,    // Ambiguous user query requiring follow-up
    UNSAFE_OR_UNAUTHORIZED  // Prompt injection, privilege escalation, attempt to access other user's data
}
