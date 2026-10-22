import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { clamp, damp } from '../lib/math'
import { useIntro } from '../motion/intro'
import { easeFn, intro as T } from '../motion/tokens'
import { play } from '../play/store'
import type { SceneBridge } from '../story/hotspots'
import { story } from '../story/store'
import { detectTier } from '../three/quality'
import { FRAG, VERT } from './fieldShader'

/**
 * The background field: a full-screen fragment shader at reduced resolution (z0).
 *
 * - Parameters (lines / contour / beam / dust / tint) come from the storyboard and are damped
 *   here, so the *character* of the background changes smoothly from sheet to sheet.
 * - The pointer perturbs the lines and shifts dust layers by depth; scroll slides them.
 * - ~30 fps, paused while the tab is hidden. On the low tier or under reduced motion it draws
 *   a static frame and only redraws (throttled) when the storyboard parameters change.
 * - If WebGL fails the CSS light pools in <Atmosphere/> still provide a backdrop.
 */
export function FieldCanvas({ bridge }: { bridge: SceneBridge }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduce = !!useReducedMotion()
  const { progress } = useIntro()

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' })
    if (!gl) return

    const tier = detectTier()
    const animated = !reduce && tier !== 'low'
    const scale = tier === 'high' ? 0.55 : 0.4

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!
      gl.shaderSource(sh, src)
      gl.compileShader(sh)
      return gl.getShaderParameter(sh, gl.COMPILE_STATUS) ? sh : null
    }
    const vs = compile(gl.VERTEX_SHADER, VERT)
    const fs = compile(gl.FRAGMENT_SHADER, FRAG)
    if (!vs || !fs) return
    const prog = gl.createProgram()!
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'aPos')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    const u = (n: string) => gl.getUniformLocation(prog, n)
    const U = {
      res: u('uRes'), time: u('uTime'), ptr: u('uPtr'), light: u('uLight'), scroll: u('uScroll'),
      tint: u('uTint'), lines: u('uLines'), contour: u('uContour'), beam: u('uBeam'), dust: u('uDust'), rings: u('uRings'), grid: u('uGrid'), intro: u('uIntro'),
      boost: u('uBoost'), spin: u('uSpin'), ripA: u('uRipA'), ripB: u('uRipB'), ripC: u('uRipC'),
    }

    // smoothed state
    const st = { lines: 0, contour: 0, beam: 0, dust: 0, rings: 0, grid: 0, tint: 0, px: 0.5, py: 0.5, lx: 0.5, ly: 0.5, spin: 0 }
    const ptr = { x: 0.5, y: 0.5 }
    const onMove = (e: PointerEvent) => {
      ptr.x = e.clientX / window.innerWidth
      ptr.y = 1 - e.clientY / window.innerHeight
    }
    if (animated) window.addEventListener('pointermove', onMove, { passive: true })

    const resize = () => {
      const w = Math.max(2, Math.round(window.innerWidth * scale))
      const h = Math.max(2, Math.round(window.innerHeight * scale))
      canvas.width = w
      canvas.height = h
      gl.viewport(0, 0, w, h)
    }
    resize()
    window.addEventListener('resize', resize)

    let raf = 0
    let last = 0
    let lastT = performance.now()
    const draw = (now: number) => {
      const dt = Math.min(0.1, (now - lastT) / 1000)
      lastT = now
      const f = story.pose.field
      const k = reduce ? 40 : 2.2
      // lighting mode and the finale bias the sheet's own character
      const mode = play.state.mode
      const calm = 1 - 0.78 * bridge.light.calm
      const bias = mode === 'night' ? { l: 0.55, b: 1.7, d: 1.8, r: 0, g: 0, t: 0.7 } : mode === 'signal' ? { l: 1.6, b: 0.8, d: 1, r: 0.7, g: 0.6, t: 1 } : { l: 1, b: 1, d: 1, r: 0, g: 0, t: 0 }
      st.lines = damp(st.lines, Math.min(1.3, f.lines * bias.l * calm + (mode === 'signal' ? 0.35 : 0)), k, dt)
      st.contour = damp(st.contour, f.contour * calm, k, dt)
      st.beam = damp(st.beam, Math.min(1.3, f.beam * bias.b), k, dt)
      st.dust = damp(st.dust, f.dust * bias.d * calm, k, dt)
      st.rings = damp(st.rings, Math.min(1.2, f.rings + bias.r), k, dt)
      st.grid = damp(st.grid, Math.min(1.2, f.grid + bias.g), k, dt)
      st.tint = damp(st.tint, Math.min(1, story.pose.tint + bias.t), k, dt)
      st.spin = damp(st.spin, bridge.light.spin, 4, dt)
      st.px = damp(st.px, ptr.x, 3, dt)
      st.py = damp(st.py, ptr.y, 3, dt)
      st.lx = damp(st.lx, bridge.light.x, 5, dt)
      st.ly = damp(st.ly, bridge.light.y, 5, dt)
      const intro = easeFn.inOut(clamp((progress.get() * T.total) / 1.4))

      gl.uniform2f(U.res, canvas.width, canvas.height)
      gl.uniform1f(U.time, reduce ? 12 : now / 1000)
      gl.uniform2f(U.ptr, st.px, st.py)
      gl.uniform2f(U.light, st.lx, st.ly)
      gl.uniform1f(U.scroll, window.scrollY / window.innerHeight)
      gl.uniform1f(U.tint, st.tint)
      gl.uniform1f(U.lines, st.lines)
      gl.uniform1f(U.contour, st.contour)
      gl.uniform1f(U.beam, st.beam)
      gl.uniform1f(U.dust, st.dust)
      gl.uniform1f(U.rings, st.rings)
      gl.uniform1f(U.grid, st.grid)
      gl.uniform1f(U.intro, intro)
      gl.uniform1f(U.boost, bridge.light.boost)
      gl.uniform1f(U.spin, st.spin)
      const rips = play.ripples
      const nowMs = performance.now()
      const rp = [U.ripA, U.ripB, U.ripC]
      for (let i = 0; i < 3; i++) {
        const r = rips[rips.length - 1 - i]
        if (r && animated) gl.uniform3f(rp[i], r.x, r.y, (nowMs - r.at) / 1000)
        else gl.uniform3f(rp[i], 0, 0, -1)
      }
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    let stopWake: (() => void) | null = null
    if (animated) {
      const loop = (t: number) => {
        raf = requestAnimationFrame(loop)
        if (document.hidden || t - last < 32) return
        last = t
        draw(t)
      }
      raf = requestAnimationFrame(loop)
    } else {
      // static: redraw (throttled) whenever the story or intro moves
      let timer = 0
      const redraw = () => {
        if (timer) return
        timer = window.setTimeout(() => {
          timer = 0
          draw(performance.now())
        }, 120)
      }
      stopWake = story.onUpdate(redraw)
      const unsub = progress.on('change', redraw)
      const prev = stopWake
      stopWake = () => {
        prev()
        unsub()
      }
      draw(performance.now())
      // let the damped state converge a few frames
      for (let i = 1; i <= 6; i++) window.setTimeout(() => draw(performance.now() + i * 100), i * 80)
    }

    // A press on empty space sends a ring across the background. Not on controls, copy, or the drag zones.
    const onPress = (e: PointerEvent) => {
      if (e.button !== 0 || reduce) return
      const t = e.target as HTMLElement | null
      if (!t || t.closest('a, button, input, label, select, textarea, [role="slider"], [data-drag-zone], [data-no-ripple], header, nav, p, h1, h2, h3, h4, li, svg, canvas, form, fieldset')) return
      play.addRipple(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight)
    }
    window.addEventListener('pointerdown', onPress, { passive: true })

    const lost = (e: Event) => {
      e.preventDefault()
      cancelAnimationFrame(raf)
    }
    canvas.addEventListener('webglcontextlost', lost)

    return () => {
      cancelAnimationFrame(raf)
      stopWake?.()
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onPress)
      canvas.removeEventListener('webglcontextlost', lost)
      gl.deleteProgram(prog)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      gl.deleteBuffer(buf)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce])

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 h-full w-full" />
}
