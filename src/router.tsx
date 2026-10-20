import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type AnchorHTMLAttributes, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { duration, ease } from './motion/tokens'

/**
 * A deliberately tiny router: two routes, History API, no dependency.
 *
 *   /          → home
 *   /product   → the product experience
 *
 * Navigation between routes plays a curtain: it wipes up over the page, the route swaps behind it
 * (scroll to top, storyboard reconfigured, title sequence replayed) and it wipes away. The WebGL
 * canvas and background field live in the shell, so they persist across the swap instead of
 * being torn down and rebuilt. Under reduced motion the swap is immediate.
 *
 * Direct navigation and refresh of /product work in dev and preview because Vite serves the SPA
 * fallback, and on Vercel through the rewrite in vercel.json.
 */
export type RouteName = 'home' | 'product'

const toRoute = (path: string): RouteName => (/^\/product\/?$/.test(path) ? 'product' : 'home')

interface RouterCtx {
  route: RouteName
  /** Navigate to a path (may include a #hash). */
  go: (to: string) => void
  /** Increments each time a route swap has completed (pages use it to replay sequences). */
  swaps: number
}

const Ctx = createContext<RouterCtx | null>(null)

export function useRouter() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useRouter must be used inside <RouterProvider>')
  return c
}

const scrollToHash = (hash: string) => {
  if (!hash) return
  const el = document.getElementById(hash.replace('#', ''))
  el?.scrollIntoView({ behavior: 'auto', block: 'start' })
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion()
  const [route, setRoute] = useState<RouteName>(() => toRoute(window.location.pathname))
  const [phase, setPhase] = useState<'idle' | 'cover' | 'reveal'>('idle')
  const [swaps, setSwaps] = useState(0)
  const busy = useRef(false)

  const swap = useCallback((to: string, push: boolean) => {
    const url = new URL(to, window.location.origin)
    if (push) window.history.pushState({}, '', url.pathname + url.search + url.hash)
    setRoute(toRoute(url.pathname))
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    setSwaps((n) => n + 1)
    // let the new page mount, then honour a hash
    window.setTimeout(() => scrollToHash(url.hash), 120)
  }, [])

  const go = useCallback(
    (to: string) => {
      if (busy.current) return
      const url = new URL(to, window.location.origin)
      const sameRoute = toRoute(url.pathname) === toRoute(window.location.pathname)
      if (sameRoute) {
        if (url.hash) window.history.pushState({}, '', url.pathname + url.search + url.hash)
        scrollToHash(url.hash)
        return
      }
      if (reduce) {
        swap(to, true)
        return
      }
      busy.current = true
      setPhase('cover')
      window.setTimeout(() => {
        swap(to, true)
        setPhase('reveal')
        window.setTimeout(() => {
          setPhase('idle')
          busy.current = false
        }, 850)
      }, 650)
    },
    [reduce, swap],
  )

  useEffect(() => {
    const onPop = () => swap(window.location.pathname + window.location.hash, false)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [swap])

  const value = useMemo(() => ({ route, go, swaps }), [route, go, swaps])

  return (
    <Ctx.Provider value={value}>
      {children}
      <RouteCurtain phase={phase} />
    </Ctx.Provider>
  )
}

/** The route-change curtain: wipes up to cover, then wipes up again to reveal. Compositor-only (clip-path). */
function RouteCurtain({ phase }: { phase: 'idle' | 'cover' | 'reveal' }) {
  if (phase === 'idle') return null
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[90] bg-obsidian"
      initial={phase === 'cover' ? { clipPath: 'inset(100% 0 0 0)' } : { clipPath: 'inset(0 0 0 0)' }}
      animate={phase === 'cover' ? { clipPath: 'inset(0% 0 0 0)' } : { clipPath: 'inset(0 0 100% 0)' }}
      transition={{ duration: phase === 'cover' ? duration.slow * 0.65 : duration.slow * 0.85, ease: ease.inOut }}
    >
      <div className="wrap flex h-full items-end pb-8">
        <p className="label">AURA — {phase === 'cover' ? 'Opening' : 'Ready'}</p>
      </div>
    </motion.div>
  )
}

/** Client-side link. Falls back to a normal navigation for modified clicks / new tabs. */
export function Link({
  to,
  children,
  onClick,
  ...rest
}: { to: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>) {
  const { go } = useRouter()
  return (
    <a
      href={to}
      onClick={(e) => {
        onClick?.(e)
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
        e.preventDefault()
        go(to)
      }}
      {...rest}
    >
      {children}
    </a>
  )
}
