import { CallManager, DexxAttributeMap, DexxHttp, DexxStorage } from '../../src';
import { DefaultHashProvider } from '../../src/dependencies/default-hash-provider';
import { FetchUrlService } from '../../src/http/fetch-url.service';

describe('DexxHttp', () => {
  const url = 'https://api.example.com/widgets/22';
  let storageService = {
    getFirst: () => {},
    save: () => {}
  } as any as DexxStorage;

  let callManager = {
    hasProcess: () => {},
    followProcess: () => {},
    registerProcess: () => {},
    endProcess: () => {},
    removeExpired: jest.fn()
  } as any as CallManager;

  let hashProvider = {
    hash: () => {}
  } as any as DefaultHashProvider;

  let fetchService = {
    fetch: () => {}
  } as any as FetchUrlService;

  const service = () => {
    return new DexxHttp(storageService, callManager, hashProvider, fetchService);
  };

  describe('Invalid Input Tests', () => {
    test('Given an empty url, expect rejection with message', (done) => {
      service().get('', '10y')
        .then(() => {
          fail(); done();
        })
        .catch(e => {
          expect(e.message).toBe(DexxHttp.EmptyUrlError);
          done();
        });
    });

    test('Given an empty expiration, expect rejection with message', (done) => {
      service().get(url, '')
        .then(() => {
          fail(); done();
        })
        .catch(e => {
          expect(e.message).toBe(DexxHttp.EmptyExpirationError);
          done();
        });
    });

  });

  describe('With valid input', () => {
    const hash = 'valid-hash';
    const storedObj = { key: 'value' };
    const props: DexxAttributeMap = {};
    props[`${DexxHttp.CacheKey}`] = [hash];

    describe('if the data has been cached by the storage service', () => {
      let result: any = null;

      beforeEach(async () => {
        if (!!result) return;
        const hashFn = jest.fn();
        hashFn.mockReturnValue(hash);
        hashProvider.hash = hashFn;

        const getFirstFn = jest.fn();
        getFirstFn.mockResolvedValue(storedObj);
        storageService = { getFirst: getFirstFn } as any as DexxStorage;

        result = await service().get(url, '10m', props);
      });

      test('expect the data resolved', async () => {
        expect(result).toEqual(storedObj);
      });

      test('expect the hash service called with proper parameters', () => {
        const expectedParam = `${JSON.stringify(props)}${url}`;
        expect(hashProvider.hash).toHaveBeenCalledWith(expectedParam);
      });

      test('expect storage service called with proper attributes and hash', () => {
        expect(storageService.getFirst).toHaveBeenCalledWith(props, false);
      });
    });

    describe('if data is not found in the cache', () => {

      beforeEach(async () => {
        const hashFn = jest.fn();
        hashFn.mockReturnValue(hash);
        hashProvider.hash = hashFn;

        const getFirstFn = jest.fn();
        getFirstFn.mockRejectedValue(new Error('no cached data!!'));
        storageService = { getFirst: getFirstFn } as any as DexxStorage;
      });

      describe('if the process has been registered by the call manager', () => {
        let result: any = null;
        let hasProcessFn: jest.Mock, followProcessFn: jest.Mock;

        beforeEach(async () => {
          if(!!result) return;
          hasProcessFn = jest.fn();
          hasProcessFn.mockReturnValue(true);

          followProcessFn = jest.fn();
          followProcessFn.mockResolvedValue(storedObj);

          callManager.hasProcess = hasProcessFn;
          callManager.followProcess = followProcessFn;

          result = await service().get(url, '10m', props);
        });

        test('expect the return value to be the emitted result of the call manager function', () => {
          expect(result).toBe(storedObj);
        });

        test('expect the `removeExpired` function called in the call manager', () => {
          expect(callManager.removeExpired).toHaveBeenCalled();
        });

        test('expect the `hasProcess` function to have been called correctly', () => {
          expect(hasProcessFn).toHaveBeenCalledWith(hash);
        });

        test('expect the `followProcess` function to have been called correctly', () => {
          expect(followProcessFn).toHaveBeenCalledWith(hash);
        });
      });

      describe('if the process has not been registered by the call manager', () => {
        let fetchFn: jest.Mock;
        let endProcessFn: jest.Mock;

        beforeEach(async () => {
          const hasProcessFn = jest.fn();
          hasProcessFn.mockReturnValue(false);
          callManager.hasProcess = hasProcessFn;
        });

        describe('if the fetchUrl service throws an error', () => {
          let result: any = null;

          beforeEach(async () => {
            if (!!result) return;
            fetchFn = jest.fn();
            fetchFn.mockRejectedValue(new Error('could not retrieve remote data!!'));
            fetchService.fetch = fetchFn;

            endProcessFn = jest.fn();
            callManager.endProcess = endProcessFn;

            try {
              await service().get(url, '10m', props);
            }
            catch(e) {
              result = e;
            }
          });

          test('expect the service to throw an error', () => {
            expect(result.message).toBe(DexxHttp.FetchError);
          });

          test('expect `endProcess` function called', () => {
            expect(endProcessFn).toHaveBeenCalledWith(hash, null, true);
          });
        });

        describe('if the fetchUrl service returns a valid value', () => {
          let result: any = null;
          const fetchedObj = { 'some-key': 'some-value' };
          const expiration = '10m';
          let dexxSaveFn: jest.Mock;

          beforeEach(async () => {
            if (!!result) return;
            fetchFn = jest.fn();
            fetchFn.mockResolvedValue(fetchedObj);
            fetchService.fetch = fetchFn;

            endProcessFn = jest.fn();
            callManager.endProcess = endProcessFn;

            dexxSaveFn = jest.fn();
            storageService.save = dexxSaveFn;

            result = await service().get(url, expiration, props);
          });

          test('expect the return value to be the fetched value', () => {
            expect(result).toBe(fetchedObj);
          });

          test('expect the `endProcess` function called', () => {
            expect(endProcessFn).toHaveBeenCalledWith(hash, fetchedObj, false);
          });

          test('expect the `save` storage service function called', () => {
            expect(dexxSaveFn).toHaveBeenCalledWith(fetchedObj, props, expiration);
          });
        });
      });
    });
  });
});
