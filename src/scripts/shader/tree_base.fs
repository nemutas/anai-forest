#version 300 es
precision highp float;

in vec3 vNormal;
in vec3 vEye;
out vec4 outColor;

void main() {
  float shade = dot(vEye, vNormal) * 0.5 + 0.5;

  vec3 L = normalize(vec3(-1.0, 0.5, 1.0));
  shade += dot(-L, vNormal);

  outColor = vec4(vec3(shade * 0.3), 1.0);
}