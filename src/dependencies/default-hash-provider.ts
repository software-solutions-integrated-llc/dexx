import { v5 as uuid5 } from 'uuid';
import { dexxConfig, DexxConfig } from '../dexx-config';

export type HashFunction = (input: string, salt: string) => string;

export class DefaultHashProvider {
  private readonly hashFn: HashFunction;
  private readonly config: DexxConfig;

  constructor(hashFunc?: HashFunction, config?: DexxConfig) {
    this.hashFn = hashFunc || uuid5;
    this.config = config || dexxConfig;
  }

  public hash(input: string): string {
    return this.hashFn(input, this.config.HashProviderNamespace);
  }
}
