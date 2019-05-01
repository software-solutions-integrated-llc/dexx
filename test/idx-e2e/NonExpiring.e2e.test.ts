import {
  DexxAttributeMap, FilterByAttributesService, idxConfig,
  IdxGetData,
  IdxRemoveData,
  IdxSaveData,
  IdxStorage,
  OpenDbService
} from '../../src';
import { IdxClearItemData } from '../../src/idx/services/idx-clear-item-data';
import { IdxClearAttributeData } from '../../src/idx/services/idx-clear-attribute-data';

const fakeIndexedDb: IDBFactory = require('fake-indexeddb');

describe('End-to-End Testing: Non-Expired Items', () => {
  // services setup
  const openDbService = new OpenDbService(undefined, fakeIndexedDb);
  const filterService = new FilterByAttributesService(undefined, openDbService, undefined, undefined);
  const clearItemsService = new IdxClearItemData(openDbService, undefined);
  const clearAttributesService = new IdxClearAttributeData(openDbService, undefined);
  const getDataService = new IdxGetData(filterService, openDbService);
  const removeDataService = new IdxRemoveData(openDbService, filterService, undefined);
  const saveDataService = new IdxSaveData(openDbService, undefined, undefined, removeDataService);
  const idxStorage = new IdxStorage(clearItemsService, clearAttributesService,
    getDataService, removeDataService, saveDataService);

  // sample data
  const iphone = { productId: 9876, name: 'Apple iPhone XS Max', price: 1134.98 };
  const iphoneAttrs: DexxAttributeMap = { productId: ['9876'], categories: ['electronics', 'phones'] };
  const samsungTv = { productId: 8765, name: 'Samsung X3456 UHD Television', price: 865.23 };
  const samsungTvAttrs: DexxAttributeMap = { productId: ['8765'], categories: ['electronics', 'televisions'] };
  const visioTv = { productId: 7654, name: 'Visio V43HD 1080p HDTV', price: 435.87 };
  const visioTvAttrs: DexxAttributeMap = { productId: ['7654'], categories: ['electronics', 'televisions'] };
  const expiration = '10m';

  beforeEach(async () => {
    await idxStorage.clear();
    await idxStorage.save(iphone, iphoneAttrs, expiration);
    await idxStorage.save(samsungTv, samsungTvAttrs, expiration);
    await idxStorage.save(visioTv, visioTvAttrs, expiration);
  });

  test('querying by the general `electronics` category should return all products', async () => {
    const searchAttributes: DexxAttributeMap = { categories: ['electronics']};
    const results = await idxStorage.get(searchAttributes);
    expect(results.length).toBe(3);
    expect(results).toContainEqual(iphone);
    expect(results).toContainEqual(samsungTv);
    expect(results).toContainEqual(visioTv);
  });

  test('querying by the `phone` category should return one product', async () => {
    const searchAttributes: DexxAttributeMap = { categories: ['phones']};
    const results = await idxStorage.get(searchAttributes);
    expect(results.length).toBe(1);
    expect(results).toContainEqual(iphone);
  });

  test('querying by exact attributes should return one product', async () => {
    const searchAttributes: DexxAttributeMap = { categories: ['televisions', 'electronics'], productId: ['7654']};
    const results = await idxStorage.get(searchAttributes, true);
    expect(results.length).toBe(1);
    expect(results).toContainEqual(visioTv);

    const result = await idxStorage.getFirst(searchAttributes, true);
    expect(result).toEqual(visioTv);
  });

  test('querying by a specific product ID should return one product', async () => {
    const searchAttributes: DexxAttributeMap = { productId: [`${samsungTv.productId}`]};
    const results = await idxStorage.get(searchAttributes);
    expect(results.length).toBe(1);
    expect(results).toContainEqual(samsungTv);
  });

  test('after removing an item an error should occur when attempting to retrieve it again', async () => {
    const searchAttributes: DexxAttributeMap = { productId: [`${visioTv.productId}`]};
    await idxStorage.remove(searchAttributes);

    try {
      await idxStorage.get(searchAttributes);
      fail();
    } catch(e) {
      expect(e.message).toBe(idxConfig.ErrorMessages.NoDataItemsFound);
    }
  });
});
