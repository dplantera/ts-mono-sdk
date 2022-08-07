import * as fs from 'fs';
import * as path from 'path';
import { Filesystem, MonoRepo, PackageJson } from '@ts-mono-sdk/node';
import * as process from 'process';
import { Result } from 'neverthrow';
import * as assert from 'assert';

import { Command } from 'commander';

export type CliOptions = {
  packageName: string;
  verbose: boolean;
  packageRoot: string;
  repoName: string | undefined;
};

export const program = new Command();
program
  .name('cpm')
  .description('create a package in a mono repo')
  .version('0.0.1')
  .addHelpText('afterAll', 'hint: execute command in your mono-repo root');
program
  .description('create mono package with given name')
  .argument('<package-name>', 'name of the mono package')
  .option('-v, --verbose', 'run with verbose logging', false)
  .option(
    '-n, --repo-name',
    'name of the mono repo (will scope package with @[repo-name]). Will try to interpret name from root package if not provided.',
    undefined
  )
  .option('-p, --package-root <package-root>', 'relative path from process to package root', 'packages')
  .action((packageName, options: CliOptions) => {
    createMonoPackage({
      packageName,
      verbose: options.verbose,
      packageRoot: options.packageRoot,
      repoName: options.repoName,
    });
  });

function createMonoPackage(options: CliOptions): void {
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
  assert.ok(__dirname.includes('create-package-mono'), `${__dirname} has to be part of create-packa-mono because we need the bin files`);
  Filesystem.copy.directory(target, path.resolve(__dirname, '../bin'));
}

function createOrUpdatePackageJson(packagePath: string, packagesRoot: string, options: CliOptions) {
  const repoName = MonoRepo.getOrFindRepoName(options.repoName, packagesRoot);
  const packageName = `@${repoName}/${options.packageName}`;

  const jsonBinPath = path.resolve(__dirname, '../bin', 'package.json');
  const jsonTargetPath = path.resolve(packagePath, 'package.json');

  const res = Result.combine([Filesystem.withFile(jsonBinPath), Filesystem.withFile(jsonTargetPath)]).map(
    ([pJsonBinFile, pJsonTargetFile]) => {
      console.log('merging package json...');
      const jsonBin = PackageJson.parse(pJsonBinFile);
      const jsonTarget = PackageJson.parse(pJsonTargetFile);
      return {
        ...jsonTarget,
        // initially the bin will be copied and the overwritten. only initially the names are identically
        name: jsonBin.name === jsonTarget.name ? packageName : jsonTarget.name,
        scripts: PackageJson.mergeScripts(jsonBin, jsonTarget),
      };
    }
  );
  if (res.isOk()) {
    return PackageJson.write(jsonTargetPath, res.value);
  }
  console.error(res.error);
}

function createFolderStructure(packagePath: string) {
  const files = [path.resolve(packagePath, 'src', 'index.ts')];
  files.forEach(
    (file) =>
      !fs.existsSync(path.dirname(file)) &&
      fs.mkdirSync(path.dirname(file), { recursive: true }) &&
      fs.writeFileSync(file, '', { encoding: 'utf-8' })
  );
}

function panic(msg: string) {
  console.error(msg);
  process.exit(1);
}
