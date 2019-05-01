import { idxConfig, IdxConfig } from '../idx-config';

export class OpenDbService {
  private static database: IDBDatabase = null as any;
  private config: IdxConfig;
  private idbFactory: IDBFactory;

  constructor(config?: IdxConfig, idbFactory?: IDBFactory) {
    this.config = config || idxConfig;

    if (!idbFactory && (!window || !window.indexedDB)) {
      throw new Error('OpenDbService requires an indexedDB factory!');
    }
    this.idbFactory = idbFactory || window.indexedDB;
  }

  public open(): Promise<IDBDatabase> {

    if(OpenDbService.database != null) {
      return Promise.resolve(OpenDbService.database);
    }

    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = this.idbFactory.open(this.config.DatabaseName, 1);

      request.onerror = () => reject(this.config.ErrorMessages.OpenDbError);

      request.onupgradeneeded = (event) => {
        const database = (event.target as IDBOpenDBRequest).result;

        database.createObjectStore(this.config.ItemsTableName,
          {keyPath: this.config.ItemsKeyName, autoIncrement: true});

        const attributeStore = database.createObjectStore(this.config.AttributesTableName,
          {keyPath: this.config.AttributesKeyName, autoIncrement: true});
        attributeStore.createIndex(this.config.ExpirationIndexName,
          this.config.ExpirationIndexName, {unique: false});
        attributeStore.createIndex(this.config.ItemIdIndexName,
          this.config.ItemIdIndexName, {unique: false});
      };

      request.onsuccess = (event) => {
        const result = (event.target as IDBOpenDBRequest).result;
        OpenDbService.database = result;
        resolve(result);
      }
    });

  }
}
