import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve, extname, sep} from 'node:path';
const root = resolve(import.meta.dirname);
const types = {'.html':'text/html', '.css':'text/css', '.mjs':'text/javascript', '.json':'application/json', '.md':'text/plain', '.png':'image/png', '.jpg':'image/jpeg', '.atlas':'text/plain', '.skel':'application/octet-stream'};
const portIndex = process.argv.indexOf('--port');
const port = Number(process.env.PORT || (portIndex >= 0 ? process.argv[portIndex+1] : 3000));
createServer(async (req,res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const path = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!path.startsWith(root + sep) || pathname.split('/').some(part=>part.startsWith('.'))) {res.writeHead(403).end();return;}
    const data = await readFile(path);
    res.writeHead(200, {'Content-Type':types[extname(path)] || 'text/plain', 'X-Content-Type-Options':'nosniff'}).end(data);
  } catch {res.writeHead(404).end('Not found');}
}).listen(port, '0.0.0.0', () => console.log('Sidequest: http://localhost:'+port));
