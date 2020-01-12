import {createStore, combineReducers, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';

import {
  changeMarkType,
  clearEncoding,
  coerceType,
  pushToUndoStack,
  setChannelToMetaColumn,
  setEncodingParameter,
  setNewSpec,
  setNewSpecCode,
  setRepeats,
  swapXAndYChannels,
  triggerRedo,
  triggerUndo,
  updateCodeRepresentation,
} from './modify-encodings';

import {addToNextOpenSlot} from './apt-actions';

import {createFilter, updateFilter, deleteFilter} from './filter-actions';
import {changeSelectedFile, recieveData, recieveTypeInferences} from './data-actions';
import {
  addWidget,
  deleteTemplate,
  modifyValueOnTemplate,
  moveWidget,
  recieveTemplates,
  removeWidget,
  saveCurrentTemplate,
  setBlankTemplate,
  setTemplateValue,
  setWidgetValue,
} from './template-actions';
import {createNewView, deleteView, switchView, cloneView} from './view-actions';
import {
  changeTheme,
  setCodeMode,
  setEditMode,
  setEncodingMode,
  setGuiView,
  setProgrammaticView,
  setSimpleDisplay,
  toggleDataModal,
} from './gui-actions';

import {AppState, DEFAULT_STATE, ActionResponse} from './default-state';

// second order effects
const wrap = (func: ActionResponse, wrapper: any): ActionResponse => (state, payload): AppState =>
  wrapper(state, func(state, payload));
const addUndo = (func: ActionResponse): ActionResponse => wrap(func, pushToUndoStack);
const addUpdateCode = (func: ActionResponse): ActionResponse => wrap(func, updateCodeRepresentation);

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
  'set-channel-to-meta-colum': addUndo(addUpdateCode(setChannelToMetaColumn)),
  'set-encoding-param': addUndo(addUpdateCode(setEncodingParameter)),
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
  'set-code-mode': setCodeMode,
  'set-edit-mode': setEditMode,
  'set-encoding-mode': setEncodingMode,
  'set-gui-view': setGuiView,
  'set-simple-display': setSimpleDisplay,
  'toggle-data-modal': toggleDataModal,
  'toggle-programmatic-view': setProgrammaticView,

  // template
  'add-widget-to-template': addWidget,
  'delete-template': deleteTemplate,
  'modify-value-on-template': addUpdateCode(modifyValueOnTemplate),
  'move-widget-in-template': moveWidget,
  'recieve-templates': recieveTemplates,
  'remove-widget-from-template': removeWidget,
  'save-template': saveCurrentTemplate,
  'set-blank-template': addUpdateCode(setBlankTemplate),
  'set-template-value': addUndo(setTemplateValue),
  'set-widget-value': setWidgetValue,

  // views
  'clone-view': addUndo(cloneView),
  'create-new-view': addUndo(createNewView),
  'delete-view': addUndo(deleteView),
  'switch-view': addUndo(switchView),
};
const NULL_ACTION: ActionResponse = state => state;
const reducers = {
  base: (state: AppState = DEFAULT_STATE, {type, payload}: {type: string; payload: any}): AppState => {
    console.log(type);
    return (actionFuncMap[type] || NULL_ACTION)(state, payload);
  },
};
export default function setUpState(): any {
  return createStore(combineReducers(reducers), applyMiddleware(thunk));
}
