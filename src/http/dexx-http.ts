import { CallManager } from './call-manager';
import { DexxHttpHeaders, DexxHttpResponse } from './dexx-http-types';
import { FetchUrlService } from './fetch-url.service';

import { DefaultHashProvider } from '../dependencies/default-hash-provider';
import { DexxAttributeMap, DexxStorage } from '../dexx-types';
import { IdxStorage } from '../idx/idx-storage';

export class DexxHttp {
  public static readonly CacheKey = '__dexx_http_hash__';
  public static readonly EmptyUrlError = 'A valid url is required.';
  public static readonly EmptyExpirationError = 'A valid expiration is required.';
  public static readonly FetchError = 'could not process returned response';
  private dexxClient: DexxStorage;
  private callManager: CallManager;
  private hashProvider: DefaultHashProvider;
  private fetchUrl: FetchUrlService;

  constructor(dexxClient?: DexxStorage,
              callManager?: CallManager,
              hashProvider?: DefaultHashProvider,
              fetchUrl?: FetchUrlService) {
    this.dexxClient = dexxClient || new IdxStorage();
    this.callManager = callManager || new CallManager();
    this.hashProvider = hashProvider || new DefaultHashProvider();
    this.fetchUrl = fetchUrl || new FetchUrlService();
  }

  public async get(url: string,
                   expiration: string,
                   attributes?: DexxAttributeMap,
                   headers?: DexxHttpHeaders): Promise<DexxHttpResponse> {

    url = url.trim();
    if (url.length < 1) {
      throw new Error(DexxHttp.EmptyUrlError);
    }

    expiration = expiration.trim();
    if (expiration.length < 1) {
      throw new Error(DexxHttp.EmptyExpirationError);
    }

    attributes = attributes || {};
    headers = headers || {};

    const hash = this.hashProvider.hash(`${JSON.stringify(attributes)}${url}`);
    const storageAttributes: DexxAttributeMap = { ...attributes };
    storageAttributes[`${DexxHttp.CacheKey}`] = [hash];

    try {
      const cachedData = await this.dexxClient.getFirst(storageAttributes, false);
      return cachedData;
    } catch (e) {
      this.callManager.removeExpired();
    }

    if (this.callManager.hasProcess(hash)) {
      return this.callManager.followProcess(hash);
    }

    this.callManager.registerProcess(hash);

    try {
      const response = await this.fetchUrl.fetch(url, headers);
      this.callManager.endProcess(hash, response, false);
      await this.dexxClient.save(response, storageAttributes, expiration);
      return response;
    }
    catch(e) {
      this.callManager.endProcess(hash, null, true);
      throw new Error(DexxHttp.FetchError);
    }
  }

}
