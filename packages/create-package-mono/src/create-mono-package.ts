import * as fs from 'fs';
import * as path from 'path';

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
  console.log({ packagesRoot, packagePath });
  copyBinFilesTo(packagePath);
  mergePackageJson(packagePath, packageName);
  createFolderStructure(packagePath);
}

function copyBinFilesTo(target: string) {
  if (!fs.existsSync(target)) {
    console.log(`Creating ${target}`);
    fs.mkdirSync(target);
  }
  const bin = path.resolve(__dirname, '../bin');
  console.log(`Copy files \n  - from: ${bin} \n  - to: ${target}`);
  fs.cpSync(bin, target, { recursive: true });
}

function mergePackageJson(packagePath: string, name: string) {
  const jsonBin = require(path.resolve(__dirname, '../bin', 'package.json'));
  const jsonTargetPath = path.resolve(packagePath, 'package.json');
  const jsonTarget = require(jsonTargetPath);
  const merged = {
    ...jsonTarget,
    name: jsonTarget.name !== jsonBin.name ? jsonTarget.name : jsonTarget.name.replace(/(?<=\/).*/u, name),
    scripts: Object.keys(jsonBin.scripts).reduce(
      (targetJson, key: string) => {
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
      },
      { ...jsonTarget.scripts }
    ),
  };
  fs.writeFileSync(jsonTargetPath, JSON.stringify(merged, undefined, 2));
}

function createFolderStructure(packagePath: string) {
  const files = [path.resolve(packagePath, 'src', 'index.ts')];
  files.forEach(
    (file) => !fs.existsSync(path.dirname(file)) && fs.mkdirSync(path.dirname(file), { recursive: true }) && fs.writeFileSync(file, '', { encoding: 'utf-8' })
  );
}
