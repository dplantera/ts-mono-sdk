"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Filesystem = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const neverthrow_1 = require("neverthrow");
const process = __importStar(require("process"));
const _ = __importStar(require("lodash"));
const console = __importStar(require("console"));
const Copy = {
    files: copyFiles,
    directory: copyDirectoryTo,
    filesFromDir: copyFilesFromDir,
};
/** *
 * interface to handle file-system related business logic
 */
exports.Filesystem = {
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
function writeFiles(...files) {
    return neverthrow_1.Result.combine(files.map((f) => ensureDirectoryExists(path.dirname(f))))
        .map(() => files.map((file) => withTry(() => fs.writeFileSync(file, '', { encoding: 'utf-8' }))))
        .andThen((res) => neverthrow_1.Result.combine(res));
}
function withPath(...pathSegments) {
    return (0, neverthrow_1.ok)(path.resolve(...pathSegments));
}
function withPaths(...paths) {
    return (0, neverthrow_1.ok)(paths.map((segments) => path.resolve(...segments)));
}
function readDir(dir, options = { withFileTypes: true, appendDirPath: true }) {
    return ensureDirectoryExists(dir).andThen((ensuredDir) => withTry(() => {
        const dirEntries = fs.readdirSync(ensuredDir, options);
        return options.appendDirPath
            ? dirEntries.map((dirEntry) => _.merge(dirEntry, {
                name: path.resolve(ensuredDir, dirEntry.name),
            }))
            : dirEntries;
    }));
}
function copyDirectoryTo(_destination, ...sources) {
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
function copyFilesFromDir(destination, filesToCopy) {
    const rsFilesToCopy = filesToCopy.reduce((acc, _toCopy) => {
        const filterFilesToCopy = (dieEntries) => dieEntries.filter((dirEntry) => _toCopy.files.some((fileNameToCopy) => dirEntry.name.includes(fileNameToCopy)));
        const filesInSource = exports.Filesystem.withCwd(_toCopy.directory).andThen(exports.Filesystem.dirs.read).map(filterFilesToCopy);
        return [...acc, filesInSource];
    }, []);
    neverthrow_1.Result.combineWithAllErrors(rsFilesToCopy)
        .map(_.flatten)
        .andThen((dirEntries) => exports.Filesystem.withCwd(destination).map((copyTargetPath) => {
        const filesToCopy = dirEntries.filter((f) => f.isFile()).map((f) => f.name);
        exports.Filesystem.copy.files(copyTargetPath, ...filesToCopy);
        return filesToCopy;
    }))
        .mapErr((errs) => errs.forEach((err) => console.error(err)))
        .unwrapOr([]);
}
function copyFiles(_destination, ...filesToCopy) {
    return ensureDirectoryExists(_destination).map((destination) => {
        filesToCopy.forEach((f) => {
            const targetFile = path.resolve(destination, path.basename(f));
            console.log(`copying file: ${f} => ${targetFile}`);
            withTry(() => fs.copyFileSync(f, targetFile)).mapErr((err) => console.error(`copy failed for: ${f}: ${err.message}`));
        });
        return destination;
    });
}
function ensureDirectoryExists(destination, { isDirectory } = { isDirectory: true }) {
    return withDir(destination, { isDirectory }).orElse((dirOrError) => {
        if (typeof dirOrError === 'string') {
            return withTry(() => fs.mkdirSync(dirOrError, { recursive: true }));
        }
        return (0, neverthrow_1.err)(dirOrError);
    });
}
function withTry(fun) {
    return neverthrow_1.Result.fromThrowable(fun)().mapErr((err) => err);
}
function withFile(file) {
    return withFiles(file)
        .map((files) => files === null || files === void 0 ? void 0 : files[0])
        .mapErr((errs) => {
        const err = errs === null || errs === void 0 ? void 0 : errs[0];
        if (err.message.includes('no such file')) {
            return 'FILE_NOT_EXISTS';
        }
        return `FILE_ACCESS_ERROR:${err.message}`;
    });
}
function withFiles(...files) {
    return neverthrow_1.Result.combineWithAllErrors(files.map((file) => withTry(() => fs.readFileSync(file, { encoding: 'utf-8' }))));
}
function withDir(_directory, { isDirectory } = { isDirectory: true }) {
    const directory = isDirectory ? _directory : path.dirname(_directory);
    try {
        return fs.existsSync(directory) ? (0, neverthrow_1.ok)(directory) : (0, neverthrow_1.err)(directory);
    }
    catch (error) {
        return (0, neverthrow_1.err)(error);
    }
}
function withCwd(...pathSegments) {
    console.log(`current working directory: ${process.cwd()}`);
    return (0, neverthrow_1.ok)(path.resolve(process.cwd(), ...pathSegments));
}
