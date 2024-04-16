#version 300 es

in vec3 position;

uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;
uniform float uTime;

out float vLife;

vec3 hash(vec3 v) {
  uvec3 x = floatBitsToUint(v + vec3(0.1, 0.2, 0.3));
  x = (x >> 8 ^ x.yzx) * 0x456789ABu;
  x = (x >> 8 ^ x.yzx) * 0x6789AB45u;
  x = (x >> 8 ^ x.yzx) * 0x89AB4567u;
  return vec3(x) / vec3(-1u);
}

mat2 rot(float a) {
  float s = sin(a), c = cos(a);
  return mat2(c, s, -s, c);
}

void main() {
  vec3 pos = position;

  float time = uTime * 0.2 * (hash(vec3(gl_VertexID)).x + 1.0);
  float life = fract(time);
  float seed = floor(time);
  vec3 h = hash(pos + seed);

  pos.y = (h.y * 2.0 - 1.0) * 3.0 + life;
  pos.z = (h.z * 2.0 - 1.0) * 7.0;

  float scale = smoothstep(1.0, 0.0, abs(life * 2.0 - 1.0)) * 0.5 + 0.5;

  vLife = life;

  vec4 mvPos = viewMatrix * modelMatrix * vec4(pos, 1.0);
  gl_PointSize = -200.0 / mvPos.z * scale;
  gl_Position = projectionMatrix * mvPos;

  gl_Position.x = (h.x * 2.0 - 1.0) * gl_Position.w;
  gl_Position.xy *= rot((h.z * 2.0 - 1.0) * 0.2);
}