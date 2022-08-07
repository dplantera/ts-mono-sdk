#!/usr/bin/env ts-node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_1 = require("@ts-mono-sdk/node");
node_1.Filesystem.copy.filesFromDir('dist/bin', [
    {
        directory: '../..',
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
