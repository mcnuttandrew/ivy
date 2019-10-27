import {createStore, combineReducers, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
// import {Spec} from 'vega-typings';
import {ColumnHeader, DataType} from '../types';
import Immutable, {Map} from 'immutable';
import {getUniques, getDomain, findField} from '../utils';

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
  mark: 'point',
  encoding: {
    x: {},
    y: {},
  },
});
const DEFAULT_STATE: AppState = Map({
  spec: EMPTY_SPEC,
  specCode: JSON.stringify(EMPTY_SPEC, null, 2),
  data: [],
  columns: [],
  currentlySelectedFile: 'cars.json',
  selectedGUIMode: 'GRAMMAR',
  // selectedGUIMode: 'PROGRAMMATIC',
  dataModalOpen: false,
  currentTheme: 'urbaninstitute',
});

interface ActionResponse {
  (state: AppState, payload: any): AppState;
}
const recieveData: ActionResponse = (state, payload) => {
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

const setEncodingParameter: ActionResponse = (state, payload) => {
  const fieldHeader = findField(state, payload.text);
  const route = ['spec', 'encoding'];
  let newState = state;
  if (fieldHeader) {
    newState = state.setIn(
      [...route, payload.field],
      Immutable.fromJS({
        field: payload.text,
        type: TYPE_TRANSLATE[fieldHeader.type],
      }),
    );
  } else {
    newState = state.setIn([...route, payload.field], Map());
  }
  if (payload.containingShelf) {
    newState = newState.setIn([...route, payload.containingShelf], Map());
  }

  return newState;
};

const clearEncoding: ActionResponse = state => state.set('spec', EMPTY_SPEC);
const changeMarkType: ActionResponse = (state, payload) => {
  const route = ['spec', 'mark', 'type'];
  if (!state.getIn(route)) {
    return state.setIn(['spec', 'mark'], Immutable.fromJS({type: payload}));
  }
  return state.setIn(route, payload);
};
const setNewSpecCode: ActionResponse = (state, payload) => {
  const {code, inError} = payload;
  if (inError) {
    return state.set('specCode', code);
  }
  return state
    .set('specCode', code)
    .set('spec', Immutable.fromJS(JSON.parse(code)));
};

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
    'size',
    'color',
    'shape',
    'detail',
    'text',
    'column',
    'rows',
  ].find(field => {
    return !encoding[field] || JSON.stringify(encoding[field]) === '{}';
  });
  // TODO add messaging about not being able to find a place to put the thing
  if (!targetField) {
    return state;
  }
  encoding[targetField] = {
    field: payload.field,
    type: TYPE_TRANSLATE[findField(state, payload.field).type],
  };
  return state.setIn(['spec', 'encoding'], Immutable.fromJS(encoding));
};

const createFilter: ActionResponse = (state, payload) => {
  const isDim = findField(state, payload.field).type === 'DIMENSION';
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
const changeTheme: ActionResponse = (state, payload) =>
  state.set('currentTheme', payload);

const actionFuncMap: {[val: string]: ActionResponse} = {
  'recieve-data': recieveData,
  'recieve-type-inferences': recieveTypeInferences,
  'change-selected-file': changeSelectedFile,
  'set-encoding-param': setEncodingParameter,
  'clear-encoding': clearEncoding,
  'change-mark-type': changeMarkType,
  'set-new-encoding': setNewSpec,
  'set-new-encoding-code': setNewSpecCode,
  'add-to-next-open-slot': addToNextOpenSlot,
  'create-filter': createFilter,
  'update-filter': updateFilter,
  'delete-filter': deleteFilter,

  // TODO exrract UI controls into their own reducer
  'change-gui-mode': changeGUIMode,
  'toggle-data-modal': toggleDataModal,
  'change-theme': changeTheme,
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
