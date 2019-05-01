import { OpenDbService } from './open-db.service';

import { idxConfig, IdxConfig } from '../idx-config';

export class IdxClearAttributeData {
  private openDb: OpenDbService;
  private config: IdxConfig;

  constructor(openDb?: OpenDbService, config?: IdxConfig) {
    this.openDb = openDb || new OpenDbService();
    this.config = config || idxConfig;
  }

  public clearAttributeData(): Promise<void> {
    return this.openDb.open().then(db => {
      return new Promise<void>((resolve, reject) => {
        const store = db.transaction(this.config.AttributesTableName, 'readwrite')
                        .objectStore(this.config.AttributesTableName);
        const request = store.clear();

        request.onerror = () => reject(this.config.ErrorMessages.ClearAttributesError);
        request.onsuccess = () => resolve();
      });
    });
  }
}
