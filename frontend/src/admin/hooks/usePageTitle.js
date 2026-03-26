import { useEffect } from 'react'

/**
 * Sets document.title while the component is mounted, then restores the default.
 * @param {string} title  e.g. 'Events'
 * @param {string} suffix e.g. 'Tourism Admin'
 */
export function usePageTitle(title, suffix = 'Tourism Admin') {
  useEffect(() => {
    const prev = document.title
    document.title = title ? `${title} — ${suffix}` : suffix
    return () => { document.title = prev }
  }, [title, suffix])
}
