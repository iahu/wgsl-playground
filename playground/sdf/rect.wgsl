fn circle(p: vec2f, r: f32) -> f32 {
  return max((abs(p.x) - r), (abs(p.y) - r));
}

@group(0) @binding(0) var<uniform> resolution: vec2f;
@group(0) @binding(1) var<uniform> time: f32;

@fragment
fn main(@builtin(position) pos: vec4f) -> @location(0) vec4f {
  var st = pos.xy / resolution;
  var ct = st * 2 - 1;
  ct.x = ct.x * resolution.x / resolution.y;

  let e = circle(ct, 0.5);
  let t = step(0, e);

  return vec4f(0, 0, 0.3, 1) * t + vec4f(1, 1, 1, 1) * (1 - t);
}
