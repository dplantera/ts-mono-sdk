#!/usr/bin/env ts-node

import { Filesystem } from '@ts-mono-sdk/node';

Filesystem.copy.filesFromDir('dist/bin', [
  {
    directory: '../..', // rel path to project root from package
    files: [
      'tsconfig.base.json',
      'nodemon.json',
      'package.json',
      'tsconfig.json',
      '.editorconfig',
      '.eslintrc.json',
      '.gitignore',
      '.prettierrc.json',
      '.yarnrc.yml',
      'jest.config.base.js',
      'LICENSE',
    ],
  },
]);
