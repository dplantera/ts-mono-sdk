import * as fs from 'fs';
import * as path from 'path';
import { err, ok, Result } from 'neverthrow';

const Copy = {
  files: copyFiles,
  directory: copyDirectoryTo,
};

export const Filesystem = {
  withFile,
  dirs: { ensureExists: ensureDirectoryExists },
  copy: Copy,
};

function copyDirectoryTo(destination: string, ...sources: Array<string>) {
  ensureDirectoryExists(destination);
  console.log(`source files to: ${destination}:`);
  sources.forEach((_source) => {
    const source = path.resolve(__dirname, _source);
    console.log(`- copy from: ${source}`);
    withTry(() => fs.cpSync(source, destination, { recursive: true })).mapErr((err) => console.error(`- copy failed for ${source}: ${err}`));
  });
}

function copyFiles(destination: string, ...filesToCopy: Array<string>): void {
  ensureDirectoryExists(destination);
  filesToCopy.forEach((f) => {
    const targetFile = path.resolve(destination, path.basename(f));
    console.log(`copying file: ${f} => ${targetFile}`);
    withTry(() => fs.copyFileSync(f, targetFile)).mapErr((err) => console.error(`copy failed for: ${f}: ${err.message}`));
  });
}

function ensureDirectoryExists(destination: string, { isDirectory } = { isDirectory: true }) {
  const directory = isDirectory ? destination : path.dirname(destination);
  return withFile(directory)
    .mapErr(() => fs.mkdirSync(directory, { recursive: true }))
    .match(
      () => 'ENSURED',
      (error) => error
    );
}

function withTry<T>(fun: () => T): Result<T, Error> {
  try {
    return ok(fun());
  } catch (error: unknown) {
    return err(error as Error);
  }
}

function withFile(file: string): Result<string, 'FILE_NOT_EXISTS' | 'FILE_ACCESS_ERROR'> {
  try {
    return fs.existsSync(file) ? ok(fs.readFileSync(file, { encoding: 'utf-8' })) : err('FILE_NOT_EXISTS');
  } catch (error: unknown) {
    console.log(error);
    return err('FILE_ACCESS_ERROR');
  }
}
