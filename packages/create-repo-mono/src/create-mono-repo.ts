import * as path from 'path';
import { CliOptions } from './index';
import { Filesystem, PackageJson } from '@ts-mono-sdk/node';
import { Result } from 'neverthrow';
import * as assert from 'assert';

export function createMonoRepo(options: CliOptions): void {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  copyBinFilesTo(options);
  createOrUpdatePackageJson(options);
  createFolderStructure(options);
}

function copyBinFilesTo(options: Pick<CliOptions, 'destination' | 'repoName'>) {
  console.log('create repo and copy bin files');
  assert.ok(__dirname.includes('create-repo-mono'), `${__dirname} has to be part of create-repo-mono because we need the bin files`);
  Filesystem.withCwd(options.destination, options.repoName)
    .andThen((destination) => Filesystem.copy.directory(destination, path.resolve(__dirname, '../bin')))
    .mapErr((err) => console.error(err));
}

function createOrUpdatePackageJson(options: Pick<CliOptions, 'repoName' | 'destination'>) {
  console.log('create or updating package.json...');
  const packageName = `${options.repoName}`;

  const jsonBinPath = path.resolve(__dirname, '../bin', 'package.json');
  const jsonTargetPath = path.resolve(options.destination, 'package.json');

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

function createFolderStructure(options: Pick<CliOptions, 'destination' | 'repoName'>) {
  console.log('creating folder structure...');
  return Filesystem.withPaths([options.destination, options.repoName, 'src', 'index.ts'])
    .andThen((files) => {
      console.log(JSON.stringify(files));
      return Filesystem.writeFiles(...files);
    })
    .mapErr((err) => console.log(err));
}
