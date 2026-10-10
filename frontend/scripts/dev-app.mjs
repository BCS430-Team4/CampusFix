import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const browser = [
  path.join(process.env['ProgramFiles(x86)'] || '', 'Microsoft/Edge/Application/msedge.exe'),
  path.join(process.env.ProgramFiles || '', 'Microsoft/Edge/Application/msedge.exe'),
  path.join(process.env.LOCALAPPDATA || '', 'Microsoft/Edge/Application/msedge.exe')
].find(existsSync);

if (!browser) {
  console.error('Microsoft Edge was not found. Use npm.cmd run dev and open the printed URL.');
  process.exit(1);
}

const server = spawn(process.execPath, [
  path.join(root, 'node_modules/vite/bin/vite.js'),
  'dev', '--configLoader', 'native', '--host', '127.0.0.1'
], { cwd: root, env: { ...process.env, VITE_BROWSER: 'false', NO_COLOR: '1' }, windowsHide: true, stdio: ['inherit', 'pipe', 'inherit'] });

let output = '';
let opened = false;
server.stdout.on('data', chunk => {
  process.stdout.write(chunk);
  output = (output + chunk.toString()).slice(-8192);
  const match = output.match(/Local:\s+(http:\/\/127\.0\.0\.1:\d+\/)/);
  if (match && !opened) {
    opened = true;
    const window = spawn(browser, ['--app=' + match[1], '--window-size=900,900'], { detached: true, windowsHide: true, stdio: 'ignore' });
    window.on('error', error => console.error('Could not open app window:', error.message));
    window.unref();
  }
});
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
server.on('exit', code => { process.exitCode = code ?? 0; });
process.on('SIGINT', () => server.kill('SIGINT'));
process.on('SIGTERM', () => server.kill('SIGTERM'));
