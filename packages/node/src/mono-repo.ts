import * as path from 'path';
import { PackageJson } from './package-json';
import { Filesystem } from './filesystem';

/** *
 * interface to handle mono-repo business logic
 */
export const MonoRepo = {
  getOrFindRepoName,
};

/** *
 * finds the repo's package.json by going up {@link maxRecursions} from the given package-root and testing for existence
 * @param repoName
 * @param packagesRoot
 * @param maxRecursions
 */
function getOrFindRepoName(repoName: string | undefined, packagesRoot: string, { maxRecursions } = { maxRecursions: 3 }) {
  if (repoName !== undefined) {
    return repoName;
  }
  console.log('searching for repo package.json:');
  const parent = path.dirname(packagesRoot);
  while (maxRecursions-- > 0) {
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
