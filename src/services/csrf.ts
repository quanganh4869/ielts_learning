/**
 * CSRF Utilities for Double Submit Cookie Pattern.
 * Reads the non-HttpOnly 'XSRF-TOKEN' cookie issued by Spring Security
 * and supplies it in the 'X-XSRF-TOKEN' HTTP request header for mutating calls.
 */

export function getXsrfToken(): string | null {
  if (typeof document === 'undefined') {
    return null
  }
  const match = document.cookie.match(/(?:^|;)\s*XSRF-TOKEN=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

export function withCsrfHeaders(headers: Record<string, string> = {}): Record<string, string> {
  const xsrfToken = getXsrfToken()
  if (xsrfToken) {
    return {
      ...headers,
      'X-XSRF-TOKEN': xsrfToken,
    }
  }
  return headers
}
