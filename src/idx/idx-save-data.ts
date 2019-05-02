import { idxConfig, IdxConfig } from './idx-config';
import { IdxRemoveData } from './idx-remove-data';
import { AttributeModel, ItemModel } from './idx-types';
import { OpenDbService } from './services/open-db.service';

import { DefaultExpirationParser } from '../dependencies/default-expiration.parser';
import { DexxAttributeMap, DexxStringExpirationParser } from '../dexx-types';

export class IdxSaveData {
  private openDb: OpenDbService;
  private expirationParser: DexxStringExpirationParser;
  private config: IdxConfig;
  private removeData: IdxRemoveData;

  constructor(openDb?: OpenDbService,
              expirationParser?: DexxStringExpirationParser,
              config?: IdxConfig,
              removeData?: IdxRemoveData) {
    this.openDb = openDb || new OpenDbService();
    this.expirationParser = expirationParser || new DefaultExpirationParser();
    this.config = config || idxConfig;
    this.removeData = removeData || new IdxRemoveData();
  }

  public async save(data: any, attributes: DexxAttributeMap, expiration: string): Promise<void> {
    await this.removeData.remove(attributes, true);
    const itemId = await this.storeDataItem(data);
    await this.storeAttributeData(attributes, expiration, itemId);
  }

  private storeDataItem(data: any): Promise<number> {
    return this.openDb.open().then(db => {
      return new Promise<number>((resolve, reject) => {
        const itemStore = db.transaction(this.config.ItemsTableName, 'readwrite')
          .objectStore(this.config.ItemsTableName);
        const item: ItemModel = {data};
        const request = itemStore.add(item);

        request.onerror = () => {
          reject(this.config.ErrorMessages.SaveDataItemError);
        };

        request.onsuccess = (event) => {
          resolve((event.target as any).result);
        };
      });
    });
  }

  private storeAttributeData(attributes: DexxAttributeMap, expiration: string, itemId: number): Promise<void> {
    return this.openDb.open().then(db => {
      return new Promise<void>((resolve, reject) => {
        const attrStore = db.transaction(this.config.AttributesTableName, 'readwrite')
          .objectStore(this.config.AttributesTableName);
        const attributeItem: AttributeModel = {
          attributes, itemId, expiration: this.expirationParser.getExpirationTimestamp(expiration)
        };
        const request = attrStore.add(attributeItem);

        request.onerror = () => {
          reject(this.config.ErrorMessages.SaveAttributeError);
        };

        request.onsuccess = () => {
          resolve();
        };
      });
    });
  }
}
