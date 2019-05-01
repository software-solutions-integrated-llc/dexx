import uuid5 = require('uuid/v5');

export type HashFunction = (input: string, salt: string) => string;

export class DefaultHashProvider {
  public static readonly HashNamepace = 'e33fc024-e9a4-473f-a15b-59dc83145b1c';
  private readonly hashFn: HashFunction;

  constructor(hashFunc?: HashFunction) {
    this.hashFn = hashFunc || uuid5;
  }

  public hash(input: string): string {
    return this.hashFn(input, DefaultHashProvider.HashNamepace);
  }
}
