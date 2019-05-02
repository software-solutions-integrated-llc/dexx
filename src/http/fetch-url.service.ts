import { dexxConfig, DexxConfig } from '../dexx-config';
import { DexxHttpHeaders, DexxHttpResponse } from './dexx-http-types';

export type FetchFunction = (input: RequestInfo, init?: RequestInit) => Promise<Response>;

export class FetchUrlService {
  private readonly fetchFunction: FetchFunction;
  private readonly config: DexxConfig;

  constructor(fetchFunc?: FetchFunction, config?: DexxConfig) {
    this.config = config || dexxConfig;
    if (!fetchFunc && (!window || !window.fetch) ) {
      throw new Error(this.config.ErrorMessages.FetchFunctionRequired);
    }
    this.fetchFunction = fetchFunc || window.fetch.bind(window);
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
      throw new Error(this.config.ErrorMessages.FetchUrlUnknownError);
    }

    return response.ok ? this.getResponseInfo(response) : this.getErrorResponse(response);
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


