import * as path from 'path';
import { CliOptions } from './index';
import { Filesystem, PackageJson } from '@ts-mono-sdk/node';
import { Result } from 'neverthrow';
import * as assert from 'assert';

export function createMonoRepo(options: CliOptions): void {
  Filesystem.withCwd(options.destination, options.repoName).andThen((destination) =>
    Result.combineWithAllErrors([
      copyBinFilesTo({ ...options, destination }),
      createOrUpdatePackageJson({ ...options, destination }),
      createFolderStructure({ ...options, destination }),
    ]).mapErr((errs) => errs.forEach((err) => console.log(err)))
  );
}

function copyBinFilesTo(options: Pick<CliOptions, 'destination' | 'repoName'>) {
  console.log('create repo and copy bin files');
  assert.ok(
    __dirname.includes('create-repo-mono'),
    `${__dirname} has to be part of create-repo-mono because we need the bin files`
  );
  return Filesystem.copy.directory(options.destination, path.resolve(__dirname, '../bin'));
}

function createOrUpdatePackageJson(options: Pick<CliOptions, 'repoName' | 'destination'>) {
  console.log('create or updating package.json...');
  const packageName = `${options.repoName}`;
  return Filesystem.withPaths([__dirname, '../bin', 'package.json'], [options.destination, 'package.json']).andThen(
    ([jsonBinPath, jsonTargetPath]) =>
      Filesystem.withFiles(jsonBinPath, jsonTargetPath)
        .map(([pJsonBinFile, pJsonTargetFile]) => {
          console.log('merging package json...');
          const jsonBin = PackageJson.parse(pJsonBinFile);
          const jsonTarget = PackageJson.parse(pJsonTargetFile);
          return {
            ...jsonTarget,
            // initially the bin will be copied and the overwritten. only initially the names are identically
            name: jsonBin.name === jsonTarget.name ? packageName : jsonTarget.name,
            scripts: PackageJson.mergeScripts(jsonBin, jsonTarget),
          };
        })
        .map((packageJson) => PackageJson.write(jsonTargetPath, packageJson))
  );
}

function createFolderStructure(options: Pick<CliOptions, 'destination' | 'repoName'>) {
  console.log('creating folder structure...');
  return Filesystem.withPaths([options.destination, 'packages'])
    .andThen((files) => {
      console.log(JSON.stringify(files));
      return Result.combine(files.map((f) => Filesystem.dirs.ensureExists(f)));
    })
    .mapErr((err) => console.log(err));
}
