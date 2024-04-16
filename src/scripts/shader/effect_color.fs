#version 300 es
precision highp float;

uniform sampler2D tColorMap;
uniform sampler2D tDepthMap;
uniform sampler2D tSporeMap;

in vec2 vUv;
out vec4 outColor;

#include './modules/packing.glsl'

void main() {
  float depth = unpackRGBAToDepth(texture(tDepthMap, vUv));
  depth = smoothstep(0.85, 1.0, depth);

  vec4 color = texture(tColorMap, vUv);
  float shade = clamp(dot(color.rgb, vec3(1)) * 0.2 + depth * 1.03, 0.0, 1.0);
  
  vec3 darkColor = vec3(0.03, 0.04, 0.02);
  vec3 lightColor = vec3(0.39, 0.45, 0.37);

  vec3 col = mix(darkColor, lightColor, shade);

  vec4 spore = texture(tSporeMap, vUv);
  col = mix(col, lightColor * 1.5, spore.r);

  outColor = vec4(col, 1.0);
}