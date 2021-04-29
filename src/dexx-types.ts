export interface DexxAttributeMap {
  [name: string]: string[];
}

export interface DexxStorage {
  save: (data: any, attributes: DexxAttributeMap, expiration: string) => Promise<any>;
  get: (attributes: DexxAttributeMap, exact?: boolean) => Promise<any[]>;
  getFirst: (attributes: DexxAttributeMap, exact?: boolean) => Promise<any>;
  remove: (attributes: DexxAttributeMap, exact?: boolean) => Promise<void>;
  clear: () => Promise<void>;
}

export interface DexxTimestampService {
  getUtcTimestamp: () => number;
  getLocalDateTime: () => Date;
}

export interface DexxStringExpirationParser {
  getExpirationTimestamp: (expiration: string) => number;
}

export interface DexxAttributeComparer {
  compareAttributes: (requestedAttributes: DexxAttributeMap,
                      storedAttributes: DexxAttributeMap,
                      exact?: boolean) => boolean
}

export type ContentDisposition = 'json' | 'text' | 'blob';
