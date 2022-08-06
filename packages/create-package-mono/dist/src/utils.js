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
exports.withTry = exports.Copy = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
exports.Copy = {
    files: copyFiles,
    directory: copyDirectoryTo,
};
function copyDirectoryTo(destination, ...sources) {
    ensureDirectoryExists(destination);
    sources.forEach((_source) => {
        const source = path.resolve(__dirname, _source);
        console.log(`source files \n  - from: ${source} \n  - to: ${destination}`);
        fs.cpSync(source, destination, { recursive: true });
    });
}
function copyFiles(destination, ...filesToCopy) {
    ensureDirectoryExists(destination);
    filesToCopy.forEach((f) => {
        const targetFile = path.resolve(destination, path.basename(f));
        console.log(`copying file: ${f} => ${targetFile}`);
        withTry(() => fs.copyFileSync(f, targetFile), `copy failed for: ${f}`);
    });
}
function ensureDirectoryExists(destination, { isDirectory } = { isDirectory: true }) {
    const directory = isDirectory ? destination : path.dirname(destination);
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }
}
function withTry(fun, msg = '') {
    try {
        return fun();
    }
    catch (error) {
        console.error(`${msg}: ${JSON.stringify(error)}`);
        return undefined;
    }
}
exports.withTry = withTry;
