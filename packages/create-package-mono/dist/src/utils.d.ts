export declare const Copy: {
    files: typeof copyFiles;
    directory: typeof copyDirectoryTo;
};
declare function copyDirectoryTo(destination: string, ...sources: Array<string>): void;
declare function copyFiles(destination: string, ...filesToCopy: Array<string>): void;
export declare function withTry<T>(fun: () => T, msg?: string): T | undefined;
export {};
