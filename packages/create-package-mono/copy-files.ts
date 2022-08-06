#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';

const includeRootFiles = ['tsconfig.base.json'];
const includePackageBinFiles = ['nodemon.json', 'package.json', 'tsconfig.json'];

const packageRoot = path.resolve(process.cwd());
const packageBinRoot = path.resolve(packageRoot, 'bin');
const projectRoot = path.resolve(packageRoot, '..', '..');

const rootBinFiles = fs.readdirSync(projectRoot).filter((file) => includeRootFiles.includes(file));
const packageBinFiles = fs.readdirSync(packageBinRoot).filter((file) => includePackageBinFiles.includes(file));
const filesToCopy = [...rootBinFiles.map((f) => path.resolve(projectRoot, f)), ...packageBinFiles.map((f) => path.resolve(packageRoot, f))];

const copyTargetPath = path.resolve(packageRoot, 'dist/bin');
copyFiles(copyTargetPath, ...filesToCopy);

function copyFiles(destination: string, ...filesToCopy: Array<string>): void {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }
  filesToCopy.forEach((f) => {
    const targetFile = path.resolve(copyTargetPath, path.basename(f));
    console.log(`copying file: ${f} => ${targetFile}`);
    withTry(() => fs.copyFileSync(f, targetFile), `copy failed for: ${f}`);
  });
}

function withTry<T>(fun: () => T, msg = ''): T | undefined {
  try {
    return fun();
  } catch (error: unknown) {
    console.error(`${msg}: ${JSON.stringify(error)}`);
    return undefined;
  }
}
