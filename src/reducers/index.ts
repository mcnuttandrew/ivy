import {createStore, combineReducers, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
// import {Spec} from 'vega-typings';

import {
  setEncodingParameter,
  setFacetingParameter,
  clearEncoding,
  changeMarkType,
  setNewSpec,
  setNewSpecCode,
  addToNextOpenSlot,
  coerceType,
  triggerRedo,
  triggerUndo,
  pushToUndoStack,
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

const wrap = (func: ActionResponse, wrapper: any): ActionResponse => (
  state,
  payload,
) => wrapper(state, func(state, payload));

const actionFuncMap: {[val: string]: ActionResponse} = {
  // data modifications
  'change-selected-file': changeSelectedFile,
  'recieve-data': recieveData,
  'recieve-type-inferences': recieveTypeInferences,

  // encoding modifications
  'add-to-next-open-slot': wrap(addToNextOpenSlot, pushToUndoStack),
  'change-mark-type': wrap(changeMarkType, pushToUndoStack),
  'clear-encoding': wrap(clearEncoding, pushToUndoStack),
  'coerce-type': wrap(coerceType, pushToUndoStack),
  'set-encoding-param': wrap(setEncodingParameter, pushToUndoStack),
  'set-faceting-param': wrap(setFacetingParameter, pushToUndoStack),
  'set-new-encoding': wrap(setNewSpec, pushToUndoStack),
  'set-new-encoding-code': wrap(setNewSpecCode, pushToUndoStack),

  'trigger-redo': triggerRedo,
  'trigger-undo': triggerUndo,

  // filter modifications
  'create-filter': wrap(createFilter, pushToUndoStack),
  'delete-filter': wrap(deleteFilter, pushToUndoStack),
  'update-filter': wrap(updateFilter, pushToUndoStack),

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
