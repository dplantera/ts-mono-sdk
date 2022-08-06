import * as fs from 'fs';
import * as path from 'path';
import { err, ok, Result } from 'neverthrow';
import * as process from 'process';

const Copy = {
  files: copyFiles,
  directory: copyDirectoryTo,
};

export const Filesystem = {
  withFile,
  withDir,
  dirs: { ensureExists: ensureDirectoryExists },
  copy: Copy,
};

function copyDirectoryTo(_destination: string, ...sources: Array<string>) {
  return ensureDirectoryExists(_destination).map((destination) => {
    console.log(`source files to: ${destination}:`);
    sources.forEach((_source) => {
      const source = path.resolve(process.cwd(), _source);
      console.log(`- copy from: ${source}`);
      withTry(() => fs.cpSync(source, destination, { recursive: true })).mapErr((err) => console.error(`- copy failed for ${source}: ${err}`));
    });
    return destination;
  });
}

function copyFiles(_destination: string, ...filesToCopy: Array<string>) {
  return ensureDirectoryExists(_destination).map((destination) => {
    filesToCopy.forEach((f) => {
      const targetFile = path.resolve(destination, path.basename(f));
      console.log(`copying file: ${f} => ${targetFile}`);
      withTry(() => fs.copyFileSync(f, targetFile)).mapErr((err) => console.error(`copy failed for: ${f}: ${err.message}`));
    });
    return destination;
  });
}

function ensureDirectoryExists(destination: string, { isDirectory } = { isDirectory: true }) {
  return withDir(destination, { isDirectory }).orElse((dirOrError) => {
    if (typeof dirOrError === 'string') {
      return withTry(() => fs.mkdirSync(dirOrError, { recursive: true }));
    }
    return err(dirOrError);
  });
}

function withTry<T, E extends Error>(fun: () => T): Result<T, E> {
  return Result.fromThrowable(fun)().mapErr((err: unknown) => err as E);
}

function withFile(file: string): Result<string, 'FILE_NOT_EXISTS' | `FILE_ACCESS_ERROR:${string}`> {
  try {
    return fs.existsSync(file) ? ok(fs.readFileSync(file, { encoding: 'utf-8' })) : err('FILE_NOT_EXISTS');
  } catch (error: unknown) {
    console.log(error);
    return err(`FILE_ACCESS_ERROR:${file}` as const);
  }
}

function withDir(_directory: string, { isDirectory } = { isDirectory: true }): Result<string, string | Error> {
  const directory = isDirectory ? _directory : path.dirname(_directory);
  try {
    return fs.existsSync(directory) ? ok(directory) : err(directory);
  } catch (error: unknown) {
    return err(error as Error);
  }
}
