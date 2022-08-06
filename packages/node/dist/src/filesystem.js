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
const Copy = {
    files: copyFiles,
    directory: copyDirectoryTo,
};
/** *
 * interface to handle file-system related business logic
 */
exports.Filesystem = {
    withFile,
    withDir,
    dirs: { ensureExists: ensureDirectoryExists },
    copy: Copy,
};
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
    try {
        return fs.existsSync(file) ? (0, neverthrow_1.ok)(fs.readFileSync(file, { encoding: 'utf-8' })) : (0, neverthrow_1.err)('FILE_NOT_EXISTS');
    }
    catch (error) {
        console.log(error);
        return (0, neverthrow_1.err)(`FILE_ACCESS_ERROR:${file}`);
    }
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
