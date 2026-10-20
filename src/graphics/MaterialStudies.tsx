import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { studies } from '../content/copy'
import { DrawRule } from '../motion/Reveal'
import { SHADE_GLSL } from './materialShader'

/**
 * Material studies: three panels of real surface data (ambientCG, CC0 — see docs/ASSETS.md)
 * lit by a moving light in ONE small WebGL canvas.
 *
 * Each texture is a baked 512² image: R,G = tangent-space normal XY, B = roughness. The shader
 * rebuilds the normal, then lights it per material:
 *   titanium — anisotropic highlight (Ward-style) modulated by the roughness map → brushed streaks
 *   aramid   — strong relief, diffuse + sheen, so the weave "catches" the light
 *   leather  — dark, fine grain with a tight glossy highlight
 * A scripted light drifts across each panel (a "light sweep"); the pointer takes over while it is
 * over a panel. Panels are positioned by their DOM placeholders, so layout stays in CSS and the
 * stacked mobile layout needs no extra code. Reveal is scroll-linked (a wipe from the bottom).
 * The loop only runs while the strip is on screen; reduced motion draws still frames.
 */
const VERT = `attribute vec2 aPos; void main(){ gl_Position = vec4(aPos,0.0,1.0); }`

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec4 uR0; uniform vec4 uR1; uniform vec4 uR2;   // panel rects in px: x, y(top-down), w, h
uniform vec3 uRev;                                       // reveal 0..1 per panel
uniform vec3 uPtr;                                       // x, y px (top-down), active 0/1
uniform sampler2D uT0; uniform sampler2D uT1; uniform sampler2D uT2;

