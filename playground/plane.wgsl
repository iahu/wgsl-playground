@group(0) @binding(1) var<uniform> time: f32;

@fragment
fn fsMain() -> @location(0) vec4f {
  return vec4f((sin(time * 2) + 1) / 2, 0, 0, 1);
}
