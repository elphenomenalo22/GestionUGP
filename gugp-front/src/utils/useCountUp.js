import { useEffect, useRef, useState } from 'react'

/** Anime un nombre de sa valeur affichée actuelle vers `target`. */
export function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0)
  const currentRef = useRef(0)

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const from = currentRef.current
    if (reduce || from === target) {
      currentRef.current = target
      setValue(target)
      return
    }
    let raf
    const start = performance.now()
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      const v = Math.round(from + (target - from) * eased)
      currentRef.current = v
      setValue(v)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])

  return value
}
