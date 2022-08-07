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
exports.createMonoRepo = void 0;
const path = __importStar(require("path"));
const node_1 = require("@ts-mono-sdk/node");
const neverthrow_1 = require("neverthrow");
const assert = __importStar(require("assert"));
function createMonoRepo(options) {
    node_1.Filesystem.withCwd(options.destination, options.repoName).andThen((destination) => neverthrow_1.Result.combineWithAllErrors([
        copyBinFilesTo(Object.assign(Object.assign({}, options), { destination })),
        createOrUpdatePackageJson(Object.assign(Object.assign({}, options), { destination })),
        createFolderStructure(Object.assign(Object.assign({}, options), { destination })),
    ]).mapErr((errs) => errs.forEach((err) => console.log(err))));
}
exports.createMonoRepo = createMonoRepo;
function copyBinFilesTo(options) {
    console.log('create repo and copy bin files');
    assert.ok(__dirname.includes('create-repo-mono'), `${__dirname} has to be part of create-repo-mono because we need the bin files`);
    return node_1.Filesystem.copy.directory(options.destination, path.resolve(__dirname, '../bin'));
}
function createOrUpdatePackageJson(options) {
    console.log('create or updating package.json...');
    const packageName = `${options.repoName}`;
    return node_1.Filesystem.withPaths([__dirname, '../bin', 'package.json'], [options.destination, 'package.json']).andThen(([jsonBinPath, jsonTargetPath]) => node_1.Filesystem.withFiles(jsonBinPath, jsonTargetPath)
        .map(([pJsonBinFile, pJsonTargetFile]) => {
        console.log('merging package json...');
        const jsonBin = node_1.PackageJson.parse(pJsonBinFile);
        const jsonTarget = node_1.PackageJson.parse(pJsonTargetFile);
        return Object.assign(Object.assign({}, jsonTarget), { 
            // initially the bin will be copied and the overwritten. only initially the names are identically
            name: jsonBin.name === jsonTarget.name ? packageName : jsonTarget.name, scripts: node_1.PackageJson.mergeScripts(jsonBin, jsonTarget) });
    })
        .map((packageJson) => node_1.PackageJson.write(jsonTargetPath, packageJson)));
}
function createFolderStructure(options) {
    console.log('creating folder structure...');
    return node_1.Filesystem.withPaths([options.destination, 'packages'])
        .andThen((files) => {
        console.log(JSON.stringify(files));
        return node_1.Filesystem.writeFiles(...files);
    })
        .mapErr((err) => console.log(err));
}
