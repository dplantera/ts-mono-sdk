import type { PackageJson as PackageJsonType } from 'type-fest';
import fs from 'fs';
import { Result } from 'neverthrow';

/** *
 * interface to handle package-json business logic
 */
export const PackageJson = {
  evalScriptPresence(param: { key: string; packageJsonScripts: NonNullable<PackageJsonType['scripts']> }) {
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

  mergeScripts,
  parse: (packageJsonPath: string): PackageJsonType => JSON.parse(packageJsonPath),
  write: (jsonTargetPath: string, packageJson: PackageJsonType) =>
    Result.fromThrowable(() => fs.writeFileSync(jsonTargetPath, JSON.stringify(packageJson, undefined, 2)))().mapErr((error) =>
      console.error(error)
    ),
};

function mergeScripts(jsonBin: PackageJsonType, jsonTarget: PackageJsonType) {
  const scriptsSource = jsonBin.scripts ?? {};
  const scriptsTarget = jsonTarget.scripts ?? {};
  return Object.keys(scriptsSource).reduce(
    (targetJsonScripts, key: string) => {
      const evaluatedPresenceOfScript = PackageJson.evalScriptPresence({
        key,
        packageJsonScripts: targetJsonScripts,
      });
      switch (evaluatedPresenceOfScript) {
        case 'SCRIPT_NOT_PRESENT':
          console.log(` - [script-merge] added '${key}'`);
          return {
            ...targetJsonScripts,
            [key]: scriptsSource[key],
          };
        case 'SCRIPT_NOT_IMPLEMENTED':
          console.log(` - [script-merge] overwritten '${key}' `);
          return {
            ...targetJsonScripts,
            [key]: scriptsSource[key],
          };
        case 'IMPLEMENTED_SCRIPT_PRESENT':
          console.log(` - [script-merge] skipped, already implemented '${key}' `);
          return targetJsonScripts;
      }
    },
    { ...scriptsTarget }
  );
}
