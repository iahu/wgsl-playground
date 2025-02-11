@group(0) @binding(1) var<uniform> frame: u32;

@fragment
fn fsMain() -> @location(0) vec4f {
  return vec4f(1, 0, 0, abs(sin(f32(frame) / 100.0)));
}
