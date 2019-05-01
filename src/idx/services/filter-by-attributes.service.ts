import { OpenDbService } from './open-db.service';

import { idxConfig, IdxConfig } from '../idx-config';
import { AttributeModel, GetIdListResult } from '../idx-types';

import { DefaultAttributeComparer } from '../../dependencies/default-attribute-comparer';
import { DefaultTimestampService } from '../../dependencies/default-timestamp.service';
import { DexxAttributeComparer, DexxAttributeMap, DexxTimestampService } from '../../dexx-types';

export class FilterByAttributesService {
  private config: IdxConfig;
  private openDb: OpenDbService;
  private timestampService: DexxTimestampService;
  private attributeComparer: DexxAttributeComparer;

  constructor(config?: IdxConfig,
              openDbService?: OpenDbService,
              timestampService?: DexxTimestampService,
              attributeComparer?: DexxAttributeComparer) {
    this.config = config || idxConfig;
    this.openDb = openDbService || new OpenDbService();
    this.timestampService = timestampService || new DefaultTimestampService();
    this.attributeComparer = attributeComparer || new DefaultAttributeComparer();
  }

  public filter(attributes: DexxAttributeMap, exact = false, includeExpired = false): Promise<GetIdListResult> {
    return this.openDb.open().then((db: IDBDatabase) => {

      return new Promise((resolve, reject) => {

        const idListResult: GetIdListResult = {
          itemsIdList: [],
          attributeIdList: []
        };
        const attributeStore = db.transaction(this.config.AttributesTableName)
          .objectStore(this.config.AttributesTableName);

        const openCursorRequest = attributeStore.openCursor();

        openCursorRequest.onerror = () => reject(this.config.ErrorMessages.OpenCursorError);

        openCursorRequest.onsuccess = (event) => {
          const cursor = (event.target as any).result as IDBCursorWithValue;

          if (!cursor) {
            resolve(idListResult);
          } else {
            const attributeItem: AttributeModel = cursor.value;
            const timestamp = this.timestampService.getUtcTimestamp();
            const expired = attributeItem.expiration > 0 && attributeItem.expiration < timestamp;

            if (includeExpired && expired) {
              idListResult.itemsIdList.push(attributeItem.itemId);
              idListResult.attributeIdList.push(attributeItem.id as number);
            }

            if (!expired && this.attributeComparer.compareAttributes(attributes, attributeItem.attributes, exact)) {
              idListResult.itemsIdList.push(attributeItem.itemId);
              idListResult.attributeIdList.push(attributeItem.id as number);
            }
            cursor.continue();
          }
        };
      });
    });
  }
}
