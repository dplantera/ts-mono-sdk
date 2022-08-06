const path = require('path');
const { lstatSync, readdirSync, readFileSync } = require('fs'); // get listing of packages in the mono repo
const tsjPreset = require('ts-jest/presets');

const basePath = path.resolve(__dirname, 'packages');
const packages = readdirSync(basePath).filter((name) => {
  return lstatSync(path.join(basePath, name)).isDirectory();
});

function fromPackages() {
  return packages.reduce((acc, name) => {
    try {
      const packageJsonAsString = readFileSync(path.resolve(basePath, name, 'package.json'), { encoding: 'utf-8' });
      const packageName = JSON.parse(packageJsonAsString).name;
      return {
        ...acc,
        [`${packageName}`]: `<rootDir>/packages/${name}`,
      };
    } catch (err) {
      console.error(err);
      return acc;
    }
  }, {});
}

module.exports = {
  testEnvironment: 'node',
  preset: 'ts-jest',
  cacheDirectory: '.jest/cache',
};
