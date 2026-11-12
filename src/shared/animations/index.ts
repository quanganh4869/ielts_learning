import { gsap } from 'gsap'

/**
 * Checks whether the user has requested reduced motion at OS/browser level
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export interface SlidePillOptions {
  container: HTMLElement
  pill: HTMLElement
  target: HTMLElement
  direction?: 'down' | 'up' | 'auto'
  onComplete?: () => void
}

/**
 * Verdilo-inspired GSAP Slide Pill Engine
 *
 * Implements the signature sliding navigation pill with asymmetric leading/trailing edge
 * timing, rounded corner clipping, and subtle mint glow.
 * - Leading edge expands quickly (0.36s) with a punchy ease
 * - Trailing edge follows smoothly and settles gracefully (0.55s)
 * - Uses exact coordinate bounding box relative to container
 */
let activePillTween: gsap.core.Timeline | null = null

export const slidePill = ({
  container,
  pill,
  target,
  direction = 'auto',
  onComplete,
}: SlidePillOptions): gsap.core.Timeline | null => {
  if (!container || !pill || !target) return null

  const reduced = prefersReducedMotion()

  const targetRect = target.getBoundingClientRect()
  const containerRect = container.getBoundingClientRect()

  // Target coordinates relative to container
  const destTop = targetRect.top - containerRect.top
  const destHeight = targetRect.height
  const destLeft = targetRect.left - containerRect.left
  const destWidth = targetRect.width

  // If reduced motion is requested, instantly snap with simple crossfade
  if (reduced) {
    gsap.set(pill, {
      top: destTop,
      height: destHeight,
      left: destLeft,
      width: destWidth,
      opacity: 1,
    })
    onComplete?.()
    return null
  }

  // Current pill position
  const currentTop = parseFloat(pill.style.top || `${destTop}`)
  const currentHeight = parseFloat(pill.style.height || `${destHeight}`)

  // Detect direction if auto
  const movingDown = direction === 'auto' ? destTop >= currentTop : direction === 'down'

  // Kill previous active animation gracefully
  if (activePillTween) {
    activePillTween.kill()
  }

  const tl = gsap.timeline({
    onComplete: () => {
      activePillTween = null
      onComplete?.()
    },
  })

  activePillTween = tl

  // If pill wasn't visible yet, fade it in smoothly
  if (parseFloat(pill.style.opacity || '0') < 0.1) {
    gsap.set(pill, {
      top: destTop,
      left: destLeft,
      width: destWidth,
      height: destHeight,
      opacity: 0,
    })
    tl.to(pill, {
      opacity: 1,
      duration: 0.25,
      ease: 'power2.out',
    })
    return tl
  }

  // Asymmetric morphing interpolation
  // Phase 1: Leading edge reaches out (0.36s)
  // Phase 2: Trailing edge catches up (0.55s)
  if (movingDown) {
    // When moving down: top expands downward, bottom stretches first
    const expandedHeight = Math.max(currentHeight, destTop + destHeight - currentTop)

    tl.to(
      pill,
      {
        height: expandedHeight,
        left: destLeft,
        width: destWidth,
        duration: 0.36,
        ease: 'power3.out',
      },
      0
    ).to(
      pill,
      {
        top: destTop,
        height: destHeight,
        duration: 0.55,
        ease: 'power3.inOut',
      },
      0.08
    )
  } else {
    // When moving up: top stretches up first, bottom catches up
    const expandedHeight = Math.max(currentHeight, currentTop + currentHeight - destTop)

    tl.to(
      pill,
      {
        top: destTop,
        height: expandedHeight,
        left: destLeft,
        width: destWidth,
        duration: 0.36,
        ease: 'power3.out',
      },
      0
    ).to(
      pill,
      {
        height: destHeight,
        duration: 0.55,
        ease: 'power3.inOut',
      },
      0.08
    )
  }

  return tl
}

/**
 * Animate page entrance: gentle blur-fade + subtle translateY (6-10px)
 * Stagger child cards/panels sequentially (35-55ms)
 */
export const animatePageEntrance = (
  container: HTMLElement | null,
  childSelector: string = '.glass-panel'
): gsap.core.Timeline | null => {
  if (!container) return null

  if (prefersReducedMotion()) {
    gsap.set(container, { opacity: 1, y: 0, filter: 'blur(0px)' })
    return null
  }

  const tl = gsap.timeline()

  // Container fade-in
  tl.fromTo(
    container,
    { opacity: 0, y: 8, filter: 'blur(4px)' },
    {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: 0.3,
      ease: 'power2.out',
      clearProps: 'filter,transform',
    }
  )

  // Stagger children panels
  const items = container.querySelectorAll(childSelector)
  if (items.length > 0) {
    tl.fromTo(
      items,
      { opacity: 0, y: 12 },
      {
        opacity: 1,
        y: 0,
        duration: 0.35,
        stagger: 0.045,
        ease: 'power2.out',
        clearProps: 'transform',
      },
      '-=0.18'
    )
  }

  return tl
}

/**
 * Count up number animation for metrics panels
 */
export const animateCountUp = (
  element: HTMLElement | null,
  endValue: number,
  duration: number = 0.75,
  formatter?: (val: number) => string
): gsap.core.Tween | null => {
  if (!element) return null

  if (prefersReducedMotion()) {
    element.textContent = formatter ? formatter(endValue) : endValue.toLocaleString()
    return null
  }

  const obj = { val: 0 }
  return gsap.to(obj, {
    val: endValue,
    duration,
    ease: 'power2.out',
    onUpdate: () => {
      const rounded = Math.round(obj.val)
      element.textContent = formatter ? formatter(rounded) : rounded.toLocaleString()
    },
  })
}

/**
 * Animate SVG circular progress stroke-dashoffset
 */
export const animateCircleProgress = (
  circleElement: SVGCircleElement | null,
  percentage: number,
  duration: number = 0.8
): gsap.core.Tween | null => {
  if (!circleElement) return null

  const circumference = 2 * Math.PI * circleElement.r.baseVal.value
  circleElement.style.strokeDasharray = `${circumference} ${circumference}`

  const targetOffset = circumference - (percentage / 100) * circumference

  if (prefersReducedMotion()) {
    circleElement.style.strokeDashoffset = `${targetOffset}`
    return null
  }

  return gsap.fromTo(
    circleElement,
    { strokeDashoffset: circumference },
    {
      strokeDashoffset: targetOffset,
      duration,
      ease: 'power2.out',
    }
  )
}
