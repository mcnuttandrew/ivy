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
  triggerRedo,
  triggerUndo,
  pushToUndoStack,
  swapXAndYChannels,
  setChannelToMetaColumn,
  setRepeats,
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
const addUndo = (func: ActionResponse): ActionResponse =>
  wrap(func, pushToUndoStack);

const actionFuncMap: {[val: string]: ActionResponse} = {
  // data modifications
  'change-selected-file': changeSelectedFile,
  'recieve-data': recieveData,
  'recieve-type-inferences': recieveTypeInferences,

  // encoding modifications
  'add-to-next-open-slot': addUndo(addToNextOpenSlot),
  'change-mark-type': addUndo(changeMarkType),
  'clear-encoding': addUndo(clearEncoding),
  'coerce-type': addUndo(coerceType),
  'set-encoding-param': addUndo(setEncodingParameter),
  'set-channel-to-meta-colum': addUndo(setChannelToMetaColumn),
  'set-new-encoding': addUndo(setNewSpec),
  'set-new-encoding-code': addUndo(setNewSpecCode),
  'set-repeats': addUndo(setRepeats),
  'swap-x-and-y-channels': addUndo(swapXAndYChannels),

  'trigger-redo': triggerRedo,
  'trigger-undo': triggerUndo,

  // filter modifications
  'create-filter': addUndo(createFilter),
  'delete-filter': addUndo(deleteFilter),
  'update-filter': addUndo(updateFilter),

  // gui modifications
  'change-gui-mode': changeGUIMode,
  'change-theme': changeTheme,
  'toggle-data-modal': toggleDataModal,
};
const NULL_ACTION: ActionResponse = state => state;
const reducers = {
  base: (
    state: AppState = DEFAULT_STATE,
    {type, payload}: {type: string, payload: any},
  ) => {
    console.log(type);
    return (actionFuncMap[type] || NULL_ACTION)(state, payload);
  },
};
export default function setUpState() {
  return createStore(combineReducers(reducers), applyMiddleware(thunk));
}
