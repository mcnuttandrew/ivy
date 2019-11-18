import Immutable from 'immutable';
import {createStore, combineReducers, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import {checkEncodingForValidity, getTemplate} from '../utils';
import {EMPTY_SPEC} from './default-state';
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
import {
  recieveTemplates,
  setTemplateValue,
  createTemplate,
  deleteTemplate,
  startTemplateEdit,
} from './template-actions';
import {AppState, DEFAULT_STATE, ActionResponse} from './default-state';

// GUI ACTIONS
const changeGUIMode: ActionResponse = (state, payload) =>
  state
    .set('selectedGUIMode', payload)
    .set(
      'unprouncableInGrammer',
      !checkEncodingForValidity(state.get('spec').toJS()),
    );
const toggleDataModal: ActionResponse = state =>
  state.set('dataModalOpen', !state.get('dataModalOpen'));
const changeTheme: ActionResponse = (state, payload) =>
  state.set('currentTheme', payload);
const clearUnprounceWarning: ActionResponse = state =>
  state.set('unprouncableInGrammer', false);
const toggleTemplateBuilder: ActionResponse = state =>
  state.set('templateBuilderModalOpen', !state.get('templateBuilderModalOpen'));

const setEncodingMode: ActionResponse = (state, payload) => {
  const newState = state.set('encodingMode', payload);
  if (payload !== 'grammer') {
    const updatedSpec = Immutable.fromJS(
      JSON.parse(getTemplate(state, payload).code),
    );
    return newState.set('spec', updatedSpec);
  } else {
    return newState.set('spec', EMPTY_SPEC);
  }
};

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
  'clear-unprouncable': clearUnprounceWarning,
  'set-encoding-mode': setEncodingMode,
  'toggle-template-builder': toggleTemplateBuilder,

  // template
  'recieve-templates': recieveTemplates,
  'set-template-value': addUndo(setTemplateValue),
  'create-template': createTemplate,
  'delete-template': deleteTemplate,
  'start-edit-template': startTemplateEdit,
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
