import { Result } from 'neverthrow';
/** *
 * interface to handle file-system related business logic
 */
export declare const Filesystem: {
    withFile: typeof withFile;
    withDir: typeof withDir;
    dirs: {
        ensureExists: typeof ensureDirectoryExists;
    };
    copy: {
        files: typeof copyFiles;
        directory: typeof copyDirectoryTo;
    };
};
declare function copyDirectoryTo(_destination: string, ...sources: Array<string>): Result<string, Error>;
declare function copyFiles(_destination: string, ...filesToCopy: Array<string>): Result<string, Error>;
declare function ensureDirectoryExists(destination: string, { isDirectory }?: {
    isDirectory: boolean;
}): Result<string, Error>;
declare function withFile(file: string): Result<string, 'FILE_NOT_EXISTS' | `FILE_ACCESS_ERROR:${string}`>;
declare function withDir(_directory: string, { isDirectory }?: {
    isDirectory: boolean;
}): Result<string, string | Error>;
export {};
