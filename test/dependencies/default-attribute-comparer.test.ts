import { DefaultAttributeComparer } from '../../src/dependencies/default-attribute-comparer';
import { DexxAttributeMap } from '../../src';

describe('DefaultAttributeComparer', () => {

  const comparer = () => new DefaultAttributeComparer();

  describe('InExact Matching', () => {
    const exact = false;
    const storedAttributes: DexxAttributeMap = {
      'id': ['1234', '2345'],
      'categories': ['one', 'two']
    };

    test('given a property that does not exist, expect false', () => {
      const requestedAttributes: DexxAttributeMap = {
        'non-existent': ['1234']
      };
      expect(comparer().compareAttributes(requestedAttributes, storedAttributes, exact)).toBe(false);
    });

    test('given an existent property with a non-matching value, expect false', () => {
      const requestedAttributes: DexxAttributeMap = {
        'id': ['3456']
      };
      expect(comparer().compareAttributes(requestedAttributes, storedAttributes, exact)).toBe(false);
    });

    test('given an existent and non-existent property, expect false', () => {
      const requestedAttributes: DexxAttributeMap = {
        'id': ['1234'],
        'non-existent': ['hello']
      };
      expect(comparer().compareAttributes(requestedAttributes, storedAttributes, exact)).toBe(false);
    });

    test('given a single, matching attribute, expect true', () => {
      const requestedAttributes: DexxAttributeMap = {
        'categories': ['one']
      };
      expect(comparer().compareAttributes(requestedAttributes, storedAttributes, exact)).toBe(true);
    });

    test('given a single value match in multiple properties, expect true', () => {
      const requestedAttributes: DexxAttributeMap = {
        'id': ['2345'],
        'categories': ['two']
      };
      expect(comparer().compareAttributes(requestedAttributes, storedAttributes, exact)).toBe(true);
    });

    test('given a multiple values matching in a single property, expect true', () => {
      const requestedAttributes: DexxAttributeMap = {
        'categories': ['one', 'two']
      };
      expect(comparer().compareAttributes(requestedAttributes, storedAttributes, exact)).toBe(true);
    });

    test('given an exact match (but with reversed value order), expect true', () => {
      const requestedAttributes: DexxAttributeMap = {
        'id': ['2345', '1234'],
        'categories': ['two', 'one']
      };
      expect(comparer().compareAttributes(requestedAttributes, storedAttributes, exact)).toBe(true);
    });

  });

  describe('Exact Matching', () => {
    const exact = true;
    const storedAttributes: DexxAttributeMap = {
      'id': ['1234', '2345'],
      'categories': ['one', 'two']
    };

    test('given an exact match (with values in different order), expect true', () => {
      const requestedAttributes: DexxAttributeMap = {
        'id': ['2345', '1234'],
        'categories': ['two', 'one']
      };
      expect(comparer().compareAttributes(requestedAttributes, storedAttributes, exact)).toBe(true);
    });

    test('given a single, matching attribute, expect false', () => {
      const requestedAttributes: DexxAttributeMap = {
        'categories': ['one']
      };
      expect(comparer().compareAttributes(requestedAttributes, storedAttributes, exact)).toBe(false);
    });

  });
});
