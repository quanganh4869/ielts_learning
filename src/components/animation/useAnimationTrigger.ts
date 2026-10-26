import { useRef, useCallback } from 'react'

/**
 * In-memory set of triggered event IDs to prevent duplicate celebrations
 * across component re-renders and route transitions within the current session.
 */
const triggeredSessionEvents = new Set<string>()

export function useAnimationTrigger() {
  const localTriggeredRef = useRef<Set<string>>(new Set())

  /**
   * Attempts to claim an event key.
   * Returns true ONLY ONCE per unique eventKey within the session.
   * If already triggered, returns false to prevent repeated animations.
   */
  const claimEvent = useCallback((eventKey: string, persistAcrossSession = true): boolean => {
    if (!eventKey) return false

    if (persistAcrossSession) {
      if (triggeredSessionEvents.has(eventKey)) {
        return false
      }
      triggeredSessionEvents.add(eventKey)
      return true
    }

    if (localTriggeredRef.current.has(eventKey)) {
      return false
    }
    localTriggeredRef.current.add(eventKey)
    return true
  }, [])

  /**
   * Resets an event key if explicit re-triggering is required (e.g. user retries an exam)
   */
  const resetEvent = useCallback((eventKey: string) => {
    triggeredSessionEvents.delete(eventKey)
    localTriggeredRef.current.delete(eventKey)
  }, [])

  return { claimEvent, resetEvent }
}
