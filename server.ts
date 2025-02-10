import { file, Glob } from 'bun';
import indexPage from './index.html' with { type: 'text' };
import path from 'path';

const glob = new Glob('*.{ts,wgsl}');

Bun.serve({
  port: 3000,
  async fetch(request, server) {
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
        const html = indexPage.replace('/* mainScript */', await tsOutput.outputs[0].text());
        return new Response(html, { headers: { 'Content-Type': 'text/html' } });
      } else if (extName === '.wgsl') {
        const shader = await Bun.file(`./playground/${pathname}`).text();
        const mainScriptOutput = await Bun.build({ entrypoints: ['./main.ts'], footer: `main(\`${shader}\`);` });
        if (!mainScriptOutput.success) return new Response('failed to build main.ts');
        const scriptContent = await mainScriptOutput.outputs[0].text();

        const html = indexPage.replace('/* mainScript */', scriptContent);
        return new Response(html, { headers: { 'Content-Type': 'text/html' } });
      }
      return new Response('.ts & .wgsl file only');
    }
    return new Response('404');
  },
});

console.log('server listening on http://localhost:3000');
