import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { SHADE_GLSL } from './materialShader'

/**
 * A circular "loupe": one baked CC0 material (see docs/ASSETS.md) lit by a moving light inside a
 * round window, framed by an SVG instrument bezel (degree ticks, crosshair).
 * The light drifts on a script; the pointer takes it over while it is over the loupe.
 * The loop runs only while the loupe is on screen; reduced motion draws one still frame.
 * Without WebGL the CSS fallback in index.css (`.loupe-fallback`) shows a graded disc.
 */
const VERT = `attribute vec2 aPos; void main(){ gl_Position = vec4(aPos,0.0,1.0); }`
const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uId;
uniform vec3 uPtr;      // x,y in 0..1 (y down), active 0/1
uniform float uRev;
uniform sampler2D uT0; uniform sampler2D uT1; uniform sampler2D uT2;
${SHADE_GLSL}
void main() {
  vec2 uv = vec2(gl_FragCoord.x / uRes.x, 1.0 - gl_FragCoord.y / uRes.y);
  float r = length(uv - 0.5) * 2.0;
  if (r > 1.0) { gl_FragColor = vec4(0.0); return; }
  float id = uId;
  vec2 sweep = vec2(0.5 + 0.55 * sin(uTime * 0.31 + id * 2.0), 0.5 + 0.38 * cos(uTime * 0.23 + id));
  float on = uPtr.z * smoothstep(1.2, 0.5, length(uPtr.xy - 0.5));
  vec2 lightUV = mix(sweep, uPtr.xy, on);
  int ii = id < 0.5 ? 0 : (id < 1.5 ? 1 : 2);
  vec3 c = shade(ii, uv * 1.15 - 0.075, lightUV, uRev);
  float edge = smoothstep(1.0, 0.94, r);
  gl_FragColor = vec4(c * (1.0 - 0.45 * r * r), edge);
}
`

const FILES = ['metal', 'fabric', 'leather'] as const
export type LoupeMaterial = (typeof FILES)[number]

export function SpecimenLoupe({
  material,
  label,
  className = '',
}: {
  material: LoupeMaterial
  label: string
  className?: string
}) {
  const box = useRef<HTMLDivElement>(null)
  const cv = useRef<HTMLCanvasElement>(null)
  const reduce = !!useReducedMotion()

  useEffect(() => {
    const canvas = cv.current
    const host = box.current
    if (!canvas || !host) return
    const cnv: HTMLCanvasElement = canvas
    const gl = canvas.getContext('webgl', { antialias: true, alpha: true, premultipliedAlpha: false })
    if (!gl) return
    const sh = (t: number, src: string) => {
      const s = gl.createShader(t)!
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
    const u = { res: U('uRes'), time: U('uTime'), id: U('uId'), ptr: U('uPtr'), rev: U('uRev') }

    const id = FILES.indexOf(material)
    const tex = gl.createTexture()!
    let loaded = false
    const upload = (img: HTMLImageElement) => {
      for (let i = 0; i < 3; i++) {
        gl.activeTexture(gl.TEXTURE0 + i)
        gl.bindTexture(gl.TEXTURE_2D, tex)
      }
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img)
      gl.generateMipmap(gl.TEXTURE_2D)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT)
      loaded = true
    }
    // the same texture is bound to all three units; the shader picks the branch by id
    for (let i = 0; i < 3; i++) {
      gl.activeTexture(gl.TEXTURE0 + i)
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, new Uint8Array([128, 128, 255]))
    }
    gl.uniform1i(U('uT0'), 0)
    gl.uniform1i(U('uT1'), 1)
    gl.uniform1i(U('uT2'), 2)

    const ptr = { x: 0.5, y: 0.5, on: 0 }
    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect()
      ptr.x = (e.clientX - r.left) / r.width
      ptr.y = (e.clientY - r.top) / r.height
      ptr.on = e.pointerType === 'mouse' ? 1 : 0
    }
    window.addEventListener('pointermove', onMove, { passive: true })

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.6)
      const r = host.getBoundingClientRect()
      cnv.width = Math.max(2, Math.round(r.width * dpr))
      cnv.height = Math.max(2, Math.round(r.height * dpr))
      gl.viewport(0, 0, cnv.width, cnv.height)
    }
    resize()
    const ro = new ResizeObserver(() => {
      resize()
      draw(performance.now())
    })
    ro.observe(host)

    function draw(now: number) {
      if (!gl) return
      gl.uniform2f(u.res, cnv.width, cnv.height)
      gl.uniform1f(u.time, reduce ? 4 : now / 1000)
      gl.uniform1f(u.id, id)
      gl.uniform3f(u.ptr, ptr.x, ptr.y, reduce ? 0 : ptr.on)
      gl.uniform1f(u.rev, loaded ? 1 : 0.2)
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
          const img = new Image()
          img.onload = () => {
            upload(img)
            draw(performance.now())
          }
          img.src = `${import.meta.env.BASE_URL}textures/${material}.webp`
        }
      },
      { rootMargin: '200px 0px' },
    )
    io.observe(host)
    if (!reduce) raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      window.removeEventListener('pointermove', onMove)
      gl.deleteTexture(tex)
      gl.deleteProgram(prog)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      gl.deleteBuffer(buf)
    }
  }, [material, reduce])

  const ticks = Array.from({ length: 72 }, (_, i) => i)
  return (
    <div ref={box} className={`relative aspect-square ${className}`} role="img" aria-label={label}>
      <div className="loupe-fallback absolute inset-[4%] rounded-full" />
      <canvas ref={cv} aria-hidden="true" className="absolute inset-[4%] h-[92%] w-[92%] rounded-full" />
      {/* instrument bezel */}
      <svg viewBox="-100 -100 200 200" className="pointer-events-none absolute inset-0 h-full w-full" fill="none" aria-hidden="true">
        <circle r="97" stroke="rgb(191 200 213 / 0.35)" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
        <circle r="92.5" stroke="rgb(191 200 213 / 0.15)" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
        {ticks.map((i) => {
          const a = (i / 72) * Math.PI * 2
          const major = i % 6 === 0
          const r1 = 97
          const r2 = major ? 100 : 98.6
          return (
            <line
              key={i}
              x1={Math.sin(a) * r1}
              y1={-Math.cos(a) * r1}
              x2={Math.sin(a) * r2}
              y2={-Math.cos(a) * r2}
              stroke={major ? 'rgb(191 200 213 / 0.55)' : 'rgb(191 200 213 / 0.25)'}
              strokeWidth="0.5"
              vectorEffect="non-scaling-stroke"
            />
          )
        })}
        {/* crosshair with a gap at the centre */}
        <path d="M-92 0H-6M6 0H92M0 -92V-6M0 6V92" stroke="rgb(131 184 255 / 0.28)" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  )
}
