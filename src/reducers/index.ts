import {createStore, combineReducers, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
// import {Spec} from 'vega-typings';
import {ColumnHeader, DataType} from '../types';
import Immutable, {Map} from 'immutable';
import {getUniques, getDomain} from '../utils';

// interface InternalAppState {
//   spec: Spec;
//   data: any;
//   columns: ColumnHeader[];
// }
export type AppState = any;
// TODO undo this embarrasment
const EMPTY_SPEC = Immutable.fromJS({
  data: {name: 'myData'},
  transform: [],
  mark: {
    type: 'circle',
  },
  encoding: {},
});
const DEFAULT_STATE: AppState = Map({
  spec: EMPTY_SPEC,
  data: [],
  columns: [],
  currentlySelectedFile: 'cars.json',
  selectedGUIMode: 'GRAMMAR',
  dataModalOpen: false,
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
    domain: number[] | string[],
  };
  const modifiedColumns = payload.map(
    ({key, type, category, domain}: DestructType) => {
      const newHeader: ColumnHeader = {
        field: key,
        type: category,
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
  return state.set('columns', orderedColumns);
};

const changeSelectedFile: ActionResponse = (state, payload) => {
  return state.set('currentlySelectedFile', payload);
};

const TYPE_TRANSLATE: {[s: string]: string} = {
  DIMENSION: 'ordinal',
  MEASURE: 'quantitative',
  TIME: 'temporal',
};

const setEncodingParam: ActionResponse = (state, payload) => {
  const fieldHeader = state
    .get('columns')
    .find(({field}: {field: string}) => field === payload.text);

  let newState = state;
  if (fieldHeader) {
    newState = state.setIn(
      ['spec', 'encoding', payload.field],
      Immutable.fromJS({
        field: payload.text,
        type: TYPE_TRANSLATE[fieldHeader.type],
      }),
    );
  } else {
    newState = state.deleteIn(['spec', 'encoding', payload.field]);
  }
  if (payload.containingShelf) {
    newState = newState.deleteIn(['spec', 'encoding', payload.containingShelf]);
  }

  return newState;
};

const clearEncoding: ActionResponse = state => state.set('spec', EMPTY_SPEC);
const changeMarkType: ActionResponse = (state, payload) =>
  state.setIn(['spec', 'mark', 'type'], payload);
const setNewSpec: ActionResponse = (state, payload) =>
  state.set('spec', Immutable.fromJS(payload));

const changeGUIMode: ActionResponse = (state, payload) =>
  state.set('selectedGUIMode', payload);

const addToNextOpenSlot: ActionResponse = (state, payload) => {
  // TODO this needs to be done smarter, see if the aglorithm can be copied form polestar
  const encoding = state.getIn(['spec', 'encoding']).toJS();
  const targetField = [
    'x',
    'y',
    'column',
    'rows',
    'size',
    'color',
    'shape',
    'detail',
    'text',
  ].find(field => !encoding[field]);
  if (!targetField) {
    return state;
  }
  encoding[targetField] = {field: payload.field, type: 'ordinal'};
  return state.setIn(['spec', 'encoding'], Immutable.fromJS(encoding));
};

const createFilter: ActionResponse = (state, payload) => {
  const fieldHeader = state
    .get('columns')
    .find(({field}: {field: string}) => field === payload.field);
  const isDim = fieldHeader.type === 'DIMENSION';
  const newFilter: any = {
    filter: {
      field: payload.field,
      // todo this is really slick, but we should probably be caching these values on load
      [isDim ? 'oneOf' : 'range']: (isDim ? getUniques : getDomain)(
        state.get('data'),
        payload.field,
      ),
    },
  };

  return state.updateIn(['spec', 'transform'], (arr: any) =>
    arr.push(Immutable.fromJS(newFilter)),
  );
};

const updateFilter: ActionResponse = (state, payload) => {
  const {newFilterValue, idx} = payload;
  const newVal = Immutable.fromJS(newFilterValue);
  const oneOf = ['spec', 'transform', idx, 'filter', 'oneOf'];
  if (state.getIn(oneOf)) {
    return state.setIn(oneOf, newVal);
  }
  return state.setIn(['spec', 'transform', idx, 'filter', 'range'], newVal);
};

const deleteFilter: ActionResponse = (state, deleteIndex) => {
  return state.deleteIn(['spec', 'transform', deleteIndex]);
};

const toggleDataModal: ActionResponse = state =>
  state.set('dataModalOpen', !state.get('dataModalOpen'));

const actionFuncMap: {[val: string]: ActionResponse} = {
  'recieve-data-from-predefined': recieveDataFromPredefinedDatasets,
  'recieve-type-inferences': recieveTypeInferences,
  'change-selected-file': changeSelectedFile,
  'set-encoding-param': setEncodingParam,
  'clear-encoding': clearEncoding,
  'change-mark-type': changeMarkType,
  'set-new-encoding': setNewSpec,
  'add-to-next-open-slot': addToNextOpenSlot,
  'change-gui-mode': changeGUIMode,
  'create-filter': createFilter,
  'update-filter': updateFilter,
  'delete-filter': deleteFilter,
  // TODO exrract UI controls into their own reducer
  'toggle-data-modal': toggleDataModal,
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
