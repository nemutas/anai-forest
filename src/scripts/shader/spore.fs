#version 300 es
precision highp float;

in float vLife;
out vec4 outColor;

void main() {
  vec2 suv = gl_PointCoord * 2.0 - 1.0;
  float dist = smoothstep(1.0, 0.1, length(suv));

  float a = smoothstep(1.0, 0.0, abs(vLife * 2.0 - 1.0));

  outColor = vec4(vec3(dist), dist * a);
}