import { FetchUrlService } from '../../src/http/fetch-url.service';

describe('FetchUrlService', () => {
  let fetchFn: jest.Mock;
  const url = 'https://api.example.com/widgets/202';
  const service = (): FetchUrlService => new FetchUrlService(fetchFn);

  test('if no fetch function is supplied, expect error', () => {
    window.fetch = false as any;

    expect(() => { new FetchUrlService(); }).toThrowError(FetchUrlService.FetchFunctionRequired);
  });

  describe('given an unexpected error from fetch function', () => {
    let result: any;

    beforeEach(async () => {
      if (!!result) return;
      fetchFn = jest.fn();
      fetchFn.mockRejectedValue(new Error('bad response!!'));

      try {
        await service().fetch(url);
      } catch(e) {
        result = e;
      }
    });

    test('expect error rethrown with message', async () => {
      expect(result.message).toBe(FetchUrlService.CallError);
    });

    test('expect fetch function called with proper parameters', () => {
      expect(fetchFn).toHaveBeenCalledWith(url, {
        method: 'get',
        headers: {}
      });
    });
  });

  describe('given non-OK response from fetch function', () => {
    let result: any = null;

    beforeEach(async () => {
      if (!!result) return;

      fetchFn = jest.fn();
      const returnHeaders = {
        forEach: (callback: (value: string, key: string) => void ) => {
          callback('my-header-value', 'my-header');
        }
      };
      fetchFn.mockResolvedValue({ ok: false, status: 400, headers: returnHeaders, url });

      result = await service().fetch(url);
    });

    test('expect error status set', () => {
      expect(result.status).toBe(400);
    });

    test('expect body to be null', () => {
      expect(result.body).toBeNull();
    });

    test('expect url to be properly set', () => {
      expect(result.url).toBe(url);
    });

    test('expect headers to be properly set', () => {
      expect(result.headers).toEqual({ 'my-header': 'my-header-value' });
    });
  });

  describe('given an OK response with valid data', () => {
    let result: any = null;
    const data = { id: 1, widgetName: 'Whatchamacallit'};

    beforeEach(async () => {
      if (!!result) return;

      fetchFn = jest.fn();
      const returnHeaders = {
        forEach: (callback: (value: string, key: string) => void ) => {
          callback('my-header-value', 'my-header');
        }
      };
      const jsonFn = () => Promise.resolve(data);
      fetchFn.mockResolvedValue({ ok: true, status: 200, headers: returnHeaders, url, json: jsonFn });

      result = await service().fetch(url);
    });

    test('expect proper status code returned', () => {
      expect(result.status).toBe(200);
    });

    test('expect proper url set', () => {
      expect(result.url).toBe(url);
    });

    test('expect proper data set', () => {
      expect(result.body).toBe(data);
    });

    test('expect proper headers set', () => {
      expect(result.headers).toEqual({ 'my-header': 'my-header-value' });
    });
  });
});
