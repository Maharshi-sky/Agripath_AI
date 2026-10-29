// Converts the single-file Vite build into an Artifact page fragment:
// the hosting skeleton supplies doctype/html/head/body, so we emit title, meta, links, styles, scripts and body content.
import { readFileSync, writeFileSync } from 'node:fs';
const html = readFileSync('dist-artifact/index.html', 'utf8');
const head = html.match(/<head>([\s\S]*?)<\/head>/i)[1];
const body = html.match(/<body>([\s\S]*?)<\/body>/i)[1];
const pick = (re) => [...head.matchAll(re)].map((m) => m[0]);
const title = pick(/<title>[\s\S]*?<\/title>/gi);
const metas = pick(/<meta name="(claude:viewport-fit-sides|description)"[^>]*>/gi);
const links = pick(/<link rel="(stylesheet|preconnect)"[^>]*>/gi);
const styles = pick(/<style[\s\S]*?<\/style>/gi);
const scripts = pick(/<script[\s\S]*?<\/script>/gi);
const out = [...title, ...metas, ...links, ...styles, body.replace(/<script[\s\S]*?<\/script>/gi, '').trim(), ...scripts].join('\n');
writeFileSync('dist-artifact/agripass.html', out);
console.log('artifact fragment:', (out.length / 1024).toFixed(0), 'KB');
