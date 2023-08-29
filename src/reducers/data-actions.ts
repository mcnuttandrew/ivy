import {AppState, ColumnHeader, ActionResponse, DataReducerState, LanguageExtension} from '../types';
import produce from 'immer';
import {TypeInference, DataRow, CoerceTypePayload} from '../actions/index';
import {DataType} from '../types';
import {constructDefaultTemplateMap} from '../ivy-lang';

export const recieveData = (state: AppState, payload: {data: any; dumpTemplateMap: boolean}): AppState => {
  return produce(state, (draftState) => {
    draftState.views = ['view1'];
    if (payload.dumpTemplateMap) {
      draftState.templateMap = constructDefaultTemplateMap(state.currentTemplateInstance);
    }
    draftState.viewCatalog = {};
    draftState.undoStack = [];
    draftState.redoStack = [];
  });
};

export const recieveDataForDataReducer = (
  _: DataReducerState,
  payload: {data: DataRow[]; dumpTemplateMap: boolean},
): DataReducerState => {
  return {data: payload.data};
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
      if (!acc[row.type]) {
        acc.DIMENSION = acc.DIMENSION.concat({...row, type: 'DIMENSION'});
        return acc;
      }
      acc[row.type] = acc[row.type].concat(row);
      return acc;
    },
    {DIMENSION: [], MEASURE: [], TIME: []},
  );
  const orderedColumns = ['DIMENSION', 'TIME', 'MEASURE']
    .map((key) =>
      groupedColumns[key].sort((a: ColumnHeader, b: ColumnHeader) => {
        const textA = a.field.toUpperCase();
        const textB = b.field.toUpperCase();
        return textA < textB ? -1 : textA > textB ? 1 : 0;
      }),
    )
    .reduce((acc, row) => acc.concat(row), []);

  return produce(state, (draftState) => {
    draftState.columns = orderedColumns;
  });
};

// TODO this can be a blind set
export const changeSelectedFile: ActionResponse<string> = (state, payload) => {
  return produce(state, (draftState) => {
    draftState.currentlySelectedFile = payload;
  });
};

export const coerceType: ActionResponse<CoerceTypePayload> = (state, payload) => {
  const {field, type} = payload;
  return produce(state, (draftState) => {
    const columnIdx = state.columns.findIndex((d: any) => d.field === field);
    const column = draftState.columns[columnIdx];
    draftState.columns[columnIdx].type = type;
    draftState.columns[columnIdx].domain = column.summary.coercionTypes[type];
    draftState.templateMap.systemValues.dataTransforms =
      draftState.templateMap.systemValues.dataTransforms.filter((transform) => {
        if (transform.filter && transform.filter.field === field) {
          return false;
        }
        return true;
      });
  });
};

export const recieveLanguages: ActionResponse<{[x: string]: LanguageExtension}> = (state, payload) => {
  return produce(state, (draftState) => {
    draftState.languages = payload;
  });
};
