#version 300 es
precision highp float;

uniform float uTime;

in float vDepth;
in vec3 vNormal;
in vec2 vUv;
out vec4 outColor;

#include './modules/noise.glsl'

void main() {
  vec3 L = normalize(vec3(-1.0, 0.5, 1.0));
  float shade = dot(-L, vNormal) * 0.5 + 0.5;
  float n = cnoise(vUv * vec2(20.0, 15.0) + vec2(0, 1) * uTime * 0.3) * 0.7;
  
  float gn = cnoise(vUv * 300.0) * cnoise(vUv * mat2(0.1, 0.2, 0.3, 0.4) * 500.0);
  gn = smoothstep(-0.1, 0.1, gn);

  shade = clamp(shade * 0.5 + n * 0.7 + gn * 0.02, 0.0, 1.0);

  outColor = vec4(vec3(shade), 1.0);
}