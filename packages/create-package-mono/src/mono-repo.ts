import * as path from 'path';
import { PackageJson } from './package-json';
import { Filesystem } from './filesystem';

export const MonoRepo = {
  getOrFindRepoName,
};

function getOrFindRepoName(repoName: string | undefined, packagesRoot: string) {
  if (repoName !== undefined) {
    return repoName;
  }
  console.log('searching for repo package.json:');
  let maxRecursiveSteps = 3;
  const parent = path.dirname(packagesRoot);
  while (maxRecursiveSteps-- > 0) {
    console.log(`- searching in: ${parent}`);
    const packageJsonPath = path.resolve(parent, 'package.json');
    const rPackageName = Filesystem.withFile(packageJsonPath)
      .map(PackageJson.parse)
      .map((packageJson) => packageJson.name);
    if (rPackageName.isOk()) {
      console.log(`- found name '${rPackageName.value}' in ${parent}`);
      return rPackageName.value;
    }
  }
  console.log(`could not find package.json of packages-root: ${packagesRoot}`);
  return 'mono';
}
