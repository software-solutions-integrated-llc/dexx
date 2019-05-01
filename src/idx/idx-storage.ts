import { IdxGetData } from './idx-get-data';
import { IdxRemoveData } from './idx-remove-data';
import { IdxSaveData } from './idx-save-data';
import { IdxClearAttributeData } from './services/idx-clear-attribute-data';
import { IdxClearItemData } from './services/idx-clear-item-data';

import { DexxAttributeMap, DexxStorage } from '../dexx-types';

export class IdxStorage implements DexxStorage {
  private clearItemData: IdxClearItemData;
  private clearAttributeData: IdxClearAttributeData;
  private getData: IdxGetData;
  private removeData: IdxRemoveData;
  private saveData: IdxSaveData;


  constructor(clearItemData?: IdxClearItemData,
              clearAttributeData?: IdxClearAttributeData,
              getData?: IdxGetData,
              removeData?: IdxRemoveData,
              saveData?: IdxSaveData) {
    this.clearItemData = clearItemData || new IdxClearItemData();
    this.clearAttributeData = clearAttributeData || new IdxClearAttributeData();
    this.getData = getData || new IdxGetData();
    this.removeData = removeData || new IdxRemoveData();
    this.saveData = saveData || new IdxSaveData();
  }

  public async clear(): Promise<void> {
    const promises = [
      this.clearItemData.clearItemData(),
      this.clearAttributeData.clearAttributeData()
    ];
    return await Promise.all(promises).then();
  }

  public get(attributes: DexxAttributeMap, exact = false): Promise<any[]> {
    return this.getData.get(attributes, exact);
  }

  public async getFirst(attributes: DexxAttributeMap, exact = false): Promise<any> {
    const results = await this.get(attributes, exact);
    return results[0] || null;
  }

  public remove(attributes: DexxAttributeMap, exact = false): Promise<void> {
    return this.removeData.remove(attributes, exact);
  }

  public save(data: any, attributes: DexxAttributeMap, expiration: string): Promise<void> {
    return this.saveData.save(data, attributes, expiration);
  }
}
