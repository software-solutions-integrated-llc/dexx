import { DexxAttributeMap } from '../dexx-types';

export interface GetIdListResult {
  itemsIdList: number[];
  attributeIdList: number[];
}

export interface ItemModel {
  id?: number; // primary key
  data: any;
}

export interface AttributeModel {
  id?: number; // primary key
  itemId: number; // foreign key to 'items' store
  expiration: number; // unix timestamp
  attributes: DexxAttributeMap;
}
