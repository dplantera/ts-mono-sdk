import * as fs from 'fs';
import * as path from 'path';

export const Copy = {
  files: copyFiles,
  directory: copyDirectoryTo,
};

function copyDirectoryTo(destination: string, ...sources: Array<string>) {
  ensureDirectoryExists(destination);
  sources.forEach((_source) => {
    const source = path.resolve(__dirname, _source);
    console.log(`source files \n  - from: ${source} \n  - to: ${destination}`);
    fs.cpSync(source, destination, { recursive: true });
  });
}

function copyFiles(destination: string, ...filesToCopy: Array<string>): void {
  ensureDirectoryExists(destination);
  filesToCopy.forEach((f) => {
    const targetFile = path.resolve(destination, path.basename(f));
    console.log(`copying file: ${f} => ${targetFile}`);
    withTry(() => fs.copyFileSync(f, targetFile), `copy failed for: ${f}`);
  });
}

function ensureDirectoryExists(destination: string, { isDirectory } = { isDirectory: true }) {
  const directory = isDirectory ? destination : path.dirname(destination);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

export function withTry<T>(fun: () => T, msg = ''): T | undefined {
  try {
    return fun();
  } catch (error: unknown) {
    console.error(`${msg}: ${JSON.stringify(error)}`);
    return undefined;
  }
}
