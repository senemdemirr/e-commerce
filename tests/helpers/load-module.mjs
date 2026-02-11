import path from 'node:path';
import { pathToFileURL } from 'node:url';

export async function loadFresh(workspaceRelativePath) {
  const absolute = path.join(process.cwd(), workspaceRelativePath);
  return import(`${pathToFileURL(absolute).href}?t=${Date.now()}-${Math.random()}`);
}
