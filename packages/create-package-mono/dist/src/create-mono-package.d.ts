import { Command } from 'commander';
export declare type CliOptions = {
    packageName: string;
    verbose: boolean;
    packageRoot: string;
    repoName: string | undefined;
};
export declare const program: Command;
