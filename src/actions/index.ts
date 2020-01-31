import {Dispatch} from 'redux';
import {csvParse} from 'd3-dsv';
import {get} from 'idb-keyval';
import {getDomain, getUniques, executePromisesInSeries} from '../utils';
import {DEFAULT_TEMPLATES} from '../templates';
import {Template, TemplateWidget, WidgetSubType} from '../templates/types';
import {ColumnHeader, DataType} from '../types';

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
} from './action-types';

import {Action} from 'redux';
import {ThunkAction} from 'redux-thunk';
import {AppState} from '../reducers/default-state';

import {Analyzer} from 'type-analyzer';
const {computeColMeta} = Analyzer;
export type CoerceTypePayload = {field: string; type: DataType};
export type ModifyValueOnTemplatePayload = {key: string; value: any; editorError?: any};
export type MoveWidgetPayload = {fromIdx: number; toIdx: number};
export type HandleCodePayload = {code: string; inError: boolean};
export type SetTemplateValuePayload = {
  containingShelf?: string;
  text: string | string[];
  field: string;
  isMeta?: boolean;
};
export type SetRepeatsPayload = {repeats: string[]; target: string};
export type SetWidgetValuePayload = {idx: number; value: any; key: string};
export type UpdateFilterPayload = {newFilterValue: (number | string)[]; idx: number};
export interface TypeInference {
  key: string;
  label: string;
  type: string;
  category: string;
  format: string;
  domain: [number, number] | string[];
}
export type DataRow = {[x: string]: any};
export type LoadDataPayload = {fileName: string; data: string};
export interface Filter {
  filter: {
    field: string;
    oneOf?: string[];
    range?: number[];
  };
}
export type AppThunk<T> = ThunkAction<void, AppState, null, Action<T>>;
// TODO this is the correc typing, fix it
// export interface GenericAction<T> {
//   (payload: T): AppThunk<T>;
// }

export interface GenericAction<T> {
  (payload: T): (dispatch: Dispatch, arg2?: any, arg3?: any) => void;
}

function createAction<T>(type: any): GenericAction<T> {
  return payload => (dispatch): any => dispatch({type, payload});
}

export const addToNextOpenSlot = createAction<ColumnHeader>(ADD_TO_NEXT_OPEN_SLOT);
export const addWidget = createAction<TemplateWidget<WidgetSubType>>(ADD_TO_WIDGET_TEMPLATE);
export const changeMarkType = createAction<string>(CHANGE_MARK_TYPE);
export const changeTheme = createAction<string>(CHANGE_THEME);
export const clearEncoding = createAction<void>(CLEAR_ENCODING);
export const cloneView = createAction<void>(CLONE_VIEW);
export const coerceType = createAction<CoerceTypePayload>(COERCE_TYPE);
export const createFilter = createAction<ColumnHeader>(CREATE_FILTER);
export const createNewView = createAction<void>(CREATE_NEW_VIEW);
export const deleteFilter = createAction<number>(DELETE_FILTER);
export const deleteTemplate = createAction<string>(DELETE_TEMPLATE);
export const deleteView = createAction<string>(DELETE_VIEW);
export const loadExternalTemplate = createAction<Template>(LOAD_EXTERNAL_TEMPLATE);
export const modifyValueOnTemplate = createAction<ModifyValueOnTemplatePayload>(MODIFY_VALUE_ON_TEMPLATE);
export const moveWidget = createAction<MoveWidgetPayload>(MOVE_WIDGET_IN_TEMPLATE);
export const readInTemplate = createAction<HandleCodePayload>(READ_IN_TEMPLATE);
export const readInTemplateMap = createAction<HandleCodePayload>(READ_IN_TEMPLATE_MAP);
export const removeWidget = createAction<number>(REMOVE_WIDGET_FROM_TEMPLATE);
export const saveCurrentTemplate = createAction<void>(SAVE_TEMPLATE);
export const setAllTemplateValues = createAction<boolean>(SET_ALL_TEMPLATE_VALUES);
export const setBlankTemplate = createAction<boolean>(SET_BLANK_TEMPLATE);
export const setCodeMode = createAction<string>(SET_CODE_MODE);
export const setEditMode = createAction<boolean>(SET_EDIT_MODE);
export const setEditorFontSize = createAction<number>(SET_EDITOR_FONT_SIZE);
export const setEncodingMode = createAction<string>(SET_ENCODING_MODE);
export const setEncodingParameter = createAction<SetTemplateValuePayload>(SET_ENCODING_PARAM);
export const setGuiView = createAction<boolean>(SET_GUI_VIEW);
export const setNewSpec = createAction<any>(SET_NEW_ENCODING);
export const setNewSpecCode = createAction<HandleCodePayload>(SET_NEW_ENCODING_CODE);
export const setProgrammaticView = createAction<void>(TOGGLE_PROGRAMMATIC_VIEW);
export const setRepeats = createAction<SetRepeatsPayload>(SET_REPEATS);
export const setTemplateValue = createAction<SetTemplateValuePayload>(SET_TEMPLATE_VALUE);
export const setWidgetValue = createAction<SetWidgetValuePayload>(SET_WIDGET_VALUE);
export const swapXAndYChannels = createAction<void>(SWAP_X_AND_Y_CHANNELS);
export const switchView = createAction<string>(SWITCH_VIEW);
export const toggleDataModal = createAction<void>(TOGGLE_DATA_MODAL);
export const toggleProgramModal = createAction<void>(TOGGLE_PROGRAM_MODAL);
export const triggerRedo = createAction<void>(TRIGGER_REDO);
export const triggerUndo = createAction<void>(TRIGGER_UNDO);
export const updateFilter = createAction<UpdateFilterPayload>(UPDATE_FILTER);

