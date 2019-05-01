import { idxConfig, IdxConfig } from './idx-config';
import { FilterByAttributesService } from './services/filter-by-attributes.service';
import { OpenDbService } from './services/open-db.service';

import { DexxAttributeMap } from '../dexx-types';

export class IdxRemoveData {
  private openDb: OpenDbService;
  private filterService: FilterByAttributesService;
  private config: IdxConfig;

  constructor(openDb?: OpenDbService, filterService?: FilterByAttributesService, config?: IdxConfig) {
    this.openDb = openDb || new OpenDbService();
    this.filterService = filterService || new FilterByAttributesService();
    this.config = config || idxConfig;
  }

  public async remove(map: DexxAttributeMap, exact: boolean): Promise<void> {
    const indexList = await this.filterService.filter(map, exact, true);

    const promises: Array<Promise<void>> = [];
    indexList.itemsIdList.forEach(id => {
      promises.push(this.removeFromStore(this.config.ItemsTableName, id));
    });

    indexList.attributeIdList.forEach(id => {
      promises.push(this.removeFromStore(this.config.AttributesTableName, id));
    });

    try {
      await Promise.all(promises);
      return;
    }
    catch(e) {
      throw new Error(this.config.ErrorMessages.RemoveDataError);
    }
  }

  private removeFromStore(storeName: string, id: number): Promise<void> {
    return this.openDb.open().then(db => {
      return new Promise<void>((resolve, reject) => {
        const itemsStore: IDBObjectStore = db.transaction(storeName, 'readwrite').objectStore(storeName);

        const request = itemsStore.delete(id);
        request.onerror = () => reject();
        request.onsuccess = () => resolve();
      });
    });
  }
}
