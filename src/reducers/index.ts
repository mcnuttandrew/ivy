import {createStore, combineReducers, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import {Spec} from 'vega-typings';
import {ColumnHeader, DataType} from '../types';
import {Map} from 'immutable';

// interface InternalAppState {
//   spec: Spec;
//   data: any;
//   columns: ColumnHeader[];
// }
export type AppState = any;
// TODO undo this embarrasment
const DEFAULT_STATE: AppState = Map({
  spec: {
    mark: 'circle',
    encoding: {},
  },
  data: [],
  columns: [],
  currentlySelectedFile: 'cars.json',
});

interface ActionResponse {
  (state: AppState, payload: any): AppState;
}
const recieveDataFromPredefinedDatasets: ActionResponse = (state, payload) => {
  // this might be the wrong way to do this? it sort of depends on the internals of that vega component
  return state.set('data', payload);
};

const recieveTypeInferences: ActionResponse = (state, payload) => {
  type DestructType = {
    key: string,
    type: string,
    category: DataType,
  };
  const modifiedColumns = payload.map(({key, type, category}: DestructType) => {
    const newHeader: ColumnHeader = {
      field: key,
      type: category,
      secondaryType: type,
    };
    return newHeader;
  });
  return state.set('columns', modifiedColumns);
};

const changeSelectedFile: ActionResponse = (state, payload) => {
  return state.set('currentlySelectedFile', payload);
};

const actionFuncMap: {[val: string]: ActionResponse} = {
  'recieve-data-from-predefined': recieveDataFromPredefinedDatasets,
  'recieve-type-inferences': recieveTypeInferences,
  'change-selected-file': changeSelectedFile,
};
const NULL_ACTION: ActionResponse = state => state;

export default createStore(
  combineReducers({
    base: (
      state: AppState = DEFAULT_STATE,
      {type, payload}: {type: string, payload: any},
    ) => {
      return (actionFuncMap[type] || NULL_ACTION)(state, payload);
    },
  }),
  applyMiddleware(thunk),
);