export const chainActions = (actions: GenericAction<any>[]) => (dispatch: Dispatch): void => {
  executePromisesInSeries(
    actions.map((action: GenericAction<any>) => {
      return (): Promise<any> => Promise.resolve().then(() => action(dispatch));
    }),
  );
};

export const generateTypeInferences = (data: DataRow[]): AppThunk<TypeInference[]> => (
  dispatch: Dispatch,
): void => {
  dispatch({
    type: RECIEVE_TYPE_INFERENCES,
    payload: computeColMeta(data).map((columnMeta: any) => {
      const isDimension = columnMeta.category === 'DIMENSION';
      return {
        ...columnMeta,
        domain: (isDimension ? getUniques : getDomain)(data, columnMeta.key),
      };
    }),
  });
};

type Reader = (x: string) => DataRow[];
const csvReader = (data: string): DataRow[] => csvParse(data);
const jsonReader = (data: string): DataRow[] => JSON.parse(data);
const getReader = (fileName: string): Reader => {
  if (fileName.includes('.csv')) {
    return csvReader;
  }
  if (fileName.includes('.json')) {
    return jsonReader;
  }
  return (): DataRow[] => [];
};

// when the application is deployed on the internet don't try to get data from a folder that doesn't exisit
const vegaDatasetAdress =
  window.location.origin === 'http://localhost:8080'
    ? (fileName: string): string => `node_modules/vega-datasets/data/${fileName}`
    : (fileName: string): string =>
        `https://raw.githubusercontent.com/vega/vega-datasets/master/data/${fileName}`;

export const loadDataFromPredefinedDatasets: GenericAction<string> = fileName => (
  dispatch,
  arg2,
  arg3,
): void => {
  fetch(vegaDatasetAdress(fileName))
    .then(d => d.text())
    .then(d => getReader(fileName)(d))
    .then(d => {
      dispatch({
        type: RECIEVE_DATA,
        payload: d,
      });

      generateTypeInferences(d)(dispatch, arg2, arg3);
    });
};

export const loadCustomDataset: GenericAction<LoadDataPayload> = file => (dispatch, arg2, arg3): void => {
  const {fileName, data} = file;
  dispatch({
    type: CHANGE_SELECTED_FILE,
    payload: fileName,
  });
  getReader(fileName)(data);

  const liveData = getReader(fileName)(data);
  dispatch({
    type: RECIEVE_DATA,
    payload: liveData,
  });
  generateTypeInferences(liveData)(dispatch, arg2, arg3);
};

export const loadTemplates: GenericAction<void> = () => (dispatch): void => {
  get('templates')
    .then((templates: string[]) => {
      return Promise.all((templates || []).map((templateKey: string) => get(templateKey)));
    })
    .then((templates: Template[]) => {
      const seen: any = {};
      const payload = [...DEFAULT_TEMPLATES, ...Object.values(templates || {})].filter((d: any) => {
        if (!d || seen[d.templateName]) {
          return false;
        }
        seen[d.templateName] = true;
        return true;
      });
      dispatch({type: RECIEVE_TEMPLATE, payload});
    });
};

export const changeSelectedFile: GenericAction<string> = fileName => (dispatch, arg2, arg3): void => {
  dispatch({
    type: CHANGE_SELECTED_FILE,
    payload: fileName,
  });
  loadDataFromPredefinedDatasets(fileName)(dispatch, arg2, arg3);
};
