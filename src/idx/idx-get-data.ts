import { idxConfig, IdxConfig } from './idx-config';
import { FilterByAttributesService } from './services/filter-by-attributes.service';
import { OpenDbService } from './services/open-db.service';

import { DexxAttributeMap } from '../dexx-types';

export class IdxGetData {
  private filterService: FilterByAttributesService;
  private openDb: OpenDbService;
  private config: IdxConfig;

  constructor(filterService?: FilterByAttributesService, openDb?: OpenDbService, config?: IdxConfig) {
    this.filterService = filterService || new FilterByAttributesService();
    this.openDb = openDb || new OpenDbService();
    this.config = config || idxConfig;
  }

  public get(map: DexxAttributeMap, exact = false): Promise<any[]> {
    return this.filterService.filter(map, exact, false).then((indexList) => {
      if (indexList.itemsIdList.length < 1) {
        return Promise.reject(new Error(this.config.ErrorMessages.NoDataItemsFound));
      }
      const promiseArray: Array<Promise<any>> = [];
      indexList.itemsIdList.forEach(itemId => {
        promiseArray.push(this.getDataItemById(itemId));
      });
      return Promise.all(promiseArray).then();
    });
  }

  private getDataItemById(id: number): Promise<any> {
    return this.openDb.open().then(db => {
      return new Promise<any>((resolve, reject) => {
        const request = db.transaction('items').objectStore('items').get(id);

        request.onerror = () => reject(new Error(this.config.ErrorMessages.DataItemNotFound));

        request.onsuccess = (event) => {
          const data = (event as any).target.result.data;
          resolve(data);
        };
      });
    });
  }

}
