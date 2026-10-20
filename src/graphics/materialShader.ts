/**
 * Shared GLSL for lighting the three baked material textures (see docs/ASSETS.md).
 * Textures: R,G = tangent-space normal XY, B = roughness. `shade(id, uv, lightUV, rev)` returns the lit colour:
 *   id 0 titanium (anisotropic highlight modulated by roughness), 1 aramid (relief + sheen), 2 leather (tight gloss).
 * Requires: `uniform sampler2D uT0, uT1, uT2;` declared by the including shader.
 */
export const SHADE_GLSL = `
vec3 normalFrom(vec3 t, float strength) {
  vec2 n = (t.rg * 2.0 - 1.0) * strength;
  return normalize(vec3(n, 1.0));
}

vec3 shade(int id, vec2 uv, vec2 lightUV, float rev) {
  vec3 L = normalize(vec3((lightUV - uv) * vec2(1.0, 1.0) * 1.6, 0.55));
  vec3 V = vec3(0.0, 0.0, 1.0);
  vec3 H = normalize(L + V);
  vec3 col;
  if (id == 0) {
    vec3 t = texture2D(uT0, uv * vec2(1.6, 2.1)).rgb;
    float r = t.b;
    vec3 N = normalFrom(t, 2.0);
    // anisotropic highlight: stretched across the grain direction (grain runs along x)
    float hx = dot(H, vec3(1.0, 0.0, 0.0));
    float hy = dot(H, vec3(0.0, 1.0, 0.0));
    float hz = max(dot(H, N), 0.05);
    float aniso = exp(-((hx * hx) / (0.55 * 0.55) + (hy * hy) / (0.07 * 0.07)) / (hz * hz));
    float streak = 0.35 + 1.15 * r;
    float diff = max(dot(N, L), 0.0);
    col = vec3(0.17, 0.185, 0.21) * (0.45 + diff) + vec3(0.86, 0.9, 0.96) * aniso * streak * 1.5;
  } else if (id == 1) {
    vec3 t = texture2D(uT1, uv * vec2(2.4, 3.2)).rgb;
    vec3 N = normalFrom(t, 4.2);
    float diff = max(dot(N, L), 0.0);
    float rim = pow(1.0 - max(dot(N, V), 0.0), 2.4);
    float spec = pow(max(dot(N, H), 0.0), 18.0) * 0.35;
    col = vec3(0.12, 0.135, 0.165) * (0.3 + 2.6 * diff) + vec3(0.5, 0.6, 0.78) * rim * 0.6 + vec3(0.8, 0.85, 0.95) * spec * 1.4;
  } else {
    vec3 t = texture2D(uT2, uv * vec2(2.0, 2.7)).rgb;
    vec3 N = normalFrom(t, 3.0);
    float diff = max(dot(N, L), 0.0);
    float spec = pow(max(dot(N, H), 0.0), 46.0) * 0.8;
    float sheen = pow(max(dot(N, H), 0.0), 6.0) * 0.12;
    col = vec3(0.06, 0.065, 0.075) * (0.4 + 1.6 * diff) + vec3(0.85, 0.9, 1.0) * spec * 1.4 + vec3(0.45, 0.55, 0.8) * sheen * 1.6;
  }
  // vignette inside the panel + reveal ramp
  float v = 1.0 - 0.5 * dot(uv - 0.5, uv - 0.5) * 2.0;
  return col * v * (0.25 + 0.75 * rev);
}

`
