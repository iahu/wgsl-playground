const vertex = `
  @vertex fn main(@location(0) position: vec4f) -> @builtin(position) vec4f {
    return position;
  }
`;

export const setup = async (FRAG: string, VERT = vertex) => {
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

  const vertexArray = new Float32Array([-1, 1, 1, 1, -1, -1, 1, 1, 1, -1, -1, -1]);
  const vertexBuffer = device.createBuffer({
    size: vertexArray.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(vertexBuffer, 0, vertexArray);

  const resolutionArray = new Float32Array([canvas.clientWidth, canvas.clientHeight]);
  const resolutionBuffer = device.createBuffer({
    size: resolutionArray.byteLength,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
  const frameArray = new Uint32Array([0]);
  const frameBuffer = device.createBuffer({
    size: resolutionArray.byteLength,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const bindGroupLayout = device.createBindGroupLayout({
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
        buffer: { type: 'uniform' },
      },
      {
        binding: 1,
        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
        buffer: { type: 'uniform' },
      },
    ],
  });

  const bindGroup = device.createBindGroup({
    layout: bindGroupLayout,
    entries: [
      {
        binding: 0,
        resource: {
          buffer: resolutionBuffer,
          offset: 0,
          size: resolutionArray.byteLength,
        },
      },
      {
        binding: 1,
        resource: {
          buffer: frameBuffer,
          offset: 0,
          size: frameArray.byteLength,
        },
      },
    ],
  });

  const pipelineLayout = device.createPipelineLayout({
    bindGroupLayouts: [bindGroupLayout],
  });

  const pipeline = device.createRenderPipeline({
    layout: pipelineLayout,
    vertex: {
      module: device.createShaderModule({
        code: VERT,
      }),
      buffers: [
        {
          arrayStride: 2 * 4,
          attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x2' }],
        },
      ],
    },
    fragment: {
      module: device.createShaderModule({
        code: FRAG,
      }),
      targets: [
        {
          format,
          blend: {
            color: {
              srcFactor: 'src-alpha',
              dstFactor: 'one-minus-src-alpha',
            },
            alpha: {
              srcFactor: 'one',
              dstFactor: 'one-minus-src-alpha',
            },
          },
        },
      ],
    },
    primitive: {
      topology: 'triangle-list',
    },
  });

  function frame() {
    resolutionArray.set([canvas.width, canvas.height], 0);
    device.queue.writeBuffer(resolutionBuffer, 0, resolutionArray);

    frameArray.set([frameArray[0] + 1], 0);
    device.queue.writeBuffer(frameBuffer, 0, frameArray);

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
    passEncoder.setBindGroup(0, bindGroup);
    passEncoder.setVertexBuffer(0, vertexBuffer);
    passEncoder.draw(6);
    passEncoder.end();

    device.queue.submit([commandEncoder.finish()]);
    requestAnimationFrame(frame);
  }

  frame();
};
