import {
  DexxAttributeMap, DexxStringExpirationParser,
  FilterByAttributesService, idxConfig,
  IdxGetData,
  IdxRemoveData,
  IdxSaveData,
  IdxStorage,
  OpenDbService
} from '../../src';
import { IdxClearItemData } from '../../src/idx/services/idx-clear-item-data';
import { IdxClearAttributeData } from '../../src/idx/services/idx-clear-attribute-data';
const fakeIndexedDb: IDBFactory = require('fake-indexeddb');

describe('End-to-End Testing: Expired Items', () => {
  // services setup
  const openDbService = new OpenDbService(undefined, fakeIndexedDb);
  const filterService = new FilterByAttributesService(undefined, openDbService, undefined, undefined);
  const expPast = 'past';
  const expFuture = 'future';
  const expirationParser = {
    getExpirationTimestamp: (val: string) => {
      return val === expPast ? (new Date()).getTime() - 1 : (new Date()).getTime() + 100
    }
  } as DexxStringExpirationParser;

  const clearItemsService = new IdxClearItemData(openDbService, undefined);
  const clearAttributesService = new IdxClearAttributeData(openDbService, undefined);
  const getDataService = new IdxGetData(filterService, openDbService);
  const removeDataService = new IdxRemoveData(openDbService, filterService, undefined);
  const saveDataService = new IdxSaveData(openDbService, expirationParser, undefined, removeDataService);
  const idxStorage = new IdxStorage(clearItemsService, clearAttributesService,
    getDataService, removeDataService, saveDataService);

  // sample data
  const iphone = { productId: 9876, name: 'Apple iPhone XS Max', price: 1134.98 };
  const iphoneAttrs: DexxAttributeMap = { productId: ['9876'], categories: ['electronics', 'phones'] };
  const samsungTv = { productId: 8765, name: 'Samsung X3456 UHD Television', price: 865.23 };
  const samsungTvAttrs: DexxAttributeMap = { productId: ['8765'], categories: ['electronics', 'televisions'] };
  const visioTv = { productId: 7654, name: 'Visio V43HD 1080p HDTV', price: 435.87 };
  const visioTvAttrs: DexxAttributeMap = { productId: ['7654'], categories: ['electronics', 'televisions'] };

  beforeEach(async () => {
    await idxStorage.clear();
    await idxStorage.save(iphone, iphoneAttrs, expFuture);
    await idxStorage.save(samsungTv, samsungTvAttrs, expFuture);
    await idxStorage.save(visioTv, visioTvAttrs, expPast);
  });

  test('querying the general `electronics` category should return only two, non-expired results', async () => {
    const searchAttributes: DexxAttributeMap = { categories: ['electronics']};
    const results = await idxStorage.get(searchAttributes);
    expect(results.length).toBe(2);
    expect(results).toContainEqual(iphone);
    expect(results).toContainEqual(samsungTv);
  });

  test('should get an error if trying to retrieve an expired item', async () => {
    const searchAttributes: DexxAttributeMap = { productId: [`${visioTv.productId}`]};

    try {
      await idxStorage.get(searchAttributes);
      fail();
    } catch(e) {
      expect(e.message).toBe(idxConfig.ErrorMessages.NoDataItemsFound);
    }
  });

});
