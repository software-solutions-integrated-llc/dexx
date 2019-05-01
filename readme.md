# Dexx

Dexx is an offline browser storage solution that uses indexedDB. The data stored can be of any type. Each piece of data is stored with attribute metadata. Data can be retrieved or removed by partially or exactly matching the metadata attributes.

## Storage Interface

```typescript
export interface DexxStorage {
  save: (data: any, attributes: DexxAttributeMap, expiration: string) => Promise<void>;
  get: (attributes: DexxAttributeMap, exact?: boolean) => Promise<any[]>;
  getFirst: (attributes: DexxAttributeMap, exact?: boolean) => Promise<any>;
  remove: (attributes: DexxAttributeMap, exact?: boolean) => Promise<void>;
  clear: () => Promise<void>;
}

export interface DexxAttributeMap {
  [name: string]: string[];
}
```

### Expiration

Expiration strings are made up of an integer and a duration character. Valid durations are:

| Duration Symbol | Meaning |
| ----------------| ------- |
| s               | seconds |
| m               | minutes |
| h               | hours   |
| d               | days    |
| w               | weeks   |
| n               | months  |
| y               | years   |

So a valid expiration would be `2d` for `two days`. Or `3h` for `3 hours`.

## Http Client Interface

```typescript
export interface DexxHttp {
  get(url: string, expiration: string, attributes?: DexxAttributeMap, headers?: Headers): Promise<ResponseInfo>;
}

export interface DexxAttributeMap {
  [name: string]: string[];
}

export interface ResponseInfo {
  url: string;
  body: any;
  status: number;
  headers: { [name: string]: string };
}
```
