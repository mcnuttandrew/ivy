import {AppState, EMPTY_SPEC_BY_LANGUAGE, ActionResponse, DataReducerState} from './default-state';
import {ColumnHeader} from '../types';
import produce from 'immer';
import {TypeInference, DataRow} from '../actions/index';
import {DataType} from '../templates/types';
import {constructDefaultTemplateMap} from '../hydra-lang';

export const recieveData = (state: AppState): AppState => {
  return produce(state, draftState => {
    draftState.spec = EMPTY_SPEC_BY_LANGUAGE['vega-lite'];
    draftState.views = ['view1'];
    draftState.templateMap = state.currentTemplateInstance
      ? constructDefaultTemplateMap(state.currentTemplateInstance)
      : {};
    draftState.viewCatalog = {};
    draftState.undoStack = [];
    draftState.redoStack = [];
  });
};

export const recieveDataForDataReducer = (state: DataReducerState, payload: DataRow[]): DataReducerState => {
  return {data: payload};
};

export const recieveTypeInferences = (state: AppState, payload: TypeInference[]): AppState => {
  const modifiedColumns = payload.map(({key, type, category, domain}) => {
    const newHeader: ColumnHeader = {
      field: key,
      type: category as DataType,
      originalType: category as DataType,
      secondaryType: type,
      domain,
    };
    return newHeader;
  });
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
  return produce(state, draftState => {
    draftState.columns = orderedColumns;
    draftState.metaColumns = metaColumns;
  });
};

// TODO this can be a blind set
export const changeSelectedFile: ActionResponse<string> = (state, payload) => {
  return produce(state, draftState => {
    draftState.currentlySelectedFile = payload;
  });
};
