import {createStore, combineReducers, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';

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
  deleteTemplate,
  setWidgetValue,
  addWidget,
  removeWidget,
  moveWidget,
  saveCurrentTemplate,
  modifyValueOnTemplate,
  setBlankTemplate,
} from './template-actions';
import {createNewView, deleteView, switchView, cloneView} from './view-actions';
import {
  changeTheme,
  toggleDataModal,
  setEncodingMode,
  setProgrammaticView,
  setEditMode,
  setCodeMode,
} from './gui-actions';

import {AppState, DEFAULT_STATE, ActionResponse} from './default-state';

// second order effects
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
  'set-encoding-mode': setEncodingMode,
  'toggle-programmatic-view': setProgrammaticView,
  'set-edit-mode': setEditMode,
  'set-code-mode': setCodeMode,

  // template
  'recieve-templates': recieveTemplates,
  'set-template-value': addUndo(setTemplateValue),
  'delete-template': deleteTemplate,
  'save-template': saveCurrentTemplate,
  'set-widget-value': setWidgetValue,
  'add-widget-to-template': addWidget,
  'remove-widget-from-template': removeWidget,
  'move-widget-in-template': moveWidget,
  'modify-value-on-template': addUpdateCode(modifyValueOnTemplate),
  'set-blank-template': addUpdateCode(setBlankTemplate),

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
