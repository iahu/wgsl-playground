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

  let day = time % 30;
  let a = 0.8 - fract(time / 15) * 1.6;
  let e = ellipse(ct, a, 0.8);
  let c = circle(ct, 0.8);
  let d = sign(day - 15);
  let s = sign(a);
  let t = ct.x;
  let cc = step(0, c);

  let m = step(0, d * s * min(s * t, max(c, e)));
  return vec4f(0, 0, 0.3, 1) * cc + (vec4f(1, 1, 1, m) * m + (1 - m) * vec4f(vec3f(0.2), 1)) * (1 - cc);
}
