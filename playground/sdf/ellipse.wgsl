fn ellipse(pos: vec2f, a: f32, b: f32) -> f32 {
  let x = pos.x / a;
  let y = pos.y / b;

  return x * x + y * y - 1;
}

fn circle(pos: vec2f, r: f32) -> f32 {
  return length(pos) - r;
}

@group(0) @binding(0) var<uniform> resolution: vec2f;
@group(0) @binding(1) var<uniform> time: f32;

@fragment
fn main(@builtin(position) pos: vec4f) -> @location(0) vec4f {
  var st = pos.xy / resolution;
  var ct = st * 2 - 1;
  ct.x = ct.x * resolution.x / resolution.y;

  let e = ellipse(ct, 1, 0.5);
  let t = step(0, e);

  return vec4f(0, 0, 0.3, 1) * t + vec4f(1, 1, 1, 1) * (1 - t);
}
