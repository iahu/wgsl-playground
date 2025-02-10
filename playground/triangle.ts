const adapter = await navigator.gpu.requestAdapter();
if (!adapter) throw Error('webgpu not found');
const device = await adapter.requestDevice();
if (!device) throw Error('webgpu device not found');
const format = navigator.gpu.getPreferredCanvasFormat();

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const devicePixelRatio = window.devicePixelRatio;
canvas.width = canvas.clientWidth * devicePixelRatio;
canvas.height = canvas.clientHeight * devicePixelRatio;

const context = canvas.getContext('webgpu')!;
context.configure({ device, format, alphaMode: 'premultiplied' });

const pipeline = device.createRenderPipeline({
  layout: 'auto',
  vertex: {
    module: device.createShaderModule({
      code: `
      @vertex
      fn vs (@builtin(vertex_index) vertexIndex: u32) -> @builtin(position) vec4f {
        let pos = array<vec2f, 3>(vec2f(-0.5, -0.5), vec2f(0.5, -0.5), vec2f(0, 0.5));

        return vec4f(pos[vertexIndex], 0.0, 1.0);
      }
      `,
    }),
  },
  fragment: {
    module: device.createShaderModule({
      code: `
      @fragment
      fn fs() -> @location(0) vec4f {
        return vec4f(1.0, 0.0, 0.0, 1.0);
      }
      `,
    }),
    targets: [
      {
        format,
      },
    ],
  },
  primitive: {
    topology: 'triangle-list',
  },
});

function frame() {
  const commandEncoder = device.createCommandEncoder();
  const textureView = context.getCurrentTexture().createView();

  const renderPassDescriptor: GPURenderPassDescriptor = {
    colorAttachments: [
      {
        view: textureView,
        clearValue: [0, 0, 0, 0], // Clear to transparent
        loadOp: 'clear',
        storeOp: 'store',
      },
    ],
  };

  const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
  passEncoder.setPipeline(pipeline);
  passEncoder.draw(3);
  passEncoder.end();

  device.queue.submit([commandEncoder.finish()]);
  requestAnimationFrame(frame);
}

frame();

export {};
