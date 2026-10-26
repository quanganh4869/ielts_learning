import { useEffect, useRef } from 'react'

export function useScrollReveal(dependency?: unknown) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Immediately make visible if reduced motion or no IntersectionObserver
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      const elements = containerRef.current.querySelectorAll('.reveal-init')
      elements.forEach((el) => el.classList.add('reveal-active'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-active')
            observer.unobserve(entry.target)
          }
        })
      },
      {
        root: null,
        rootMargin: '50px 0px 50px 0px',
        threshold: 0.01,
      }
    )

    const elements = containerRef.current.querySelectorAll('.reveal-init')
    elements.forEach((el) => observer.observe(el))

    // Fallback: If after 400ms any element is still not active, force reveal to avoid blank screen
    const timer = setTimeout(() => {
      if (containerRef.current) {
        const remaining = containerRef.current.querySelectorAll('.reveal-init:not(.reveal-active)')
        remaining.forEach((el) => el.classList.add('reveal-active'))
      }
    }, 400)

    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [dependency])

  return containerRef
}
