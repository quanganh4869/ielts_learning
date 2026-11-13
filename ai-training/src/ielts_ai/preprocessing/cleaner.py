"""Text Cleaning, Normalization & PII Sanitization."""

import re

# Regex patterns for Personally Identifiable Information (PII)
EMAIL_PATTERN = re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+")
PHONE_PATTERN = re.compile(r"(\+?\d{1,3}[-.\s]?)?(\(?\d{2,4}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{3,4}")
URL_PATTERN = re.compile(r"https?://\S+|www\.\S+")

def clean_text(text: str) -> str:
    """Basic whitespace and artifact normalization."""
    if not text:
        return ""
    # Normalize unicode spaces
    text = text.replace("\u200b", "").replace("\xa0", " ")
    # Replace multiple spaces with single space
    text = re.sub(r"[ \t]+", " ", text)
    # Replace more than 2 newlines with 2 newlines
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()

def sanitize_pii(text: str) -> str:
    """Mask email addresses, phone numbers and private identifiers."""
    if not text:
        return ""
    # Replace emails
    text = EMAIL_PATTERN.sub("[EMAIL_REDACTED]", text)
    # Replace phone numbers (only if length >= 9 digits)
    def phone_repl(match):
        val = match.group(0)
        digits = re.sub(r"\D", "", val)
        if len(digits) >= 9:
            return "[PHONE_REDACTED]"
        return val
    text = PHONE_PATTERN.sub(phone_repl, text)
    return text
