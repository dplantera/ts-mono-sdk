"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonoRepo = void 0;
const path = __importStar(require("path"));
const package_json_1 = require("./package-json");
const filesystem_1 = require("./filesystem");
/** *
 * interface to handle mono-repo business logic
 */
exports.MonoRepo = {
    getOrFindRepoName,
};
/** *
 * finds the repo's package.json by going up {@link maxRecursions} from the given package-root and testing for existence
 * @param repoName
 * @param packagesRoot
 * @param maxRecursions
 */
function getOrFindRepoName(repoName, packagesRoot, { maxRecursions } = { maxRecursions: 3 }) {
    if (repoName !== undefined) {
        return repoName;
    }
    console.log('searching for repo package.json:');
    const parent = path.dirname(packagesRoot);
    while (maxRecursions-- > 0) {
        console.log(`- searching in: ${parent}`);
        const packageJsonPath = path.resolve(parent, 'package.json');
        const rPackageName = filesystem_1.Filesystem.withFile(packageJsonPath)
            .map(package_json_1.PackageJson.parse)
            .map((packageJson) => packageJson.name);
        if (rPackageName.isOk()) {
            console.log(`- found name '${rPackageName.value}' in ${parent}`);
            return rPackageName.value;
        }
    }
    console.log(`could not find package.json of packages-root: ${packagesRoot}`);
    return 'mono';
}
