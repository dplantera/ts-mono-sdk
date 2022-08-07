#!/usr/bin/env ts-node

import { Filesystem } from '@ts-mono-sdk/node';

Filesystem.copy.filesFromDir('dist/bin', [
  {
    directory: '../../',
    files: ['tsconfig.base.json'],
  },
  {
    directory: 'bin',
    files: ['nodemon.json', 'package.json', 'tsconfig.json'],
  },
]);
