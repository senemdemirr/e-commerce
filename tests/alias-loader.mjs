import path from 'node:path';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

export async function resolve(specifier, context, defaultResolve) {
  if (specifier === 'next/server') {
    return defaultResolve('next/server.js', context);
  }

  if (specifier.startsWith('@/')) {
    const basePath = path.join(process.cwd(), specifier.slice(2));
    const targetPath = fs.existsSync(basePath) ? basePath : `${basePath}.js`;
    return defaultResolve(pathToFileURL(targetPath).href, context);
  }

  return defaultResolve(specifier, context);
}
