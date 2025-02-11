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

  const timeArray = new Float32Array([0]);
  const timeBuffer = device.createBuffer({
    size: timeArray.byteLength,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const mouseArray = new Float32Array([-1, -1]);
  const mouseBuffer = device.createBuffer({
    size: mouseArray.byteLength,
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
      {
        binding: 2,
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
          buffer: timeBuffer,
          offset: 0,
          size: timeArray.byteLength,
        },
      },
      {
        binding: 2,
        resource: {
          buffer: mouseBuffer,
          offset: 0,
          size: mouseArray.byteLength,
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

  canvas.addEventListener(
    'mousemove',
    (e) => {
      const { x, y } = canvas.getBoundingClientRect();
      mouseArray.set([e.clientX - x, e.clientY - y], 0);
    },
    { passive: true, capture: true }
  );

  let startTime = Date.now();
  function frame() {
    resolutionArray.set([canvas.width, canvas.height], 0);
    timeArray.set([(Date.now() - startTime) / 1000], 0);

    device.queue.writeBuffer(resolutionBuffer, 0, resolutionArray);
    device.queue.writeBuffer(timeBuffer, 0, timeArray);
    device.queue.writeBuffer(mouseBuffer, 0, mouseArray);

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
