import { CallInfo, CallManager, DexxTimestampService } from '../../src';
import { InMemoryRepository } from '../../src/dependencies/in-memory-repository';

describe('CallManager', () => {
  let utcTimestampFn: jest.Mock;
  let hasKeyFn: jest.Mock;
  let addDataFn: jest.Mock;
  let getDataFn: jest.Mock;
  let getKeysFn: jest.Mock;
  let removeDataFn: jest.Mock;
  let timestampService: DexxTimestampService;
  let repository: InMemoryRepository<CallInfo>;
  const service = () => {
    return new CallManager(timestampService, repository);
  };

  beforeEach(() => {
    utcTimestampFn = jest.fn();
    utcTimestampFn.mockReturnValue(0);
  });

  describe('hasProcess', () => {

    beforeEach(() => {
      timestampService = { getUtcTimestamp: utcTimestampFn } as any as DexxTimestampService;
      hasKeyFn = jest.fn();
      repository = { hasKey: hasKeyFn } as any as InMemoryRepository<CallInfo>;
    });

    test('if the repository has an item with the given process ID, expect true', () => {
      hasKeyFn.mockReturnValue(true);
      const result = service().hasProcess('anything');

      expect(result).toBe(true);
      expect(hasKeyFn).toHaveBeenCalledWith('anything');
    });

    test('if the repository does not have an item with the given process ID, expect false', () => {
      hasKeyFn.mockReturnValue(false);
      const result = service().hasProcess('anything');

      expect(result).toBe(false);
      expect(hasKeyFn).toHaveBeenCalledWith('anything');
    });

  });

  describe('registerProcess', () => {

    beforeEach(() => {
      addDataFn = jest.fn();
      repository = { add: addDataFn } as any as InMemoryRepository<CallInfo>;
    });

    test('expect the in-memory repo to be called with given process ID', () => {
      const processId = 'process-id';
      const expectedCallInfo = { ...CallManager.DefaultCallInfo, processId };
      service().registerProcess(processId);

      expect(addDataFn).toHaveBeenCalledWith(processId, expectedCallInfo);
    });

  });

  describe('endProcess', () => {

    beforeEach(() => {
      addDataFn = jest.fn();
      repository = { add: addDataFn } as any as InMemoryRepository<CallInfo>;
    });

    test('given valid data with no error expect repo updated correctly', () => {
      const validUntil = CallManager.Timeout;
      const processId = 'process-id';
      const data = { prop1: 'does-not-matter' };
      service().endProcess(processId, data, false);

      const expectedCallInfo: CallInfo = {
        processId, validUntil, data, complete: true, errorOccurred: false
      };
      expect(addDataFn).toHaveBeenCalledWith(processId, expectedCallInfo);
    });

    test('given an error expect repo updated correctly', () => {
      const validUntil = CallManager.Timeout;
      const processId = 'process-id';
      service().endProcess(processId, null, true);

      const expectedCallInfo: CallInfo = {
        processId, validUntil, data: null, complete: true, errorOccurred: true
      };
      expect(addDataFn).toHaveBeenCalledWith(processId, expectedCallInfo);
    });

  });

  describe('followProcess', () => {

    test('if there is no process with the given ID, expect rejected promise', (done) => {
      hasKeyFn = jest.fn();
      hasKeyFn.mockReturnValue(false);
      repository = { hasKey: hasKeyFn } as any as InMemoryRepository<CallInfo>;

      service().followProcess('bad-process-id')
        .then(() => fail())
        .catch(e => {
          expect(e.message).toBe(CallManager.NoProcessError);
          done();
        });
    });

    test('if the process has completed with an error, expect rejected promise', (done) => {
      hasKeyFn = jest.fn();
      hasKeyFn.mockReturnValue(true);
      getDataFn = jest.fn();
      const processId = 'process-id';
      const badCallInfo = { processId, errorOccurred: true, complete: true } as any as CallInfo;
      getDataFn.mockReturnValue(badCallInfo);
      repository = { get: getDataFn, hasKey: hasKeyFn } as any as InMemoryRepository<CallInfo>;

      service().followProcess(processId)
        .then(() => {
          fail(); done();
        })
        .catch(() => done())
    });

    test('if the process has completed with no error, expect data resolved', (done) => {
      hasKeyFn = jest.fn();
      hasKeyFn.mockReturnValue(true);
      getDataFn = jest.fn();
      const processId = 'process-id';
      const data = { id: 'does-not-matter' };
      const goodCallInfo: CallInfo = { processId, errorOccurred: false, complete: true, data, validUntil: 100 };
      getDataFn.mockReturnValue(goodCallInfo);
      repository = { get: getDataFn, hasKey: hasKeyFn } as any as InMemoryRepository<CallInfo>;

      service().followProcess(processId)
        .then(result => {
          expect(result).toEqual(data);
          expect(getDataFn).toHaveBeenCalledWith(processId);
          expect(hasKeyFn).toHaveBeenCalledWith(processId);
          done();
        })
        .catch(() => {
          fail(); done();
        });
    });

  });

  describe('removeExpired', () => {

    beforeEach(() => {
      utcTimestampFn = jest.fn();
      const currentTime = 1000;
      utcTimestampFn.mockReturnValue(currentTime);
      timestampService = { getUtcTimestamp: utcTimestampFn } as any as DexxTimestampService;

      getKeysFn = jest.fn();
      getKeysFn.mockReturnValue(['key1', 'key2', 'key3']);
      getDataFn = jest.fn();
      const dataMap: { [name: string]: CallInfo } = {
        key1: {
          processId: 'key1', data: null, validUntil: currentTime-1, complete: true, errorOccurred: true
        },
        key2: {
          processId: 'key2', data: { hello: 'goodbye' },
          validUntil: currentTime+1, complete: true, errorOccurred: false
        },
        key3: {
          processId: 'key3', data: { hello: 'goodbye' },
          validUntil: currentTime-1, complete: true, errorOccurred: false
        }
      };
      getDataFn.mockImplementation((key: string) => {
        return dataMap[key];
      });
      removeDataFn = jest.fn();
      repository = { getKeys: getKeysFn, get: getDataFn, remove: removeDataFn } as any as InMemoryRepository<CallInfo>;
    });

    test('given a list of expired and non-expired CallInfo objects, expect the expired objects to be removed', () => {
      service().removeExpired();
      expect(getKeysFn).toHaveBeenCalled();
      expect(getDataFn).toHaveBeenCalledWith('key1');
      expect(getDataFn).toHaveBeenCalledWith('key2');
      expect(getDataFn).toHaveBeenCalledWith('key3');
      expect(removeDataFn).toHaveBeenCalledWith('key1');
      expect(removeDataFn).toHaveBeenCalledWith('key3');
    });

  });


});
