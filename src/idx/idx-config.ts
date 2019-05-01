
export interface IdxConfig {
  DatabaseName: string;
  ItemsTableName: string;
  ItemsKeyName: string;
  AttributesTableName: string;
  AttributesKeyName: string;
  ExpirationIndexName: string;
  ItemIdIndexName: string;
  ErrorMessages: IdxErrorMessages;
}

export interface IdxErrorMessages {
  OpenDbError: string;
  OpenCursorError: string;
  ClearItemsError: string;
  ClearAttributesError: string;
  NoDataItemsFound: string;
  RemoveAttributeError: string;
  RemoveDataError: string;
  DataItemNotFound: string;
}

export const idxConfig: IdxConfig = {
  DatabaseName: '__DEXX__',
  ItemsTableName: 'items',
  ItemsKeyName: 'id',
  AttributesTableName: 'attributes',
  AttributesKeyName: 'id',
  ExpirationIndexName: 'expiration',
  ItemIdIndexName: 'itemId',
  ErrorMessages: {
    OpenDbError: 'An error occurred attempting to open the database',
    OpenCursorError: 'An error occurred attempting to access the table cursor',
    ClearItemsError: 'An error occurred attempting to clear all data from the items table',
    ClearAttributesError: 'An error occurred attempting to clear all data from the attributes table',
    NoDataItemsFound:'No items matching the given attributes could be found',
    RemoveAttributeError: 'An error occurred attempting to remove the given data attributes',
    RemoveDataError: 'An error occurred trying to remove data matching the given attributes',
    DataItemNotFound: 'No data item with the given ID could be found.'
  }
};