${SHADE_GLSL}
void main() {
  vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y); // top-down px
  vec4 R; int id; float rev;
  bool hit = false;
  vec4 r0 = uR0; vec4 r1 = uR1; vec4 r2 = uR2;
  if (p.x >= r0.x && p.x <= r0.x + r0.z && p.y >= r0.y && p.y <= r0.y + r0.w) { R = r0; id = 0; rev = uRev.x; hit = true; }
  else if (p.x >= r1.x && p.x <= r1.x + r1.z && p.y >= r1.y && p.y <= r1.y + r1.w) { R = r1; id = 1; rev = uRev.y; hit = true; }
  else if (p.x >= r2.x && p.x <= r2.x + r2.z && p.y >= r2.y && p.y <= r2.y + r2.w) { R = r2; id = 2; rev = uRev.z; hit = true; }
  if (!hit) { gl_FragColor = vec4(0.0); return; }

  vec2 uv = (p - R.xy) / R.zw;                      // 0..1, y down
  // wipe from the bottom: pixels below the reveal line are not drawn
  float line = 1.0 - rev;
  if (uv.y < line) { gl_FragColor = vec4(0.0); return; }

  float fid = float(id);
  vec2 sweep = vec2(0.5 + 0.62 * sin(uTime * 0.33 + fid * 2.1), 0.45 + 0.34 * cos(uTime * 0.27 + fid * 1.3));
  vec2 pl = (uPtr.xy - R.xy) / R.zw;
  float on = uPtr.z * smoothstep(1.3, 0.6, length(pl - 0.5));
  vec2 lightUV = mix(sweep, pl, on);

  vec3 c = shade(id, uv, lightUV, rev);
  // leading edge of the wipe glows ice-blue
  float edge = smoothstep(line + 0.035, line, uv.y) ;
  c += vec3(0.4, 0.62, 1.0) * edge * 0.5;
  gl_FragColor = vec4(c, 1.0);
}
`

const TEX = ['metal', 'fabric', 'leather'] as const

export function MaterialStudies() {
  const wrap = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const holders = useRef<(HTMLDivElement | null)[]>([])
  const reduce = !!useReducedMotion()

  useEffect(() => {
    const cv = canvas.current
    const box = wrap.current
    if (!cv || !box) return
    const gl = cv.getContext('webgl', { antialias: false, alpha: true, premultipliedAlpha: false })
    if (!gl) return

    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null
    }
    const vs = sh(gl.VERTEX_SHADER, VERT)
    const fs = sh(gl.FRAGMENT_SHADER, FRAG)
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
    const U = (n: string) => gl.getUniformLocation(prog, n)
    const u = { res: U('uRes'), time: U('uTime'), r0: U('uR0'), r1: U('uR1'), r2: U('uR2'), rev: U('uRev'), ptr: U('uPtr'), t0: U('uT0'), t1: U('uT1'), t2: U('uT2') }

    // textures (loaded lazily, when the strip first nears the viewport)
    const textures: WebGLTexture[] = []
    let loaded = 0
    const loadTextures = () => {
      TEX.forEach((name, i) => {
        const tex = gl.createTexture()!
        textures[i] = tex
        gl.activeTexture(gl.TEXTURE0 + i)
        gl.bindTexture(gl.TEXTURE_2D, tex)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, new Uint8Array([128, 128, 128]))
        const img = new Image()
        img.onload = () => {
          gl.activeTexture(gl.TEXTURE0 + i)
          gl.bindTexture(gl.TEXTURE_2D, tex)
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img)
          gl.generateMipmap(gl.TEXTURE_2D)
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT)
          loaded++
          draw(performance.now())
        }
        img.src = `${import.meta.env.BASE_URL}textures/${name}.webp`
      })
      gl.uniform1i(u.t0, 0)
      gl.uniform1i(u.t1, 1)
      gl.uniform1i(u.t2, 2)
    }

    const ptr = { x: 0, y: 0, on: 0 }
    const onMove = (e: PointerEvent) => {
      const r = box.getBoundingClientRect()
      ptr.x = e.clientX - r.left
      ptr.y = e.clientY - r.top
      ptr.on = e.pointerType === 'mouse' ? 1 : 0
    }
    window.addEventListener('pointermove', onMove, { passive: true })

    let dpr = 1
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      const r = box.getBoundingClientRect()
      cv.width = Math.max(2, Math.round(r.width * dpr))
      cv.height = Math.max(2, Math.round(r.height * dpr))
      gl.viewport(0, 0, cv.width, cv.height)
    }
    resize()
    const ro = new ResizeObserver(() => {
      resize()
      draw(performance.now())
    })
    ro.observe(box)

    const draw = (now: number) => {
      const b = box.getBoundingClientRect()
      gl.uniform2f(u.res, cv.width, cv.height)
      gl.uniform1f(u.time, reduce ? 3 : now / 1000)
      const rects = holders.current.map((h) => {
        const r = h?.getBoundingClientRect()
        return r ? [(r.left - b.left) * dpr, (r.top - b.top) * dpr, r.width * dpr, r.height * dpr] : [0, 0, 0, 0]
      })
      gl.uniform4f(u.r0, rects[0][0], rects[0][1], rects[0][2], rects[0][3])
      gl.uniform4f(u.r1, rects[1][0], rects[1][1], rects[1][2], rects[1][3])
      gl.uniform4f(u.r2, rects[2][0], rects[2][1], rects[2][2], rects[2][3])
      const vh = window.innerHeight
      const rev = holders.current.map((h, i) => {
        if (reduce) return 1
        const top = h?.getBoundingClientRect().top ?? vh
        const t = Math.min(1, Math.max(0, (vh * 0.95 - top) / (vh * 0.42)))
        return Math.min(1, Math.max(0, t - i * 0.06))
      })
      gl.uniform3f(u.rev, rev[0], rev[1], rev[2])
      gl.uniform3f(u.ptr, ptr.x * dpr, ptr.y * dpr, reduce ? 0 : ptr.on)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    let raf = 0
    let last = 0
    let visible = false
    let started = false
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop)
      if (!visible || document.hidden || t - last < 32) return
      last = t
      draw(t)
    }
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting
        if (e.isIntersecting && !started) {
          started = true
          loadTextures()
        }
      },
      { rootMargin: '300px 0px' },
    )
    io.observe(box)
    if (!reduce) raf = requestAnimationFrame(loop)
    else window.addEventListener('scroll', () => visible && draw(performance.now()), { passive: true })

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      window.removeEventListener('pointermove', onMove)
      textures.forEach((t) => gl.deleteTexture(t))
      gl.deleteProgram(prog)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      gl.deleteBuffer(buf)
      void loaded
    }
  }, [reduce])

  return (
    <div>
      <div className="flex items-baseline justify-between gap-6">
        <h3 className="label text-bone">{studies.title}</h3>
        <p className="label hidden max-w-[44ch] text-right text-[0.625rem] md:block">{studies.note}</p>
      </div>
      <DrawRule className="mt-3" />
      <div ref={wrap} className="relative mt-6">
        <canvas ref={canvas} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />
        <div className="relative grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-5">
          {studies.items.map((it, i) => (
            <figure key={it.key} className="m-0">
              <div
                ref={(el) => {
                  holders.current[i] = el
                }}
                className="study-panel aspect-[4/3] w-full border border-silver/15 md:aspect-[4/5]"
                role="img"
                aria-label={`${it.name}: ${it.text} — close-up surface study`}
              />
              <figcaption className="mt-3 flex items-baseline justify-between gap-4">
                <span className="label">
                  <span className="text-ice">{it.n}</span>&nbsp;&nbsp;
                  <span className="text-bone">{it.name}</span>
                </span>
                <span className="text-[0.8125rem] text-mist">{it.text}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
      <p className="mt-4 text-[0.75rem] text-mist md:hidden">{studies.note}</p>
    </div>
  )
}
