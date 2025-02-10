@group(0) @binding(0) var<uniform> resolution: vec2f;
@group(0) @binding(1) var<uniform> frame: u32;

@vertex
fn vs(@location(0) pos: vec4f) -> @builtin(position) vec4f {
  return pos;
}

@fragment
fn fs(@builtin(position) position: vec4f) -> @location(0) vec4f {
  let st = vec2f(position.xy) / resolution;

  let frac = fract(st * 12);
  let dist = distance(frac, vec2f(0.5, 0.5));
  let x = 1 - smoothstep(0.4, 0.41, dist);
  let y = 1 - frac.x * frac.y;
  let color = vec4f(x, x, x, 1) + vec4f(y, y, y, 1);

  return color;
}
