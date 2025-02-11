import { Glob } from 'bun';
import path from 'path';
import indexPage from './index.html' with { type: 'text' };

const glob = new Glob('**/*{.,.frag,}wgsl');

Bun.serve({
  port: 3000,
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === '/') {
      const files = glob.scanSync({ cwd: './playground', onlyFiles: false });
      const fileList = ['<ul>', [...files].map((file) => `<li><a href="./playground/${file}">${file}</a></li>`).join(''), '</ul>'].join('');
      return new Response(fileList, { headers: { 'Content-Type': 'text/html' } });
    }

    const match = url.pathname.match(/^\/playground\/(.+)/);
    if (match) {
      const pathname = match[1];
      const extName = path.posix.extname(pathname);
      const filename = ['.ts', '.wgsl'].includes(extName)
        ? pathname
        : (await Array.fromAsync(glob.scanSync(`./playground/${match[1]}`))).at(0);
      if (!filename) return new Response('404');

      if (extName === '.ts') {
        const tsOutput = await Bun.build({ entrypoints: [`./playground/${filename}`] });
        if (!tsOutput.success) return new Response('failed to build ts file');
        const html = indexPage.replace('/* setupScript */', await tsOutput.outputs[0].text());
        return new Response(html, { headers: { 'Content-Type': 'text/html' } });
      }

      if (extName === '.wgsl') {
        const shader = await Bun.file(`./playground/${pathname}`).text();
        const setupScriptOutput = await Bun.build({ entrypoints: ['./setup.ts'], footer: `setup(\`${shader}\`);` });
        if (!setupScriptOutput.success) return new Response('failed to build main.ts');
        const scriptContent = await setupScriptOutput.outputs[0].text();

        const html = indexPage.replace('/* setupScript */', scriptContent);
        return new Response(html, { headers: { 'Content-Type': 'text/html' } });
      }
      return new Response('.ts & .wgsl file only');
    }
    return new Response('404');
  },
});

console.log('server listening on http://localhost:3000');
