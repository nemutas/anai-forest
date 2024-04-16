vec4 blur(sampler2D source, vec2 uv, vec2 px, vec2 dir) {
  vec4 sum = vec4(0.0);

  sum += texture(source, uv - dir * 4.0 * px) * 0.051;
  sum += texture(source, uv - dir * 3.0 * px) * 0.0918;
  sum += texture(source, uv - dir * 2.0 * px) * 0.12245;
  sum += texture(source, uv - dir * 1.0 * px) * 0.1531;
  sum += texture(source, uv + dir * 0.0 * px) * 0.1633;
  sum += texture(source, uv + dir * 1.0 * px) * 0.1531;
  sum += texture(source, uv + dir * 2.0 * px) * 0.12245;
  sum += texture(source, uv + dir * 3.0 * px) * 0.0918;
  sum += texture(source, uv + dir * 4.0 * px) * 0.051;

  return sum;
}