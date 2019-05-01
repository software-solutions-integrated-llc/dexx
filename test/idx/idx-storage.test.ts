import { DexxAttributeMap, IdxGetData, IdxRemoveData, IdxSaveData, IdxStorage } from '../../src';
import { IdxClearItemData } from '../../src/idx/services/idx-clear-item-data';
import { IdxClearAttributeData } from '../../src/idx/services/idx-clear-attribute-data';

describe('IdxStorage', () => {
  const clearItemDataStub = { clearItemData: () => Promise.resolve() } as any as IdxClearItemData;
  const clearAttributeDataStub = { clearAttributeData: () => Promise.resolve() } as any as IdxClearAttributeData;
  const getDataStub = { get: () => Promise.resolve([]) } as any as IdxGetData;
  const removeDataStub = { remove: () => Promise.resolve() } as any as IdxRemoveData;
  const saveDataStub = { remove: () => Promise.resolve() } as any as IdxSaveData;

  describe('clear function', () => {
    let clearItemsFn: jest.Mock, clearAttributesFn: jest.Mock;
    let clearItemsService: any, clearAttributesService: any;

    beforeEach(() => {
      clearItemsFn = jest.fn();
      clearAttributesFn = jest.fn();
      clearItemsService = { clearItemData: clearItemsFn };
      clearAttributesService = { clearAttributeData: clearAttributesFn };
    });

    test('given an error clearing the items table, expect error', async () => {
      const errorMsg = 'clear items error!!';
      clearItemsFn.mockRejectedValue(new Error(errorMsg));
      clearAttributesFn.mockResolvedValue(undefined);

      const service = new IdxStorage(clearItemsService, clearAttributesService,
        getDataStub, removeDataStub, saveDataStub);

      try {
        await service.clear();
        fail();
      } catch(e) {
        expect(e.message).toBe(errorMsg);
      }
    });

    test('given an error clearing the attributes table, expect error', async () => {
      const errorMsg = 'clear attributes error!!';
      clearAttributesFn.mockRejectedValue(new Error(errorMsg));
      clearItemsFn.mockResolvedValue(undefined);

      const service = new IdxStorage(clearItemsService, clearAttributesService,
        getDataStub, removeDataStub, saveDataStub);

      try {
        await service.clear();
        fail();
      } catch(e) {
        expect(e.message).toBe(errorMsg);
      }
    });

    test('given no error clearing items and attributes, expect success', async () => {
      clearAttributesFn.mockResolvedValue(undefined);
      clearItemsFn.mockResolvedValue(undefined);

      const service = new IdxStorage(clearItemsService, clearAttributesService,
        getDataStub, removeDataStub, saveDataStub);

      await service.clear();
      expect(clearAttributesFn).toHaveBeenCalled();
      expect(clearItemsFn).toHaveBeenCalled();
    });
  });

  describe('get function', () => {
    let getItemsFn: jest.Mock;
    let getItemsService: any;
    const errorMsg = 'error retrieving data!!';
    const attributes: DexxAttributeMap = { anything: ['anything'] };
    const service = () => {
      return new IdxStorage(clearItemDataStub, clearAttributeDataStub, getItemsService, removeDataStub, saveDataStub);
    };

    beforeEach(() => {
      getItemsFn = jest.fn();
      getItemsService = { get: getItemsFn };
    });

    test('given an error in the get data service, expect error', async () => {
      getItemsFn.mockRejectedValue(new Error(errorMsg));
      try {
        await service().get(attributes);
        fail();
      }
      catch(e) {
        expect(getItemsFn).toHaveBeenCalledWith(attributes, false);
        expect(e.message).toBe(errorMsg);
      }
    });

    test('given successful data service return value, expect success', async () => {
      const returnVal = [ { id: 1, name: 'Item 1'}, { id: 2, name: 'Item 2'} ];
      getItemsFn.mockResolvedValue(returnVal);

      const result = await service().get(attributes, true);

      expect(result).toEqual(returnVal);
      expect(getItemsFn).toHaveBeenCalledWith(attributes, true);
    });
  });

  describe('getFirst function', () => {
    let getItemsFn: jest.Mock;
    let getItemsService: any;
    const errorMsg = 'error retrieving data!!';
    const attributes: DexxAttributeMap = { anything: ['anything'] };
    const service = () => {
      return new IdxStorage(clearItemDataStub, clearAttributeDataStub, getItemsService, removeDataStub, saveDataStub);
    };

    beforeEach(() => {
      getItemsFn = jest.fn();
      getItemsService = { get: getItemsFn };
    });

    test('given an error in the get data service, expect error', async () => {
      getItemsFn.mockRejectedValue(new Error(errorMsg));
      try {
        await service().getFirst(attributes);
        fail();
      }
      catch(e) {
        expect(getItemsFn).toHaveBeenCalledWith(attributes, false);
        expect(e.message).toBe(errorMsg);
      }
    });

    test('given successful data service array return value, expect first item returned', async () => {
      const returnVal = [ { id: 1, name: 'Item 1'}, { id: 2, name: 'Item 2'} ];
      getItemsFn.mockResolvedValue(returnVal);

      const result = await service().getFirst(attributes, true);

      expect(result).toEqual(returnVal[0]);
      expect(getItemsFn).toHaveBeenCalledWith(attributes, true);
    });

    test('given successful data service return value of an empty array, expect null returned', async () => {
      getItemsFn.mockResolvedValue([]);

      const result = await service().getFirst(attributes, true);

      expect(result).toEqual(null);
      expect(getItemsFn).toHaveBeenCalledWith(attributes, true);
    });
  });

  describe('remove function', () => {
    let removeDataFn: jest.Mock;
    let removeDataService: any;
    const errorMsg = 'error removing data!!';
    const attributes: DexxAttributeMap = { anything: ['anything'] };
    const service = () => {
      return new IdxStorage(clearItemDataStub, clearAttributeDataStub, getDataStub, removeDataService, saveDataStub);
    };

    beforeEach(() => {
      removeDataFn = jest.fn();
      removeDataService = { remove: removeDataFn };
    });

    test('given an error in the get data service, expect error', async () => {
      removeDataFn.mockRejectedValue(new Error(errorMsg));
      try {
        await service().remove(attributes);
        fail();
      }
      catch(e) {
        expect(removeDataFn).toHaveBeenCalledWith(attributes, false);
        expect(e.message).toBe(errorMsg);
      }
    });

    test('given successful data service return value, expect success', async () => {
      removeDataFn.mockReturnValue(Promise.resolve());

      await service().remove(attributes, true);

      expect(removeDataFn).toHaveBeenCalledWith(attributes, true);
    });
  });

  describe('save function', () => {
    let saveDataFn: jest.Mock;
    let saveDataService: any;
    const errorMsg = 'error saving data!!';
    const data = { id: 1, name: 'Data Item 1' };
    const attributes: DexxAttributeMap = { anything: ['anything'] };
    const expiration = '10m';
    const service = () => {
      return new IdxStorage(clearItemDataStub, clearAttributeDataStub, getDataStub, removeDataStub, saveDataService);
    };

    beforeEach(() => {
      saveDataFn = jest.fn();
      saveDataService = { save: saveDataFn };
    });

    test('given an error in the get data service, expect error', async () => {
      saveDataFn.mockRejectedValue(new Error(errorMsg));
      try {
        await service().save(data, attributes, expiration);
        fail();
      }
      catch(e) {
        expect(saveDataFn).toHaveBeenCalledWith(data, attributes, expiration);
        expect(e.message).toBe(errorMsg);
      }
    });

    test('given successful data service return value, expect success', async () => {
      saveDataFn.mockReturnValue(Promise.resolve());

      await service().save(data, attributes, expiration);

      expect(saveDataFn).toHaveBeenCalledWith(data, attributes, expiration);
    });
  });


});
