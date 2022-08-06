/** *
 * interface to handle mono-repo business logic
 */
export declare const MonoRepo: {
    getOrFindRepoName: typeof getOrFindRepoName;
};
/** *
 * finds the repo's package.json by going up {@link maxRecursions} from the given package-root and testing for existence
 * @param repoName
 * @param packagesRoot
 * @param maxRecursions
 */
declare function getOrFindRepoName(repoName: string | undefined, packagesRoot: string, { maxRecursions }?: {
    maxRecursions: number;
}): string | undefined;
export {};
