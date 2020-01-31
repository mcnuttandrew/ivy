import {createStore, combineReducers, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import {
  ADD_TO_NEXT_OPEN_SLOT,
  ADD_TO_WIDGET_TEMPLATE,
  CHANGE_MARK_TYPE,
  CHANGE_SELECTED_FILE,
  CHANGE_THEME,
  CLEAR_ENCODING,
  CLONE_VIEW,
  COERCE_TYPE,
  CREATE_FILTER,
  CREATE_NEW_VIEW,
  DELETE_FILTER,
  DELETE_TEMPLATE,
  DELETE_VIEW,
  LOAD_EXTERNAL_TEMPLATE,
  MODIFY_VALUE_ON_TEMPLATE,
  MOVE_WIDGET_IN_TEMPLATE,
  READ_IN_TEMPLATE,
  READ_IN_TEMPLATE_MAP,
  RECIEVE_DATA,
  RECIEVE_TEMPLATE,
  RECIEVE_TYPE_INFERENCES,
  REMOVE_WIDGET_FROM_TEMPLATE,
  SAVE_TEMPLATE,
  SET_ALL_TEMPLATE_VALUES,
  SET_BLANK_TEMPLATE,
  SET_CODE_MODE,
  SET_EDITOR_FONT_SIZE,
  SET_EDIT_MODE,
  SET_ENCODING_MODE,
  SET_ENCODING_PARAM,
  SET_GUI_VIEW,
  SET_NEW_ENCODING,
  SET_NEW_ENCODING_CODE,
  SET_REPEATS,
  SET_TEMPLATE_VALUE,
  SET_WIDGET_VALUE,
  SWAP_X_AND_Y_CHANNELS,
  SWITCH_VIEW,
  TOGGLE_DATA_MODAL,
  TOGGLE_PROGRAMMATIC_VIEW,
  TOGGLE_PROGRAM_MODAL,
  TRIGGER_REDO,
  TRIGGER_UNDO,
  UPDATE_FILTER,
} from '../actions/action-types';

import {
  changeMarkType,
  clearEncoding,
  coerceType,
  pushToUndoStack,
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
  loadExternalTemplate,
  modifyValueOnTemplate,
  moveWidget,
  readInTemplate,
  readInTemplateMap,
  recieveTemplates,
  removeWidget,
  saveCurrentTemplate,
  setAllTemplateValues,
  setBlankTemplate,
  setTemplateValue,
  setWidgetValue,
} from './template-actions';
import {createNewView, deleteView, switchView, cloneView} from './view-actions';
import {
  changeTheme,
  setCodeMode,
  setEditMode,
  setEditorFontSize,
  setEncodingMode,
  setGuiView,
  setProgrammaticView,
  toggleDataModal,
  toggleProgramModal,
} from './gui-actions';

import {AppState, DEFAULT_STATE, ActionResponse} from './default-state';

// second order effects
const wrap = (func: ActionResponse<any>, wrapper: any): ActionResponse<any> => (state, payload): AppState =>
  wrapper(state, func(state, payload));
const addUndo = (func: ActionResponse<any>): ActionResponse<any> => wrap(func, pushToUndoStack);
const addUpdateCode = (func: ActionResponse<any>): ActionResponse<any> =>
  wrap(func, updateCodeRepresentation);

const actionFuncMap: {[val: string]: ActionResponse<any>} = {
  // data modifications
  [CHANGE_SELECTED_FILE]: changeSelectedFile,
  [RECIEVE_DATA]: recieveData,
  [RECIEVE_TYPE_INFERENCES]: recieveTypeInferences,

  // encoding modifications
  [ADD_TO_NEXT_OPEN_SLOT]: addUndo(addUpdateCode(addToNextOpenSlot)),
  [CHANGE_MARK_TYPE]: addUndo(addUpdateCode(changeMarkType)),
  [CLEAR_ENCODING]: addUndo(addUpdateCode(clearEncoding)),
  [COERCE_TYPE]: addUndo(addUpdateCode(coerceType)),
  [SET_ENCODING_PARAM]: addUndo(addUpdateCode(setEncodingParameter)),
  [SET_NEW_ENCODING]: addUndo(addUpdateCode(setNewSpec)),
  [SET_NEW_ENCODING_CODE]: addUndo(setNewSpecCode),
  [SET_REPEATS]: addUndo(addUpdateCode(setRepeats)),
  [SWAP_X_AND_Y_CHANNELS]: addUndo(addUpdateCode(swapXAndYChannels)),

  [TRIGGER_REDO]: addUpdateCode(triggerRedo),
  [TRIGGER_UNDO]: addUpdateCode(triggerUndo),

  // filter modifications
  [CREATE_FILTER]: addUndo(addUpdateCode(createFilter)),
  [DELETE_FILTER]: addUndo(addUpdateCode(deleteFilter)),
  [UPDATE_FILTER]: addUndo(addUpdateCode(updateFilter)),

  // gui modifications
  [CHANGE_THEME]: changeTheme,
  [SET_CODE_MODE]: setCodeMode,
  [SET_EDIT_MODE]: setEditMode,
  [SET_EDITOR_FONT_SIZE]: setEditorFontSize,
  [SET_ENCODING_MODE]: setEncodingMode,
  [SET_GUI_VIEW]: setGuiView,
  [TOGGLE_DATA_MODAL]: toggleDataModal,
  [TOGGLE_PROGRAM_MODAL]: toggleProgramModal,
  [TOGGLE_PROGRAMMATIC_VIEW]: setProgrammaticView,

  // template
  [ADD_TO_WIDGET_TEMPLATE]: addWidget,
  [DELETE_TEMPLATE]: deleteTemplate,
  [LOAD_EXTERNAL_TEMPLATE]: loadExternalTemplate,
  [MODIFY_VALUE_ON_TEMPLATE]: addUpdateCode(modifyValueOnTemplate),
  [MOVE_WIDGET_IN_TEMPLATE]: moveWidget,
  [READ_IN_TEMPLATE]: addUpdateCode(readInTemplate),
  [READ_IN_TEMPLATE_MAP]: addUpdateCode(readInTemplateMap),
  [RECIEVE_TEMPLATE]: recieveTemplates,
  [REMOVE_WIDGET_FROM_TEMPLATE]: removeWidget,
  [SAVE_TEMPLATE]: saveCurrentTemplate,
  [SET_ALL_TEMPLATE_VALUES]: setAllTemplateValues,
  [SET_BLANK_TEMPLATE]: addUpdateCode(setBlankTemplate),
  [SET_TEMPLATE_VALUE]: addUndo(setTemplateValue),
  [SET_WIDGET_VALUE]: setWidgetValue,

  // views
  [CLONE_VIEW]: addUndo(cloneView),
  [CREATE_NEW_VIEW]: addUndo(createNewView),
  [DELETE_VIEW]: addUndo(deleteView),
  [SWITCH_VIEW]: addUndo(switchView),
};
const NULL_ACTION: ActionResponse<void> = state => state;
const reducers = {
  base: (state: AppState = DEFAULT_STATE, {type, payload}: {type: string; payload: any}): AppState => {
    console.log(type);
    return (actionFuncMap[type] || NULL_ACTION)(state, payload);
  },
};
export default function setUpState(): any {
  return createStore(combineReducers(reducers), applyMiddleware(thunk));
}
