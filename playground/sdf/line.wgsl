fn line(p: vec2f, l: f32) -> f32 {
  let x = abs(p.x);
  let y = abs(p.y);
  return min(max(y, x - l), length(vec2f(x - l, y)));
}

@group(0) @binding(0) var<uniform> resolution: vec2f;
@group(0) @binding(1) var<uniform> time: f32;

@fragment
fn main(@builtin(position) pos: vec4f) -> @location(0) vec4f {
  var st = pos.xy / resolution;
  var ct = st * 2 - 1;
  ct.x = ct.x * resolution.x / resolution.y;

  let e = line(ct, 0.3);
  let t = step(1 / resolution.y, e);

  return vec4f(0, 0, 0.3, 1) * t + vec4f(1, 1, 1, 1) * (1 - t);
}
