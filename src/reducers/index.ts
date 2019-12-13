import Immutable from 'immutable';
import {createStore, combineReducers, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import {getTemplate} from '../utils';
import {EMPTY_SPEC} from './default-state';
// import {Spec} from 'vega-typings';

import {
  setEncodingParameter,
  clearEncoding,
  changeMarkType,
  setNewSpec,
  setNewSpecCode,
  coerceType,
  triggerRedo,
  triggerUndo,
  pushToUndoStack,
  swapXAndYChannels,
  setChannelToMetaColumn,
  setRepeats,
  updateCodeRepresentation,
} from './modify-encodings';

import {addToNextOpenSlot} from './apt-actions';

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
  fillTemplateMapWithDefaults,
} from './template-actions';
import {createNewView, deleteView, switchView, cloneView} from './view-actions';
import {AppState, DEFAULT_STATE, ActionResponse} from './default-state';

// GUI ACTIONS
const setProgrammaticView: ActionResponse = (state, payload) =>
  state.set('showProgrammaticMode', !state.get('showProgrammaticMode'));
const toggleDataModal: ActionResponse = state =>
  state.set('dataModalOpen', !state.get('dataModalOpen'));
const changeTheme: ActionResponse = (state, payload) =>
  state.set('currentTheme', payload);
const clearUnprounceWarning: ActionResponse = state =>
  state.set('unprouncableInGrammer', false);
const toggleTemplateBuilder: ActionResponse = state =>
  state.set('templateBuilderModalOpen', !state.get('templateBuilderModalOpen'));

export const setEncodingMode: ActionResponse = (state, payload) => {
  const newState = state.set('encodingMode', payload);
  if (payload !== 'grammer') {
    // this will become the local copy of the template
    const template = getTemplate(state, payload);
    const updatedSpec = Immutable.fromJS(JSON.parse(template.code));
    return fillTemplateMapWithDefaults(
      newState
        .set('currentTemplateInstance', Immutable.fromJS(template))
        .set('spec', updatedSpec),
    );
  } else {
    return newState
      .set('spec', EMPTY_SPEC)
      .set('currentTemplateInstance', null);
  }
};

const wrap = (func: ActionResponse, wrapper: any): ActionResponse => (
  state,
  payload,
) => wrapper(state, func(state, payload));
const addUndo = (func: ActionResponse): ActionResponse =>
  wrap(func, pushToUndoStack);

const addUpdateCode = (func: ActionResponse): ActionResponse =>
  wrap(func, updateCodeRepresentation);

const actionFuncMap: {[val: string]: ActionResponse} = {
  // data modifications
  'change-selected-file': changeSelectedFile,
  'recieve-data': recieveData,
  'recieve-type-inferences': recieveTypeInferences,

  // encoding modifications
  'add-to-next-open-slot': addUndo(addUpdateCode(addToNextOpenSlot)),
  'change-mark-type': addUndo(addUpdateCode(changeMarkType)),
  'clear-encoding': addUndo(addUpdateCode(clearEncoding)),
  'coerce-type': addUndo(addUpdateCode(coerceType)),
  'set-encoding-param': addUndo(addUpdateCode(setEncodingParameter)),
  'set-channel-to-meta-colum': addUndo(addUpdateCode(setChannelToMetaColumn)),
  'set-new-encoding': addUndo(addUpdateCode(setNewSpec)),
  'set-new-encoding-code': addUndo(setNewSpecCode),
  'set-repeats': addUndo(addUpdateCode(setRepeats)),
  'swap-x-and-y-channels': addUndo(addUpdateCode(swapXAndYChannels)),

  'trigger-redo': addUpdateCode(triggerRedo),
  'trigger-undo': addUpdateCode(triggerUndo),

  // filter modifications
  'create-filter': addUndo(addUpdateCode(createFilter)),
  'delete-filter': addUndo(addUpdateCode(deleteFilter)),
  'update-filter': addUndo(addUpdateCode(updateFilter)),

  // gui modifications
  'change-theme': changeTheme,
  'toggle-data-modal': toggleDataModal,
  'clear-unprouncable': clearUnprounceWarning,
  'set-encoding-mode': setEncodingMode,
  'toggle-template-builder': toggleTemplateBuilder,
  'toggle-programmatic-view': setProgrammaticView,

  // template
  'recieve-templates': recieveTemplates,
  'set-template-value': addUndo(setTemplateValue),
  'create-template': createTemplate,
  'delete-template': deleteTemplate,
  'start-edit-template': startTemplateEdit,

  // views
  'create-new-view': addUndo(createNewView),
  'delete-view': addUndo(deleteView),
  'switch-view': addUndo(switchView),
  'clone-view': addUndo(cloneView),
};
const NULL_ACTION: ActionResponse = state => state;
const reducers = {
  base: (
    state: AppState = DEFAULT_STATE,
    {type, payload}: {type: string; payload: any},
  ) => {
    console.log(type);
    return (actionFuncMap[type] || NULL_ACTION)(state, payload);
  },
};
export default function setUpState() {
  return createStore(combineReducers(reducers), applyMiddleware(thunk));
}
