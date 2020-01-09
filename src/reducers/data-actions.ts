import {List, Map} from 'immutable';
import {EMPTY_SPEC, ActionResponse} from './default-state';
import {ColumnHeader, DataType} from '../types';
import {
  selectDataModification,
  executeDataModifcation,
} from '../operations/data-ops';

export const recieveData: ActionResponse = (state, payload) => {
  // this might be the wrong way to do this? it sort of depends on the internals of that vega component
  const dataModification = selectDataModification(payload);
  return state
    .set('data', executeDataModifcation(payload, dataModification))
    .set('originalData', payload)
    .set('dataModification', dataModification)
    .set('spec', EMPTY_SPEC)
    .set('views', List(['view1']))
    .set('viewCatalog', Map())
    .set('undoStack', List())
    .set('redoStack', List());
};

export const recieveTypeInferences: ActionResponse = (state, payload) => {
  type DestructType = {
    key: string;
    type: string;
    category: DataType;
    domain: number[] | string[];
  };
  const modifiedColumns = payload.map(
    ({key, type, category, domain}: DestructType) => {
      const newHeader: ColumnHeader = {
        field: key,
        type: category,
        originalType: category,
        secondaryType: type,
        domain,
      };
      return newHeader;
    },
  );
  const groupedColumns = modifiedColumns.reduce(
    (acc: any, row: ColumnHeader) => {
      acc[row.type] = acc[row.type].concat(row);
      return acc;
    },
    {DIMENSION: [], MEASURE: [], TIME: []},
  );
  const orderedColumns = ['DIMENSION', 'TIME', 'MEASURE']
    .map(key =>
      groupedColumns[key].sort((a: ColumnHeader, b: ColumnHeader) => {
        const textA = a.field.toUpperCase();
        const textB = b.field.toUpperCase();
        return textA < textB ? -1 : textA > textB ? 1 : 0;
      }),
    )
    .reduce((acc, row) => acc.concat(row), []);

  const metaColumns: ColumnHeader[] = [
    // 'repeat',
    'row',
    'column',
  ].map((field: string) => {
    const type: DataType = 'DIMENSION';
    return {
      type,
      originalType: type,
      secondaryType: 'metaColumn',
      field,
      domain: modifiedColumns.map((row: ColumnHeader) => row.field),
      metaColumn: true,
    };
  });

  return state.set('columns', orderedColumns).set('metaColumns', metaColumns);
};

// TODO this can be a blind set
export const changeSelectedFile: ActionResponse = (state, payload) => {
  return state.set('currentlySelectedFile', payload);
};
