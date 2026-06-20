import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const root = 'article/专题/threejs 专题学习/cases';
const baseUrl = 'http://127.0.0.1:8099/cases/';
const port = 9333;
const useExistingChrome = process.argv.includes('--use-existing');

const htmlFiles = fs.readdirSync(root)
  .filter((file) => file.endsWith('.html') && file !== 'index.html')
  .sort();

const chrome = useExistingChrome ? null : spawn(chromePath, [
  '--headless=new',
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-extensions',
  `--remote-debugging-port=${port}`,
  '--user-data-dir=/tmp/three-case-check-chrome',
  'about:blank'
], { stdio: ['ignore', 'pipe', 'pipe'] });

try {
  await waitForChrome();
  const failures = [];

  for (const file of htmlFiles) {
    const result = await checkPage(file);
    if (result.errors.length > 0) failures.push(result);
    console.log(`${result.errors.length ? 'FAIL' : 'ok  '} ${file}${result.errors.length ? ` (${result.errors.length})` : ''}`);
  }

  if (failures.length > 0) {
    console.log('\nFailures:');
    for (const failure of failures) {
      console.log(`\n## ${failure.file}`);
      for (const error of failure.errors.slice(0, 8)) console.log(`- ${error}`);
      if (failure.errors.length > 8) console.log(`- ... ${failure.errors.length - 8} more`);
    }
    process.exitCode = 1;
  }
} finally {
  if (chrome) chrome.kill('SIGTERM');
}

async function waitForChrome() {
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (res.ok) return;
    } catch {}
    await delay(150);
  }
  throw new Error('Chrome DevTools endpoint did not start');
}

async function checkPage(file) {
  const target = await createTarget();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  const pending = new Map();
  let id = 0;
  const errors = [];

  ws.addEventListener('message', (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
      return;
    }

    if (msg.method === 'Runtime.exceptionThrown') {
      const details = msg.params.exceptionDetails;
      errors.push(`exception: ${details.text || ''} ${details.exception?.description || details.exception?.value || ''}`.trim());
    }

    if (msg.method === 'Runtime.consoleAPICalled' && ['error', 'assert'].includes(msg.params.type)) {
      const text = msg.params.args.map((arg) => arg.value ?? arg.description ?? '').join(' ');
      if (!text.includes('favicon.ico')) errors.push(`console ${msg.params.type}: ${text}`);
    }

    if (msg.method === 'Network.loadingFailed') {
      const url = msg.params.requestId;
      errors.push(`network failed: ${msg.params.errorText} (${url})`);
    }

    if (msg.method === 'Network.responseReceived') {
      const { response } = msg.params;
      if (response.status >= 400 && !response.url.endsWith('/favicon.ico')) {
        errors.push(`http ${response.status}: ${response.url}`);
      }
    }
  });

  await new Promise((resolve) => ws.addEventListener('open', resolve, { once: true }));

  const send = (method, params = {}) => new Promise((resolve) => {
    const nextId = ++id;
    pending.set(nextId, resolve);
    ws.send(JSON.stringify({ id: nextId, method, params }));
  });

  await send('Runtime.enable');
  await send('Network.enable');
  await send('Page.enable');
  await send('Log.enable');
  await send('Page.navigate', { url: baseUrl + encodeURIComponent(file) });
  await delay(3500);
  ws.close();

  return { file, errors: [...new Set(errors)] };
}

async function createTarget() {
  const res = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent('about:blank')}`, { method: 'PUT' });
  if (!res.ok) throw new Error(`Cannot create target: ${res.status}`);
  return res.json();
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
