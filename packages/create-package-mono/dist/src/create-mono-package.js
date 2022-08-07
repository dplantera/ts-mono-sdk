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
exports.program = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const node_1 = require("@ts-mono-sdk/node");
const process = __importStar(require("process"));
const neverthrow_1 = require("neverthrow");
const assert = __importStar(require("assert"));
const commander_1 = require("commander");
exports.program = new commander_1.Command();
exports.program
    .name('cpm')
    .description('create a package in a mono repo')
    .version('0.0.1')
    .addHelpText('afterAll', 'hint: execute command in your mono-repo root');
exports.program
    .description('create mono package with given name')
    .argument('<package-name>', 'name of the mono package')
    .option('-v, --verbose', 'run with verbose logging', false)
    .option('-n, --repo-name', 'name of the mono repo (will scope package with @[repo-name]). Will try to interpret name from root package if not provided.', undefined)
    .option('-p, --package-root <package-root>', 'relative path from process to package root', 'packages')
    .action((packageName, options) => {
    createMonoPackage({
        packageName,
        verbose: options.verbose,
        packageRoot: options.packageRoot,
        repoName: options.repoName,
    });
});
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
function copyBinFilesTo(target) {
    assert.ok(__dirname.includes('create-package-mono'), `${__dirname} has to be part of create-packa-mono because we need the bin files`);
    node_1.Filesystem.copy.directory(target, path.resolve(__dirname, '../bin'));
}
function createOrUpdatePackageJson(packagePath, packagesRoot, options) {
    const repoName = node_1.MonoRepo.getOrFindRepoName(options.repoName, packagesRoot);
    const packageName = `@${repoName}/${options.packageName}`;
    const jsonBinPath = path.resolve(__dirname, '../bin', 'package.json');
    const jsonTargetPath = path.resolve(packagePath, 'package.json');
    const res = neverthrow_1.Result.combine([node_1.Filesystem.withFile(jsonBinPath), node_1.Filesystem.withFile(jsonTargetPath)]).map(([pJsonBinFile, pJsonTargetFile]) => {
        console.log('merging package json...');
        const jsonBin = node_1.PackageJson.parse(pJsonBinFile);
        const jsonTarget = node_1.PackageJson.parse(pJsonTargetFile);
        return Object.assign(Object.assign({}, jsonTarget), { 
            // initially the bin will be copied and the overwritten. only initially the names are identically
            name: jsonBin.name === jsonTarget.name ? packageName : jsonTarget.name, scripts: node_1.PackageJson.mergeScripts(jsonBin, jsonTarget) });
    });
    if (res.isOk()) {
        return node_1.PackageJson.write(jsonTargetPath, res.value);
    }
    console.error(res.error);
}
function createFolderStructure(packagePath) {
    const files = [path.resolve(packagePath, 'src', 'index.ts')];
    files.forEach((file) => !fs.existsSync(path.dirname(file)) &&
        fs.mkdirSync(path.dirname(file), { recursive: true }) &&
        fs.writeFileSync(file, '', { encoding: 'utf-8' }));
}
function panic(msg) {
    console.error(msg);
    process.exit(1);
}
