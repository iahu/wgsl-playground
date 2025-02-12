fn cross(pos: vec2f, w: f32) -> vec4f {
  let h = step(abs(pos.x), w) * step(abs(pos.y), 1);
  let v = step(abs(pos.y), w) * step(abs(pos.x), 1);
  return vec4f(1, 0, 0, min(1, h + v));
}

@group(0) @binding(0) var<uniform> resolution: vec2f;
@group(0) @binding(1) var<uniform> time: f32;
@group(0) @binding(2) var<uniform> mouse: vec2f;

@fragment
fn fsMain(@builtin(position) pos: vec4f) -> @location(0) vec4f {
  let st = pos.xy / resolution;
  var ct = st * 2 - 1;
  ct.x = ct.x * resolution.x / resolution.y;

  let fg = cross(ct.xy * (abs(sin(time)) + 1), 0.2);
  let bg = vec4f(1) * (1 - fg.a);
  return fg + bg;
}
