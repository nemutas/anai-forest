#version 300 es
precision highp float;

uniform sampler2D tSource;
uniform vec2 uResolution;
uniform float uScale;

in vec2 vUv;
out vec4 outColor;

#include './modules/gaussian_blur.glsl'

void main() {
  vec2 suv = vUv * 2.0 - 1.0;
  float dist = smoothstep(-0.2, 1.0, abs(suv.y));
  outColor = blur(tSource, vUv, 1.0 / uResolution * uScale * dist, vec2(0, 1));
}