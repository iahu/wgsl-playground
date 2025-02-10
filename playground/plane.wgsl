@group(0) @binding(1) var<uniform> frame: u32;

@vertex
fn vs (@location(0) vertex: vec2f) -> @builtin(position) vec4f {
  return vec4f(vertex / 2.0, 0, 1);
}

@fragment
fn fs() -> @location(0) vec4f {
  return vec4f(1, 0, 0, abs(sin(f32(frame) / 100.0)));
}
