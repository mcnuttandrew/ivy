import {createStore, combineReducers, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import * as actionTypes from '../actions/action-types';

import {
  clearEncoding,
  coerceType,
  setNewSpec,
  setNewSpecCode,
  updateCodeRepresentation,
} from './modify-encodings';

import {pushToUndoStack, triggerRedo, triggerUndo} from './undo-actions';

import {addToNextOpenSlot} from './apt-actions';

import {createFilter, updateFilter, deleteFilter} from './filter-actions';
import {
  changeSelectedFile,
  recieveData,
  recieveDataForDataReducer,
  recieveTypeInferences,
} from './data-actions';
import {
  addWidget,
  deleteTemplate,
  fillTemplateMapWithDefaults,
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
import {createNewView, deleteView, switchView, cloneView, changeViewName} from './view-actions';
import {
  setCodeMode,
  setEditMode,
  setEncodingMode,
  setGuiView,
  setUserName,
  setProgrammaticView,
  toggleDataModal,
  toggleProgramModal,
} from './gui-actions';

import {AppState, DEFAULT_STATE, ActionResponse, DataReducerState} from './default-state';

// second order effects
const wrap = (func: ActionResponse<any>, wrapper: any): ActionResponse<any> => (state, payload): AppState =>
  wrapper(state, func(state, payload));
const addUndo = (func: ActionResponse<any>): ActionResponse<any> => wrap(func, pushToUndoStack);
const addUpdateCode = (func: ActionResponse<any>): ActionResponse<any> =>
  wrap(func, updateCodeRepresentation);

const actionFuncMap: {[val: string]: ActionResponse<any>} = {
  // data modifications
  [actionTypes.CHANGE_SELECTED_FILE]: changeSelectedFile,
  [actionTypes.RECIEVE_DATA]: recieveData,
  [actionTypes.RECIEVE_TYPE_INFERENCES]: recieveTypeInferences,

  // encoding modifications
  [actionTypes.ADD_TO_NEXT_OPEN_SLOT]: addUndo(addUpdateCode(addToNextOpenSlot)),
  [actionTypes.CLEAR_ENCODING]: addUndo(addUpdateCode(clearEncoding)),
  [actionTypes.COERCE_TYPE]: addUndo(addUpdateCode(coerceType)),
  [actionTypes.SET_NEW_ENCODING]: addUndo(addUpdateCode(setNewSpec)),
  [actionTypes.SET_NEW_ENCODING_CODE]: addUndo(setNewSpecCode),

  [actionTypes.TRIGGER_REDO]: addUpdateCode(triggerRedo),
  [actionTypes.TRIGGER_UNDO]: addUpdateCode(triggerUndo),

  // filter modifications
  [actionTypes.CREATE_FILTER]: addUndo(addUpdateCode(createFilter)),
  [actionTypes.DELETE_FILTER]: addUndo(addUpdateCode(deleteFilter)),
  [actionTypes.UPDATE_FILTER]: addUndo(addUpdateCode(updateFilter)),

  // gui modifications
  [actionTypes.SET_CODE_MODE]: setCodeMode,
  [actionTypes.SET_EDIT_MODE]: setEditMode,
  [actionTypes.SET_ENCODING_MODE]: addUndo(setEncodingMode),
  [actionTypes.SET_GUI_VIEW]: setGuiView,
  [actionTypes.SET_USER_NAME]: setUserName,
  [actionTypes.TOGGLE_DATA_MODAL]: toggleDataModal,
  [actionTypes.TOGGLE_PROGRAM_MODAL]: toggleProgramModal,
  [actionTypes.TOGGLE_PROGRAMMATIC_VIEW]: setProgrammaticView,

  // template
  [actionTypes.ADD_TO_WIDGET_TEMPLATE]: addUndo(addWidget),
  [actionTypes.DELETE_TEMPLATE]: deleteTemplate,
  [actionTypes.LOAD_EXTERNAL_TEMPLATE]: loadExternalTemplate,
  [actionTypes.MODIFY_VALUE_ON_TEMPLATE]: addUpdateCode(modifyValueOnTemplate),
  [actionTypes.MOVE_WIDGET_IN_TEMPLATE]: addUndo(moveWidget),
  [actionTypes.PREPARE_TEMPLATE]: fillTemplateMapWithDefaults,
  [actionTypes.READ_IN_TEMPLATE]: addUpdateCode(readInTemplate),
  [actionTypes.READ_IN_TEMPLATE_MAP]: addUpdateCode(readInTemplateMap),
  [actionTypes.RECIEVE_TEMPLATE]: recieveTemplates,
  [actionTypes.REMOVE_WIDGET_FROM_TEMPLATE]: addUndo(removeWidget),
  [actionTypes.SAVE_TEMPLATE]: saveCurrentTemplate,
  [actionTypes.SET_ALL_TEMPLATE_VALUES]: setAllTemplateValues,
  [actionTypes.SET_BLANK_TEMPLATE]: addUpdateCode(setBlankTemplate),
  [actionTypes.SET_TEMPLATE_VALUE]: addUndo(setTemplateValue),
  [actionTypes.SET_WIDGET_VALUE]: addUndo(setWidgetValue),

  // views
  [actionTypes.CLONE_VIEW]: addUndo(cloneView),
  [actionTypes.CREATE_NEW_VIEW]: addUndo(createNewView),
  [actionTypes.CHANGE_VIEW_NAME]: addUndo(changeViewName),
  [actionTypes.DELETE_VIEW]: addUndo(deleteView),
  [actionTypes.SWITCH_VIEW]: addUndo(switchView),
};
const NULL_ACTION: ActionResponse<void> = state => state;
const reducers = {
  base: (state: AppState = DEFAULT_STATE, {type, payload}: {type: string; payload: any}): AppState => {
    console.log(type);
    return (actionFuncMap[type] || NULL_ACTION)(state, payload);
  },
  data: (
    state: DataReducerState = {data: []},
    {type, payload}: {type: string; payload: any},
  ): DataReducerState => {
    // not that this reducer is NOT immutable.
    if (type === actionTypes.RECIEVE_DATA) {
      return recieveDataForDataReducer(state, payload);
    }
    return state;
  },
};
export default function setUpState(): any {
  return createStore(combineReducers(reducers), applyMiddleware(thunk));
}
