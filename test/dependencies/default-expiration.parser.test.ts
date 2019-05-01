import { DefaultExpirationParser, DexxTimestampService } from '../../src';
import each from 'jest-each';

describe('DefaultExpirationParser', () => {

  let getTimeFn: jest.Mock;
  const service = () => {
    return new DefaultExpirationParser({
      getLocalDateTime: getTimeFn
    } as any as DexxTimestampService);
  };

  test('if the expiration is `never`, expect 0 returned', () => {
    expect(service().getExpirationTimestamp('never')).toBe(0);
  });


  describe('Bad Input String Tests', () => {

    const inputs = [ [''], [' '], ['5x'], ['Xs'] ];

    each(inputs).test('for input `%s`, expect error thrown', (input: string) => {
      expect(() => service().getExpirationTimestamp(input)).toThrowError(DefaultExpirationParser.InvalidInput)
    });
  });

  describe('Valid Input String Tests', () => {
    beforeEach(() => {
      getTimeFn = jest.fn();
      getTimeFn.mockReturnValue({
        getFullYear: () => 0,
        getMonth: () => 0,
        getDate: () => 0,
        getHours: () => 0,
        getMinutes: () => 0,
        getSeconds: () => 0,
        getMilliseconds: () => 0
      });
    });

    const inputs = [
      ['5s',  ( new Date(0, 0, 0, 0, 0, 5, 0)  ).getTime()],
      ['65m', ( new Date(0, 0, 0, 0, 65, 0, 0) ).getTime()],
      ['11h', ( new Date(0, 0, 0, 11, 0, 0, 0) ).getTime()],
      ['32d', ( new Date(0, 0, 32, 0, 0, 0, 0) ).getTime()],
      ['2w',  ( new Date(0, 0, 14, 0, 0, 0, 0) ).getTime()],
      ['3n',  ( new Date(0, 3, 0, 0, 0, 0, 0)  ).getTime()],
      ['20y', ( new Date(20, 0, 0, 0, 0, 0, 0) ).getTime()]
    ];

    each(inputs).test('for an expiration of `%s`, expect `%s`', (exp: string, stamp: number) => {
      expect(service().getExpirationTimestamp(exp)).toBe(stamp);
    });
  });

});
