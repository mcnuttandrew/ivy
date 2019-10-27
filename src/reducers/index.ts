import {createStore, combineReducers, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
// import {Spec} from 'vega-typings';

import {
  setEncodingParameter,
  clearEncoding,
  changeMarkType,
  setNewSpec,
  setNewSpecCode,
  addToNextOpenSlot,
  coerceType,
} from './modify-encodings';

import {createFilter, updateFilter, deleteFilter} from './filter-actions';
import {
  recieveData,
  recieveTypeInferences,
  changeSelectedFile,
} from './data-actions';
import {AppState, DEFAULT_STATE, ActionResponse} from './default-state';

// GUI ACTIONS
const changeGUIMode: ActionResponse = (state, payload) =>
  state.set('selectedGUIMode', payload);
const toggleDataModal: ActionResponse = state =>
  state.set('dataModalOpen', !state.get('dataModalOpen'));
const changeTheme: ActionResponse = (state, payload) =>
  state.set('currentTheme', payload);

const actionFuncMap: {[val: string]: ActionResponse} = {
  // data modifications
  'change-selected-file': changeSelectedFile,
  'recieve-data': recieveData,
  'recieve-type-inferences': recieveTypeInferences,

  // encoding modifications
  'add-to-next-open-slot': addToNextOpenSlot,
  'change-mark-type': changeMarkType,
  'clear-encoding': clearEncoding,
  'coerce-type': coerceType,
  'set-encoding-param': setEncodingParameter,
  'set-new-encoding': setNewSpec,
  'set-new-encoding-code': setNewSpecCode,

  // filter modifications
  'create-filter': createFilter,
  'delete-filter': deleteFilter,
  'update-filter': updateFilter,

  // gui modifications
  'change-gui-mode': changeGUIMode,
  'change-theme': changeTheme,
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
