struct vsOutput {
  @builtin(position) pos: vec4f,
  @location(0) color: vec4f,
}

@group(0) @binding(0) var<uniform> resolution: vec2f;
@group(0) @binding(1) var<uniform> frame: u32;

@vertex fn vs(@location(0) position: vec4f) -> @builtin(position) vec4f {
  return position;
}

@fragment fn fs(@builtin(position) position: vec4f) -> @location(0) vec4f {
  let coord = vec2f(position.xy / resolution * 2 - 1);

  let r = 0.8;
  let fframe = f32(frame);
  let offset = fract(fframe / 600) * -2 * r;
  let dist = distance(coord, vec2f(0,0));
  let color = vec4f(1, 1, 0.96, 1 - smoothstep(r - 0.03, r, distance(coord, vec2f(0,0)))) -
    vec4f(0, 0, 0, 1 - smoothstep(r - 0.04, r, distance(coord, vec2f(offset, 0))));
  return color;
}
