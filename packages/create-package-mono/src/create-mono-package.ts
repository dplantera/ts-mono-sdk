import * as fs from 'fs';
import * as path from 'path';
import { CliOptions } from './index';
import { MonoRepo } from './mono-repo';
import { PackageJson } from './package-json';
import { Filesystem } from './filesystem';

export function createMonoPackage(options: CliOptions): void {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { packageName, verbose, packageRoot } = options;
  const packagesRoot = path.resolve(process.cwd(), packageRoot);
  const packagePath = path.resolve(packagesRoot, packageName);
  console.log('creating mono package', { packagesRoot, packagePath });

  copyBinFilesTo(packagePath);
  createOrUpdatePackageJson(packagePath, packagesRoot, options);
  createFolderStructure(packagePath);
}

function copyBinFilesTo(target: string) {
  Filesystem.copy.directory(target, '../bin');
}

function createOrUpdatePackageJson(packagePath: string, packagesRoot: string, options: CliOptions) {
  const repoName = MonoRepo.getOrFindRepoName(options.repoName, packagesRoot);
  const packageName = `@${repoName}/${options.packageName}`;

  const jsonBin = require(path.resolve(__dirname, '../bin', 'package.json'));
  const jsonTargetPath = path.resolve(packagePath, 'package.json');
  const jsonTarget = require(jsonTargetPath);

  console.log('merging package json...');
  PackageJson.write(jsonTargetPath, {
    ...jsonTarget,
    // initially the bin will be copied and the overwritten. only initially the names are identically
    name: jsonBin.name === jsonTarget.name ? packageName : jsonTarget.name,
    scripts: PackageJson.mergeScripts(jsonBin, jsonTarget),
  });
}

function createFolderStructure(packagePath: string) {
  const files = [path.resolve(packagePath, 'src', 'index.ts')];
  files.forEach(
    (file) => !fs.existsSync(path.dirname(file)) && fs.mkdirSync(path.dirname(file), { recursive: true }) && fs.writeFileSync(file, '', { encoding: 'utf-8' })
  );
}
