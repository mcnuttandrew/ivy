import {AppState, ColumnHeader, ActionResponse, DataReducerState} from '../types';
import produce from 'immer';
import {TypeInference, DataRow, CoerceTypePayload} from '../actions/index';
import {DataType} from '../types';
import {constructDefaultTemplateMap} from '../hydra-lang';

export const recieveData = (state: AppState): AppState => {
  return produce(state, draftState => {
    draftState.views = ['view1'];
    draftState.templateMap = constructDefaultTemplateMap(state.currentTemplateInstance);
    draftState.viewCatalog = {};
    draftState.undoStack = [];
    draftState.redoStack = [];
  });
};

export const recieveDataForDataReducer = (state: DataReducerState, payload: DataRow[]): DataReducerState => {
  return {data: payload};
};

export const recieveTypeInferences = (state: AppState, payload: TypeInference[]): AppState => {
  const modifiedColumns = payload.map(({key, summary, category, domain}) => {
    const newHeader: ColumnHeader = {
      field: key,
      type: category as DataType,
      originalType: category as DataType,
      domain,
      summary,
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

  return produce(state, draftState => {
    draftState.columns = orderedColumns;
  });
};

// TODO this can be a blind set
export const changeSelectedFile: ActionResponse<string> = (state, payload) => {
  return produce(state, draftState => {
    draftState.currentlySelectedFile = payload;
  });
};

export const coerceType: ActionResponse<CoerceTypePayload> = (state, payload) => {
  const {field, type} = payload;
  return produce(state, draftState => {
    const columnIdx = state.columns.findIndex((d: any) => d.field === field);
    draftState.columns[columnIdx].type = type;
  });
};
