import * as fs from 'fs';
import * as path from 'path';
import { PackageJson } from 'type-fest';
import { Copy } from './utils';

type Args = {
  packageName: string;
  verbose: boolean;
  packageRoot: string;
};

export function createMonoPackage(args: Args): void {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { packageName, verbose, packageRoot } = args;
  const packagesRoot = path.resolve(process.cwd(), packageRoot);
  const packagePath = path.resolve(packagesRoot, packageName);
  console.log({ packagesRoot, packagePath });
  copyBinFilesTo(packagePath);
  mergePackageJson(packagePath, packageName);
  createFolderStructure(packagePath);
}

function copyBinFilesTo(target: string) {
  Copy.directory(target, '../bin');
}

function mergePackageJson(packagePath: string, name: string) {
  console.log('merging package json...');
  const jsonBin = require(path.resolve(__dirname, '../bin', 'package.json'));
  const jsonTargetPath = path.resolve(packagePath, 'package.json');
  const jsonTarget = require(jsonTargetPath);
  const merged = {
    ...jsonTarget,
    name: jsonTarget.name !== jsonBin.name ? jsonTarget.name : jsonTarget.name.replace(/(?<=\/).*/u, name),
    scripts: mergeScripts(jsonBin, jsonTarget),
  };
  fs.writeFileSync(jsonTargetPath, JSON.stringify(merged, undefined, 2));
}

function createFolderStructure(packagePath: string) {
  const files = [path.resolve(packagePath, 'src', 'index.ts')];
  files.forEach(
    (file) => !fs.existsSync(path.dirname(file)) && fs.mkdirSync(path.dirname(file), { recursive: true }) && fs.writeFileSync(file, '', { encoding: 'utf-8' })
  );
}

const PackageJson = {
  evalScriptPresence(param: { key: string; packageJsonScripts: NonNullable<PackageJson['scripts']> }) {
    const { key, packageJsonScripts } = param;
    if (!(key in packageJsonScripts)) {
      return 'SCRIPT_NOT_PRESENT';
    }
    const scriptValue = packageJsonScripts[key];
    if (scriptValue.includes('[script-not-implemented]')) {
      return 'SCRIPT_NOT_IMPLEMENTED';
    }
    return 'IMPLEMENTED_SCRIPT_PRESENT';
  },
};

function mergeScripts(jsonBin: PackageJson, jsonTarget: PackageJson) {
  const scriptsSource = jsonBin.scripts ?? {};
  const scriptsTarget = jsonTarget.scripts ?? {};
  return Object.keys(scriptsSource).reduce(
    (targetJsonScripts, key: string) => {
      const evaluatedPresenceOfScript = PackageJson.evalScriptPresence({ key, packageJsonScripts: targetJsonScripts });
      switch (evaluatedPresenceOfScript) {
        case 'SCRIPT_NOT_PRESENT':
          console.log(` - [script-merge] added '${key}'`);
          return { ...targetJsonScripts, key: scriptsSource[key] };
        case 'SCRIPT_NOT_IMPLEMENTED':
          console.log(` - [script-merge] overwritten '${key}' `);
          return { ...targetJsonScripts, key: scriptsSource[key] };
        case 'IMPLEMENTED_SCRIPT_PRESENT':
          console.log(` - [script-merge] skipped, already implemented '${key}' `);
          return targetJsonScripts;
      }
    },
    { ...scriptsTarget }
  );
}
