import { useEffect, useRef, type ReactNode } from 'react'

export function Reveal({ children, delay = 0, className = '' }: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            el.style.transitionDelay = `${delay}ms`
            el.classList.add('is-visible')
            obs.unobserve(el)
          }
        })
      },
      { threshold: 0.15 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [delay])

  return <div ref={ref} className={`reveal ${className}`}>{children}</div>
}
