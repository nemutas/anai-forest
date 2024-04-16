#version 300 es
precision highp float;

uniform sampler2D tSource;
uniform vec2 uResolution;

in vec2 vUv;
out vec4 outColor;

vec3 hash(vec3 v) {
  uvec3 x = floatBitsToUint(v + vec3(0.1, 0.2, 0.3));
  x = (x >> 8 ^ x.yzx) * 0x456789ABu;
  x = (x >> 8 ^ x.yzx) * 0x6789AB45u;
  x = (x >> 8 ^ x.yzx) * 0x89AB4567u;
  return vec3(x) / vec3(-1u);
}

void main() {
  vec2 uv = vUv;
  uv = (uv - 0.5) * 0.99 + 0.5;
  vec3 col = texture(tSource, uv).rgb;
  col *= hash(vec3(uv, 0.1)).x * (1.0 - 0.95) + 0.95;
  outColor = vec4(col, 1.0);
}