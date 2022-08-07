#!/usr/bin/env ts-node

import * as child_process from 'child_process';
import { Filesystem } from '@ts-mono-sdk/node';

export const Xml = {
  compare: {
    diff: compareXml,
    areEqual: (left: string, right: string, ignoreList?: Array<string>) =>
      compareXml(left, right, ignoreList).match(
        (diff) => diff.trim().length <= 0,
        (err) => {
          console.log(err);
          return undefined;
        }
      ),
  },
  toFile: (name: string, xml: string) =>
    Filesystem.withCwd(name).andThen((name) => Filesystem.writeFiles({ name, payload: xml })),
};

function compareXml(left: string, right: string, ignoreList?: Array<string>) {
  return Filesystem.withCwd()
    .andThen((cwd) => Filesystem.withPaths([cwd, left], [cwd, right]))
    .andThen(([left, right]) => callCompareXml(left, right, ignoreList ?? []));
}

function callCompareXml(left: string, right: string, ignoreList: Array<string>) {
  return Filesystem.withPath(__dirname, '../bin/kt-xml-compare/bin', 'kt-xml-compare.bat').map((binary) => {
    return child_process.execSync(
      `${binary} --left-xml "${left}" --right-xml "${right}" --ignore-list "${ignoreList.join(',')}"`,
      { encoding: 'utf-8' }
    );
  });
}

// const ignoreList = ['Test.TestType', 'Unknown', 'ElementWithAttrToIgnore.attrToIgnore', 'IgnoredElement'];
// const areEqual = Xml.compare.areEqual('../resources/good.xml', '../resources/_good.xml', ignoreList);
// const diff = Xml.compare.diff('../resources/good.xml', '../resources/_good.xml', ignoreList);
// console.log({
//   areEqual,
//   diff,
// });
