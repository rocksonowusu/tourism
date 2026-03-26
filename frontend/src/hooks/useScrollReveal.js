import { useEffect, useRef } from 'react'

/**
 * Attach to a container ref. When the element enters the viewport,
 * the class `sr--visible` is added (triggering CSS transition).
 * Pass `stagger={true}` to also animate direct children with a delay.
 */
export function useScrollReveal({ threshold = 0.12, stagger = false } = {}) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        el.classList.add('sr--visible')

        if (stagger) {
          const children = el.querySelectorAll('.sr--child')
          children.forEach((child, i) => {
            child.style.transitionDelay = `${i * 90}ms`
            child.classList.add('sr--visible')
          })
        }

        obs.disconnect()
      },
      { threshold }
    )

    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold, stagger])

  return ref
}
