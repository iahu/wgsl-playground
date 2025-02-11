@group(0) @binding(0) var<uniform> resolution: vec2f;
@group(0) @binding(1) var<uniform> time: f32;

@fragment
fn main(@builtin(position) pos: vec4f) -> @location(0) vec4f {
  let st = pos.xy / resolution;
  var ct = st * 2 - 1;

  var tx = cos(time);
  var ty = -cos(time);
  var tranPos = vec2f(ct.x + tx, ct.y + ty);

  let rect = abs(tranPos) - vec2f(0.5, 0.5);
  let u = min(step(rect.x, 0), step(rect.y, 0));

  return vec4f(1, 0, 1, 1) * u + vec4f(0.3, 0.5, 1, 1 - u);
}
