import { OpenDbService } from './open-db.service';

import { idxConfig, IdxConfig } from '../idx-config';

export class IdxClearItemData {
  private openDb: OpenDbService;
  private config: IdxConfig;

  constructor(openDb?: OpenDbService, config?: IdxConfig) {
    this.openDb = openDb || new OpenDbService();
    this.config = config || idxConfig;
  }

  public clearItemData(): Promise<void> {
    return this.openDb.open().then(db => {
      return new Promise<void>((resolve, reject) => {
        const store = db.transaction(this.config.ItemsTableName, 'readwrite')
                        .objectStore(this.config.ItemsTableName);
        const request = store.clear();

        request.onerror = () => reject(this.config.ErrorMessages.ClearItemsError);
        request.onsuccess = () => resolve();
      });
    });
  }
}
