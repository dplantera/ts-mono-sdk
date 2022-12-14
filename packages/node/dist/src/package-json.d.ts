import type { PackageJson as PackageJsonType } from 'type-fest';
import { Result } from 'neverthrow';
/** *
 * interface to handle package-json business logic
 */
export declare const PackageJson: {
    evalScriptPresence(param: {
        key: string;
        packageJsonScripts: NonNullable<PackageJsonType['scripts']>;
    }): "SCRIPT_NOT_PRESENT" | "SCRIPT_NOT_IMPLEMENTED" | "IMPLEMENTED_SCRIPT_PRESENT";
    mergeScripts: typeof mergeScripts;
    parse: (packageJsonPath: string) => PackageJsonType;
    write: (jsonTargetPath: string, packageJson: PackageJsonType) => Result<void, void>;
};
declare function mergeScripts(jsonBin: PackageJsonType, jsonTarget: PackageJsonType): {
    [x: string]: string;
    prepublish?: string | undefined;
    prepare?: string | undefined;
    prepublishOnly?: string | undefined;
    prepack?: string | undefined;
    postpack?: string | undefined;
    publish?: string | undefined;
    postpublish?: string | undefined;
    preinstall?: string | undefined;
    install?: string | undefined;
    postinstall?: string | undefined;
    preuninstall?: string | undefined;
    uninstall?: string | undefined;
    postuninstall?: string | undefined;
    preversion?: string | undefined;
    version?: string | undefined;
    postversion?: string | undefined;
    pretest?: string | undefined;
    test?: string | undefined;
    posttest?: string | undefined;
    prestop?: string | undefined;
    stop?: string | undefined;
    poststop?: string | undefined;
    prestart?: string | undefined;
    start?: string | undefined;
    poststart?: string | undefined;
    prerestart?: string | undefined;
    restart?: string | undefined;
    postrestart?: string | undefined;
};
export {};
