#version 300 es

in vec3 position;
in vec3 normal;

uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;
uniform mat3 normalMatrix;

out vec3 vNormal;
out vec3 vEye;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vEye = normalize((viewMatrix * modelMatrix * vec4(position, 1.0)).xyz);
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}