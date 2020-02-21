import {createStore, combineReducers, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import * as actionTypes from '../actions/action-types';

import {AppState, ActionResponse, DataReducerState} from '../types';
import GALLERY from '../templates/gallery';
import {JSON_OUTPUT} from '../constants/index';

import {pushToUndoStack, triggerRedo, triggerUndo} from './undo-actions';

import {addToNextOpenSlot} from './apt-actions';

// import {createFilter, updateFilter, deleteFilter} from './filter-actions';
import {
  changeSelectedFile,
  coerceType,
  recieveData,
  recieveDataForDataReducer,
  recieveTypeInferences,
  recieveLanguages,
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
  setNewSpecCode,
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

export const DEFAULT_STATE: AppState = {
  // meta-data
  currentlySelectedFile: 'cars.json',
  columns: [],

  // spec configs
  editorError: null,
  editMode: false,

  languages: {},

  // GUI
  currentTemplateInstance: GALLERY,
  // TODO COMBINE MODAL VALUES INTO A SINGLE KEY
  dataModalOpen: false,
  encodingMode: GALLERY.templateName,
  showProgrammaticMode: false,
  showGUIView: true,
  codeMode: JSON_OUTPUT,
  programModalOpen: false,
  userName: '',

  // undo redo
  undoStack: [],
  redoStack: [],

  // view stuff
  views: ['view1'],
  viewCatalog: {},
  currentView: 'view1',

  // template stuff

  templates: [],
  templateMap: {},
};

// second order effects
const wrap = (func: ActionResponse<any>, wrapper: any): ActionResponse<any> => (state, payload): AppState =>
  wrapper(state, func(state, payload));
const addUndo = (func: ActionResponse<any>): ActionResponse<any> => wrap(func, pushToUndoStack);

const actionFuncMap: {[val: string]: ActionResponse<any>} = {
  // data modifications
  [actionTypes.CHANGE_SELECTED_FILE]: changeSelectedFile,
  [actionTypes.RECIEVE_DATA]: recieveData,
  [actionTypes.RECIEVE_TYPE_INFERENCES]: recieveTypeInferences,

  // encoding modifications
  [actionTypes.ADD_TO_NEXT_OPEN_SLOT]: addUndo(addToNextOpenSlot),
  [actionTypes.COERCE_TYPE]: addUndo(coerceType),
  [actionTypes.SET_NEW_ENCODING_CODE]: addUndo(setNewSpecCode),

  [actionTypes.TRIGGER_REDO]: triggerRedo,
  [actionTypes.TRIGGER_UNDO]: triggerUndo,

  // filter modifications (HIDDEN UNTIL THE WRNAGLING STORY COMES)
  // [actionTypes.CREATE_FILTER]: addUndo(createFilter),
  // [actionTypes.DELETE_FILTER]: addUndo(deleteFilter),
  // [actionTypes.UPDATE_FILTER]: addUndo(updateFilter),

  // gui modifications
  [actionTypes.SET_CODE_MODE]: setCodeMode,
  [actionTypes.SET_EDIT_MODE]: setEditMode,
  [actionTypes.SET_ENCODING_MODE]: addUndo(setEncodingMode),
  [actionTypes.SET_GUI_VIEW]: setGuiView,
  [actionTypes.SET_USER_NAME]: setUserName,
  [actionTypes.TOGGLE_DATA_MODAL]: toggleDataModal,
  [actionTypes.TOGGLE_PROGRAM_MODAL]: toggleProgramModal,
  [actionTypes.TOGGLE_PROGRAMMATIC_VIEW]: setProgrammaticView,

  [actionTypes.RECIEVE_LANGUAGES]: recieveLanguages,

  // template
  [actionTypes.ADD_TO_WIDGET_TEMPLATE]: addUndo(addWidget),
  [actionTypes.DELETE_TEMPLATE]: deleteTemplate,
  [actionTypes.LOAD_EXTERNAL_TEMPLATE]: loadExternalTemplate,
  [actionTypes.MODIFY_VALUE_ON_TEMPLATE]: modifyValueOnTemplate,
  [actionTypes.MOVE_WIDGET_IN_TEMPLATE]: addUndo(moveWidget),
  [actionTypes.FILL_TEMPLATEMAP_WITH_DEFAULTS]: fillTemplateMapWithDefaults,
  [actionTypes.READ_IN_TEMPLATE]: readInTemplate,
  [actionTypes.READ_IN_TEMPLATE_MAP]: readInTemplateMap,
  [actionTypes.RECIEVE_TEMPLATE]: recieveTemplates,
  [actionTypes.REMOVE_WIDGET_FROM_TEMPLATE]: addUndo(removeWidget),
  [actionTypes.SAVE_TEMPLATE]: saveCurrentTemplate,
  [actionTypes.SET_ALL_TEMPLATE_VALUES]: setAllTemplateValues,
  [actionTypes.SET_BLANK_TEMPLATE]: setBlankTemplate,
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
