@group(0) @binding(0) var<uniform> resolution: vec2f;
@group(0) @binding(1) var<uniform> time: f32;

@fragment fn fsMain(@builtin(position) position: vec4f) -> @location(0) vec4f {
  let coord = vec2f(position.xy / resolution * 2 - 1);

  let r = 0.8;
  let offset = fract(time / 6) * -2 * r;
  let dist = distance(coord, vec2f(0,0));
  let color = vec4f(1, 1, 0.95, 1 - smoothstep(r - 0.05, r, distance(coord, vec2f(0,0)))) -
    vec4f(0, 0, 0, 1 - smoothstep(0.75, 1, distance(coord, vec2f(offset, 0))));
  return color;
}
