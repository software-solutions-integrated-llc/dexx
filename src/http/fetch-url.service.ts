import { DexxHttpHeaders, DexxHttpResponse } from './dexx-http-types';

export type FetchFunction = (input: RequestInfo, init?: RequestInit) => Promise<Response>;

export class FetchUrlService {
  public static readonly FetchFunctionRequired = 'No fetch function provided or found';
  public static readonly CallError = 'An unexpected error occurred making remote call';
  private readonly fetchFunction: FetchFunction;

  constructor(fetchFunc?: FetchFunction) {
    if (!fetchFunc && (!window || !window.fetch) ) {
      throw new Error(FetchUrlService.FetchFunctionRequired);
    }
    this.fetchFunction = fetchFunc || window.fetch;
  }

  public async fetch(url: string, headers?: DexxHttpHeaders): Promise<DexxHttpResponse> {

    let response: Response;
    try {
      response = await this.fetchFunction(url, {
        method: 'get',
        headers: headers || {}
      });
    }
    catch(e) {
      throw new Error(FetchUrlService.CallError);
    }

    if (!response.ok) {
      return this.getErrorResponse(response);
    }

    return this.getResponseInfo(response);
  }

  private getErrorResponse(response: Response): Promise<DexxHttpResponse> {
    return Promise.resolve({
      url: response.url,
      body: null,
      status: response.status,
      headers: this.getHeadersFromResponse(response)
    });
  }

  private getResponseInfo(response: Response): Promise<DexxHttpResponse> {
    return response.json()
      .then(data => {
        return {
          url: response.url,
          body: data,
          status: response.status,
          headers: this.getHeadersFromResponse(response)
        };
      });
  }

  private getHeadersFromResponse(response: Response): { [name: string]: string } {
    const hdrs: { [name: string]: string } = {};
    response.headers.forEach((value: string, key: string) => {
      hdrs[key] = value;
    });
    return hdrs;
  }
}


