#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';
import { Filesystem } from '@ts-mono-sdk/node';

const includeRootFiles = ['tsconfig.base.json'];
const includePackageBinFiles = [
  'nodemon.json',
  'package.json',
  'tsconfig.json',
];

const packageRoot = path.resolve(process.cwd());
const packageBinRoot = path.resolve(packageRoot, 'bin');
const projectRoot = path.resolve(packageRoot, '..', '..');

const rootBinFiles = fs
  .readdirSync(projectRoot)
  .filter((file) => includeRootFiles.includes(file));
const packageBinFiles = fs
  .readdirSync(packageBinRoot)
  .filter((file) => includePackageBinFiles.includes(file));

const filesToCopy = [
  ...rootBinFiles.map((f) => path.resolve(projectRoot, f)),
  ...packageBinFiles.map((f) => path.resolve(packageBinRoot, f)),
];

const copyTargetPath = path.resolve(packageRoot, 'dist/bin');
Filesystem.copy.files(copyTargetPath, ...filesToCopy);
