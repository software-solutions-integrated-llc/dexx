import { DefaultHashProvider } from '../../src/dependencies/default-hash-provider';
import each from 'jest-each';

describe('DefaultHashProvider', () => {
  const provider = new DefaultHashProvider();

  const arr = [
    ['cat', 'cat', 'a6a20e4a-5e20-54da-ae24-e353b18d1bcd'],
    ['bat', 'bat', '5e737597-5891-55c4-981d-0c6492b638a6'],
    ['the quick brown fox...', 'the quick brown fox jumped over the lazy dog', 'fb17272b-87d6-5658-b0cc-e3736531fa7f'],
    ['agvance sky (repeated 100 times)', 'agvance sky '.repeat(100), '20021edd-0646-56f0-8ea5-26d78ddde3f4']
  ];

  each(arr).test('for input `%s` expect UUID returned.', (description, input, expected) => {
    expect(provider.hash(input)).toBe(expected);
  });
});
