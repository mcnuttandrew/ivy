import {createStore, combineReducers, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import {Spec} from 'vega-typings';
import {ColumnHeader, DataType} from '../types';
import Immutable, {Map} from 'immutable';

// interface InternalAppState {
//   spec: Spec;
//   data: any;
//   columns: ColumnHeader[];
// }
export type AppState = any;
// TODO undo this embarrasment
const EMPTY_SPEC = Immutable.fromJS({
  data: {name: 'myData'},
  mark: 'circle',
  encoding: {},
});
const DEFAULT_STATE: AppState = Map({
  spec: EMPTY_SPEC,
  data: [],
  columns: [],
  currentlySelectedFile: 'cars.json',
});

interface ActionResponse {
  (state: AppState, payload: any): AppState;
}
const recieveDataFromPredefinedDatasets: ActionResponse = (state, payload) => {
  // this might be the wrong way to do this? it sort of depends on the internals of that vega component
  return state.set('data', payload).set('spec', EMPTY_SPEC);
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

const TYPE_TRANSLATE: {[s: string]: string} = {
  DIMENSION: 'ordinal',
  MEASURE: 'quantitative',
};

const setEncodingParam: ActionResponse = (state, payload) => {
  const fieldHeader = state
    .get('columns')
    .find(({field}: {field: string}) => field === payload.text);
  // const spec = {...state.get('spec')};
  if (fieldHeader) {
    return state.setIn(
      ['spec', 'encoding', payload.field],
      Immutable.fromJS({
        field: payload.text,
        type: TYPE_TRANSLATE[fieldHeader.type],
      }),
    );
  } else {
    console.log('???');
    return state.deleteIn(['spec', 'encoding', payload.field]);
  }
};

const clearEncoding: ActionResponse = state => state.set('spec', EMPTY_SPEC);

const actionFuncMap: {[val: string]: ActionResponse} = {
  'recieve-data-from-predefined': recieveDataFromPredefinedDatasets,
  'recieve-type-inferences': recieveTypeInferences,
  'change-selected-file': changeSelectedFile,
  'set-encoding-param': setEncodingParam,
  'clear-encoding': clearEncoding,
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
