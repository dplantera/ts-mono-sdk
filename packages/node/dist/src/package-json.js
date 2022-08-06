"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackageJson = void 0;
const fs_1 = __importDefault(require("fs"));
const neverthrow_1 = require("neverthrow");
/** *
 * interface to handle package-json business logic
 */
exports.PackageJson = {
    evalScriptPresence(param) {
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
    parse: (packageJsonPath) => JSON.parse(packageJsonPath),
    write: (jsonTargetPath, packageJson) => neverthrow_1.Result.fromThrowable(() => fs_1.default.writeFileSync(jsonTargetPath, JSON.stringify(packageJson, undefined, 2)))().mapErr((error) => console.error(error)),
};
function mergeScripts(jsonBin, jsonTarget) {
    var _a, _b;
    const scriptsSource = (_a = jsonBin.scripts) !== null && _a !== void 0 ? _a : {};
    const scriptsTarget = (_b = jsonTarget.scripts) !== null && _b !== void 0 ? _b : {};
    return Object.keys(scriptsSource).reduce((targetJsonScripts, key) => {
        const evaluatedPresenceOfScript = exports.PackageJson.evalScriptPresence({
            key,
            packageJsonScripts: targetJsonScripts,
        });
        switch (evaluatedPresenceOfScript) {
            case 'SCRIPT_NOT_PRESENT':
                console.log(` - [script-merge] added '${key}'`);
                return Object.assign(Object.assign({}, targetJsonScripts), { [key]: scriptsSource[key] });
            case 'SCRIPT_NOT_IMPLEMENTED':
                console.log(` - [script-merge] overwritten '${key}' `);
                return Object.assign(Object.assign({}, targetJsonScripts), { [key]: scriptsSource[key] });
            case 'IMPLEMENTED_SCRIPT_PRESENT':
                console.log(` - [script-merge] skipped, already implemented '${key}' `);
                return targetJsonScripts;
        }
    }, Object.assign({}, scriptsTarget));
}
