import * as fs from 'fs';
import * as path from 'path';
import { err, Ok, ok, Result } from 'neverthrow';
import * as process from 'process';
import * as _ from 'lodash';
import * as console from 'console';

const Copy = {
  files: copyFiles,
  directory: copyDirectoryTo,
  filesFromDir: copyFilesFromDir,
};

/** *
 * interface to handle file-system related business logic
 */
export const Filesystem = {
  withFile,
  withFiles,
  withPath,
  withPaths,
  withDir,
  withCurrentDir: () => __dirname,
  withCwd,
  dirs: { ensureExists: ensureDirectoryExists, read: readDir },
  copy: Copy,
  writeFiles,
};

type ReadDirOptions = { appendDirPath: boolean } & Parameters<typeof fs.readdirSync>[1];

function writeFiles(...files: Array<string>) {
  return Result.combine(files.map((f) => ensureDirectoryExists(path.dirname(f))))
    .map(() => files.map((file) => withTry(() => fs.writeFileSync(file, '', { encoding: 'utf-8' }))))
    .andThen((res) => Result.combine(res));
}

type PathSegments = Parameters<typeof path.resolve>;

function withPath(...pathSegments: PathSegments) {
  return ok(path.resolve(...pathSegments));
}

function withPaths(...paths: Array<PathSegments | string>) {
  return ok(paths.map((segments) => path.resolve(...segments)));
}

function readDir(dir: string, options: ReadDirOptions = { withFileTypes: true, appendDirPath: true }): Result<fs.Dirent[], Error> {
  return ensureDirectoryExists(dir).andThen((ensuredDir) =>
    withTry(() => {
      const dirEntries = fs.readdirSync(ensuredDir, options);
      return options.appendDirPath
        ? dirEntries.map((dirEntry) =>
            _.merge(dirEntry, {
              name: path.resolve(ensuredDir, dirEntry.name),
            })
          )
        : dirEntries;
    })
  );
}

function copyDirectoryTo(_destination: string, ...sources: Array<string>) {
  return ensureDirectoryExists(_destination).map((destination) => {
    console.log(`source files to: ${destination}:`);
    sources.forEach((_source) => {
      const source = path.resolve(process.cwd(), _source);
      console.log(`- copy from: ${source}`);
      withTry(() => fs.cpSync(source, destination, { recursive: true })).mapErr((err) =>
        console.error(`- copy failed for ${source}: ${err}`)
      );
    });
    return destination;
  });
}

function copyFilesFromDir(destination: string, filesToCopy: Array<{ directory: string; files: Array<string> }>) {
  const rsFilesToCopy = filesToCopy.reduce((acc, _toCopy) => {
    const filterFilesToCopy = (dieEntries: Array<fs.Dirent>) =>
      dieEntries.filter((dirEntry: fs.Dirent) => _toCopy.files.some((fileNameToCopy) => dirEntry.name.includes(fileNameToCopy)));
    const filesInSource = Filesystem.withCwd(_toCopy.directory).andThen(Filesystem.dirs.read).map(filterFilesToCopy);
    return [...acc, filesInSource];
  }, <Array<Result<fs.Dirent[], Error>>>[]);

  Result.combineWithAllErrors(rsFilesToCopy)
    .map(_.flatten)
    .andThen((dirEntries) =>
      Filesystem.withCwd(destination).map((copyTargetPath) => {
        const filesToCopy = dirEntries.filter((f) => f.isFile()).map((f) => f.name);
        Filesystem.copy.files(copyTargetPath, ...filesToCopy);
        return filesToCopy;
      })
    )
    .mapErr((errs) => errs.forEach((err) => console.error(err)))
    .unwrapOr([]);
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
  return withFiles(file)
    .map((files) => files?.[0])
    .mapErr((errs) => {
      const err = errs?.[0];
      if (err.message.includes('no such file')) {
        return 'FILE_NOT_EXISTS';
      }
      return `FILE_ACCESS_ERROR:${err.message}` as const;
    });
}

function withFiles(...files: Array<string>) {
  return Result.combineWithAllErrors(files.map((file) => withTry(() => fs.readFileSync(file, { encoding: 'utf-8' }))));
}

function withDir(_directory: string, { isDirectory } = { isDirectory: true }): Result<string, string | Error> {
  const directory = isDirectory ? _directory : path.dirname(_directory);
  try {
    return fs.existsSync(directory) ? ok(directory) : err(directory);
  } catch (error: unknown) {
    return err(error as Error);
  }
}

function withCwd(...pathSegments: Array<string>): Ok<string, never> {
  console.log(`current working directory: ${process.cwd()}`);
  return ok(path.resolve(process.cwd(), ...pathSegments));
}
