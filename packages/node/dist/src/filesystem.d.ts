/// <reference types="node" />
import * as fs from 'fs';
import * as path from 'path';
import { Ok, Result } from 'neverthrow';
/** *
 * interface to handle file-system related business logic
 */
export declare const Filesystem: {
    withFile: typeof withFile;
    withFiles: typeof withFiles;
    withPath: typeof withPath;
    withPaths: typeof withPaths;
    withDir: typeof withDir;
    withCurrentDir: () => string;
    withCwd: typeof withCwd;
    dirs: {
        ensureExists: typeof ensureDirectoryExists;
        read: typeof readDir;
    };
    copy: {
        files: typeof copyFiles;
        directory: typeof copyDirectoryTo;
        filesFromDir: typeof copyFilesFromDir;
    };
    writeFiles: typeof writeFiles;
};
declare type ReadDirOptions = {
    appendDirPath: boolean;
} & Parameters<typeof fs.readdirSync>[1];
declare type TextFile = {
    name: string;
    payload: string;
};
declare function writeFiles(...files: Array<TextFile>): Result<TextFile[], Error>;
declare type PathSegments = Parameters<typeof path.resolve>;
declare function withPath(...pathSegments: PathSegments): Ok<string, never>;
declare function withPaths(...paths: Array<PathSegments | string>): Ok<string[], never>;
declare function readDir(dir: string, options?: ReadDirOptions): Result<fs.Dirent[], Error>;
declare function copyDirectoryTo(_destination: string, ...sources: Array<string>): Result<string, Error>;
declare function copyFilesFromDir(destination: string, filesToCopy: Array<{
    directory: string;
    files: Array<string>;
}>): void;
declare function copyFiles(_destination: string, ...filesToCopy: Array<string>): Result<string, Error>;
declare function ensureDirectoryExists(destination: string, { isDirectory }?: {
    isDirectory: boolean;
}): Result<string, Error>;
declare function withFile(file: string): Result<string, 'FILE_NOT_EXISTS' | `FILE_ACCESS_ERROR:${string}`>;
declare function withFiles(...files: Array<string>): Result<string[], Error[]>;
declare function withDir(_directory: string, { isDirectory }?: {
    isDirectory: boolean;
}): Result<string, string | Error>;
declare function withCwd(...pathSegments: Array<string>): Ok<string, never>;
export {};
