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
exports.createMonoPackage = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function createMonoPackage(args) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { packageName, verbose, packageRoot } = args;
    const packagesRoot = path.resolve(process.cwd(), packageRoot);
    const packagePath = path.resolve(packagesRoot, packageName);
    console.log({ packagesRoot, packagePath });
    console.log({ packagesRoot, packagePath });
    copyBinFilesTo(packagePath);
    mergePackageJson(packagePath, packageName);
    createFolderStructure(packagePath);
}
exports.createMonoPackage = createMonoPackage;
function copyBinFilesTo(target) {
    if (!fs.existsSync(target)) {
        console.log(`Creating ${target}`);
        fs.mkdirSync(target);
    }
    const bin = path.resolve(__dirname, '../bin');
    console.log(`Copy files \n  - from: ${bin} \n  - to: ${target}`);
    fs.cpSync(bin, target, { recursive: true });
}
function mergePackageJson(packagePath, name) {
    const jsonBin = require(path.resolve(__dirname, '../bin', 'package.json'));
    const jsonTargetPath = path.resolve(packagePath, 'package.json');
    const jsonTarget = require(jsonTargetPath);
    const merged = Object.assign(Object.assign({}, jsonTarget), { name: jsonTarget.name !== jsonBin.name ? jsonTarget.name : jsonTarget.name.replace(/(?<=\/).*/u, name), scripts: Object.keys(jsonBin.scripts).reduce((targetJson, key) => {
            if (!targetJson[key]) {
                console.log(`Adding new script: ${key}`);
                targetJson[key] = jsonBin.scripts[key];
                return targetJson;
            }
            if (targetJson[key].startsWith(';')) {
                console.log(`Overwrite scripts key: ${key}`);
                targetJson[key] = jsonBin.scripts[key];
                return targetJson;
            }
            return targetJson;
        }, Object.assign({}, jsonTarget.scripts)) });
    fs.writeFileSync(jsonTargetPath, JSON.stringify(merged, undefined, 2));
}
function createFolderStructure(packagePath) {
    const files = [path.resolve(packagePath, 'src', 'index.ts')];
    files.forEach((file) => !fs.existsSync(path.dirname(file)) && fs.mkdirSync(path.dirname(file), { recursive: true }) && fs.writeFileSync(file, '', { encoding: 'utf-8' }));
}
