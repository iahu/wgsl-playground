@group(0) @binding(0) var<uniform> resolution: vec2f;
@group(0) @binding(1) var<uniform> time: f32;

@fragment
fn main(@builtin(position) pos: vec4f) -> @location(0) vec4f {
  let st = pos.xy / resolution;
  var ct = st * 2 - 1;

  let rx1 = cos(time);
  let ry1 = sin(time);
  var rotatePos1 = vec2f(
    ct.x * ry1 + ct.y * rx1,
    ct.y * ry1 - ct.x * rx1,
  );
  let rect1 = abs(rotatePos1) - vec2f(0.5, 0.5);
  let u1 = min(step(rect1.x, 0), step(rect1.y, 0));

  let rx2 = cos(time * 0.5);
  let ry2 = sin(time * 0.5);
  var rotatePos2 = vec2f(
    ct.x * ry2 + ct.y * rx2,
    ct.y * ry2 - ct.x * rx2,
  );
  let rect2 = abs(rotatePos2) - vec2f(0.25, 0.25);
  let u2 = min(step(rect2.x, 0), step(rect2.y, 0));

  return vec4f(1, 0, 1, 1) * u1 + vec4f(0.1, 0.3, 1, 1) * u2 + vec4f(0.3, 0.5, 1, 1 - u1 - u2);
}
