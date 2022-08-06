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
const mono_repo_1 = require("./mono-repo");
const package_json_1 = require("./package-json");
const filesystem_1 = require("./filesystem");
function createMonoPackage(options) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { packageName, verbose, packageRoot } = options;
    const packagesRoot = path.resolve(process.cwd(), packageRoot);
    const packagePath = path.resolve(packagesRoot, packageName);
    console.log('creating mono package', { packagesRoot, packagePath });
    copyBinFilesTo(packagePath);
    createOrUpdatePackageJson(packagePath, packagesRoot, options);
    createFolderStructure(packagePath);
}
exports.createMonoPackage = createMonoPackage;
function copyBinFilesTo(target) {
    filesystem_1.Filesystem.copy.directory(target, '../bin');
}
function createOrUpdatePackageJson(packagePath, packagesRoot, options) {
    const repoName = mono_repo_1.MonoRepo.getOrFindRepoName(options.repoName, packagesRoot);
    const packageName = `@${repoName}/${options.packageName}`;
    const jsonBin = require(path.resolve(__dirname, '../bin', 'package.json'));
    const jsonTargetPath = path.resolve(packagePath, 'package.json');
    const jsonTarget = require(jsonTargetPath);
    console.log('merging package json...');
    package_json_1.PackageJson.write(jsonTargetPath, Object.assign(Object.assign({}, jsonTarget), { 
        // initially the bin will be copied and the overwritten. only initially the names are identically
        name: jsonBin.name === jsonTarget.name ? packageName : jsonTarget.name, scripts: package_json_1.PackageJson.mergeScripts(jsonBin, jsonTarget) }));
}
function createFolderStructure(packagePath) {
    const files = [path.resolve(packagePath, 'src', 'index.ts')];
    files.forEach((file) => !fs.existsSync(path.dirname(file)) && fs.mkdirSync(path.dirname(file), { recursive: true }) && fs.writeFileSync(file, '', { encoding: 'utf-8' }));
}
