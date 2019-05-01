
export class InMemoryRepository<T> {

  private repo: { [key: string]: T } = {};

  public hasKey(key: string): boolean {
    return this.repo.hasOwnProperty(key);
  }

  public getKeys(): string[] {
    return Object.keys(this.repo);
  }

  public add(key:string, data: T): void {
    this.repo[key] = data;
  }

  public remove(key:string): void {
    delete this.repo[key];
  }

  public get(key: string): T | null {
    return this.repo[key] || null;
  }

  public clear(): void {
    this.repo = {};
  }
}
