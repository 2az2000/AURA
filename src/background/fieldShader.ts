/**
 * GLSL for the background "acoustic field". WebGL1-compatible so it runs everywhere.
 * Rendered at ~½ resolution and upscaled by the browser: everything here is soft,
 * thin-line or dust, so the resolution loss is invisible and the GPU cost is small.
 *
 * Layers (each scaled by a uniform that the storyboard animates per section):
 *  - light pool under the product (neutral ↔ cool)
 *  - angled beam through moving fog
 *  - 14 flowing frequency lines, perturbed by the pointer
 *  - iso-contour lines of a slow noise field
 *  - three dust layers with depth parallax (pointer + scroll)
 */
export const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`

export const FRAG = `
precision highp float;
uniform vec2  uRes;
uniform float uTime;
uniform vec2  uPtr;     // pointer 0..1 (y up)
uniform vec2  uLight;   // product position 0..1 (y up)
uniform float uScroll;  // scrollY / innerHeight
uniform float uTint;
uniform float uLines;
uniform float uContour;
uniform float uBeam;
uniform float uDust;
uniform float uIntro;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.03 + 17.0; a *= 0.5; }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float asp = uRes.x / uRes.y;
  vec2 p = vec2((uv.x - 0.5) * asp, uv.y - 0.5);
  vec2 ptr = vec2((uPtr.x - 0.5) * asp, uPtr.y - 0.5);

  vec3 col = vec3(0.043, 0.047, 0.055);

  // 1 — light pool under the product
  vec2 lp = vec2((uLight.x - 0.5) * asp, uLight.y - 0.5);
  float d = length(p - lp);
  vec3 pool = mix(vec3(0.085, 0.098, 0.12), vec3(0.05, 0.1, 0.17), uTint);
  col += pool * exp(-d * d * 3.4);

  // 2 — beam through fog
  vec2 bo = vec2(-0.62 * asp, 0.62);
  vec2 dir = normalize(vec2(0.55, -0.8));
  vec2 nrm = vec2(-dir.y, dir.x);
  float across = dot(p - bo, nrm);
  float along = dot(p - bo, dir);
  float fog = fbm(vec2(along * 2.4 - uTime * 0.05, across * 3.0) + uScroll * 0.15);
  float beam = exp(-across * across * 16.0) * smoothstep(-0.1, 0.55, along) * (0.4 + 1.1 * fog);
  col += mix(vec3(0.55, 0.66, 0.88), vec3(0.42, 0.62, 1.0), uTint) * beam * uBeam * 0.13;

  // 3 — flowing frequency lines
  float lines = 0.0;
  for (int i = 0; i < 14; i++) {
    float fi = float(i);
    float y = -0.56 + fi * 0.086 + 0.018 * sin(fi * 1.7);
    float ph = uTime * (0.22 + 0.017 * fi) + fi * 1.3;
    vec2 q = vec2(p.x, y);
    float near = exp(-dot(q - ptr, q - ptr) * 7.0);
    float amp = (0.016 + 0.05 * uLines) * (0.6 + 0.4 * sin(fi * 2.1)) * (1.0 + near * 1.8);
    float w = sin(p.x * 3.1 + ph) + 0.5 * sin(p.x * 7.3 - ph * 1.3 + fi) + 0.25 * sin(p.x * 13.0 + ph * 0.7);
    float yy = y + amp * w + uScroll * 0.012 * (fi - 7.0);
    float dist = abs(p.y - yy);
    float fade = smoothstep(1.25 * asp, 0.1, abs(p.x));
    float k = smoothstep(0.0021, 0.0, dist) * fade;
    lines += k * (mod(fi, 5.0) < 0.5 ? 1.6 : 0.8);
  }
  col += mix(vec3(0.62, 0.72, 0.88), vec3(0.5, 0.7, 1.0), uTint) * lines * uLines * 0.2;

  // 4 — contour lines
  float n = fbm(p * 1.5 + vec2(uTime * 0.012, uScroll * 0.06));
  float c = abs(fract(n * 9.0) - 0.5);
  float cl = 1.0 - smoothstep(0.0, 0.03, c);
  float cmask = exp(-d * d * 1.4);
  col += vec3(0.5, 0.62, 0.8) * cl * cmask * uContour * 0.085;

  // 5 — dust (three depth layers)
  float dust = 0.0;
  for (int l = 0; l < 3; l++) {
    float fl = float(l);
    float sc = 16.0 + 12.0 * fl;
    vec2 off = (uPtr - 0.5) * vec2(0.55, 0.35) * (fl + 1.0) * 0.35 + vec2(0.0, uScroll * (0.25 + 0.2 * fl));
    vec2 q = p * sc + vec2(uTime * (0.018 + 0.01 * fl), -uTime * 0.012 * (fl + 1.0)) + off * sc * 0.15;
    vec2 cell = floor(q);
    vec2 f = fract(q) - 0.5;
    float h = hash(cell + fl * 7.1);
    vec2 j = vec2(hash(cell + 1.7), hash(cell + 3.1)) - 0.5;
    float dd = length(f - j * 0.6);
    float size = 0.07 - 0.015 * fl;
    float tw = 0.5 + 0.5 * sin(uTime * (0.5 + h) + h * 30.0);
    dust += step(0.8, h) * smoothstep(size, 0.0, dd) * tw * (0.55 - 0.13 * fl);
  }
  col += vec3(0.78, 0.86, 1.0) * dust * uDust * 0.45;

  // vignette + dither (kills banding in the dark gradients)
  col *= 1.0 - 0.55 * dot(uv - 0.5, uv - 0.5);
  col += (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) / 255.0;
  gl_FragColor = vec4(col * uIntro, 1.0);
}
`
