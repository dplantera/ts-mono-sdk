import { Xml } from '../src';

describe('Xml', () => {
  const [leftXml, rightXml] = ['resources/good.xml', 'resources/_good.xml'];
  describe('compare', () => {
    it('should be equal for same xml', () => {
      const res = Xml.compare.areEqual(leftXml, leftXml);
      expect(res).toBeTruthy();
    });

    it('should not be equal for different xml', () => {
      const res = Xml.compare.areEqual(leftXml, rightXml);
      expect(res).toBeFalsy();
    });

    it('diff should equal if executed twice', () => {
      const leftRight = Xml.compare.diff(leftXml, rightXml);
      const leftRight2 = Xml.compare.diff(leftXml, rightXml);
      expect(leftRight._unsafeUnwrap()).toEqual(leftRight2._unsafeUnwrap());
    });

    it('amount of diff should equal if left and right are mixed', () => {
      const leftRight = Xml.compare.diff(leftXml, rightXml);
      const rightLef = Xml.compare.diff(rightXml, leftXml);
      expect(leftRight._unsafeUnwrap().split('\n').length).toEqual(rightLef._unsafeUnwrap().split('\n').length);
    });
  });
});
