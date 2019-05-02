import { CallInfo } from "./http/call-manager";

export interface DexxErrorMessages {
  InvalidExpirationInput: string;
  HttpClientEmptyUrl: string;
  HttpClientEmptyExpiration: string;
  HttpClientFetchError: string;
  CallManagerNoProcess: string;
  FetchFunctionRequired: string;
  FetchUrlUnknownError: string;
}

export interface DexxConfig {
  HttpClientCacheKey: string;
  CallManagerTimeout: number;
  CallManagerPollingTime: number;
  CallManagerDefaultInfo: CallInfo;
  ErrorMessages: DexxErrorMessages
  HashProviderNamespace: string;
}

export const dexxConfig: DexxConfig = {
  HttpClientCacheKey: '__dexx_http_hash__',
  CallManagerPollingTime: 50,
  CallManagerTimeout: 1000,
  CallManagerDefaultInfo: {
    processId: '', complete: false, errorOccurred: false, data: null, validUntil: 0
  },
  HashProviderNamespace: 'e33fc024-e9a4-473f-a15b-59dc83145b1c',
  ErrorMessages: {
    InvalidExpirationInput: 'invalid expiration submitted',
    HttpClientEmptyUrl: 'A valid url is required.',
    HttpClientEmptyExpiration: 'A valid expiration is required.',
    HttpClientFetchError: 'could not process returned response',
    CallManagerNoProcess: 'No process was found with the given ID',
    FetchFunctionRequired: 'No fetch function provided or found',
    FetchUrlUnknownError: 'An unexpected error occurred making remote call'
  }
};
