import {Dispatch} from 'redux';
import {csvParse} from 'd3-dsv';
import {get} from 'idb-keyval';
import {getDomain, getUniques, executePromisesInSeries} from '../utils';
import {DEFAULT_TEMPLATES} from '../templates';
import {Template, TemplateWidget, WidgetSubType, WidgetType} from '../templates/types';
import {ColumnHeader, DataType} from '../types';
import * as actionTypes from '../actions/action-types';

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
  type?: WidgetType;
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

export const addToNextOpenSlot = createAction<ColumnHeader>(actionTypes.ADD_TO_NEXT_OPEN_SLOT);
export const addWidget = createAction<TemplateWidget<WidgetSubType>>(actionTypes.ADD_TO_WIDGET_TEMPLATE);
export const changeMarkType = createAction<string>(actionTypes.CHANGE_MARK_TYPE);
export const changeTheme = createAction<string>(actionTypes.CHANGE_THEME);
export const changeViewName = createAction<{idx: number; value: string}>(actionTypes.CHANGE_VIEW_NAME);
export const clearEncoding = createAction<void>(actionTypes.CLEAR_ENCODING);
export const cloneView = createAction<void>(actionTypes.CLONE_VIEW);
export const coerceType = createAction<CoerceTypePayload>(actionTypes.COERCE_TYPE);
export const createFilter = createAction<ColumnHeader>(actionTypes.CREATE_FILTER);
export const createNewView = createAction<void>(actionTypes.CREATE_NEW_VIEW);
export const deleteFilter = createAction<number>(actionTypes.DELETE_FILTER);
export const deleteTemplate = createAction<string>(actionTypes.DELETE_TEMPLATE);
export const deleteView = createAction<string>(actionTypes.DELETE_VIEW);
export const loadExternalTemplate = createAction<Template>(actionTypes.LOAD_EXTERNAL_TEMPLATE);
export const modifyValueOnTemplate = createAction<ModifyValueOnTemplatePayload>(
  actionTypes.MODIFY_VALUE_ON_TEMPLATE,
);
export const moveWidget = createAction<MoveWidgetPayload>(actionTypes.MOVE_WIDGET_IN_TEMPLATE);
export const prepareTemplate = createAction<void>(actionTypes.PREPARE_TEMPLATE);
export const readInTemplate = createAction<HandleCodePayload>(actionTypes.READ_IN_TEMPLATE);
export const readInTemplateMap = createAction<HandleCodePayload>(actionTypes.READ_IN_TEMPLATE_MAP);
export const removeWidget = createAction<number>(actionTypes.REMOVE_WIDGET_FROM_TEMPLATE);
export const saveCurrentTemplate = createAction<void>(actionTypes.SAVE_TEMPLATE);
export const setAllTemplateValues = createAction<boolean>(actionTypes.SET_ALL_TEMPLATE_VALUES);
export const setBlankTemplate = createAction<boolean>(actionTypes.SET_BLANK_TEMPLATE);
export const setCodeMode = createAction<string>(actionTypes.SET_CODE_MODE);
export const setEditMode = createAction<boolean>(actionTypes.SET_EDIT_MODE);
export const setEncodingMode = createAction<string>(actionTypes.SET_ENCODING_MODE);
export const setEncodingParameter = createAction<SetTemplateValuePayload>(actionTypes.SET_ENCODING_PARAM);
export const setGuiView = createAction<boolean>(actionTypes.SET_GUI_VIEW);
export const setNewSpec = createAction<any>(actionTypes.SET_NEW_ENCODING);
export const setNewSpecCode = createAction<HandleCodePayload>(actionTypes.SET_NEW_ENCODING_CODE);
export const setProgrammaticView = createAction<boolean>(actionTypes.TOGGLE_PROGRAMMATIC_VIEW);
export const setRepeats = createAction<SetRepeatsPayload>(actionTypes.SET_REPEATS);
export const setUserName = createAction<SetRepeatsPayload>(actionTypes.SET_USER_NAME);
export const setTemplateValue = createAction<SetTemplateValuePayload>(actionTypes.SET_TEMPLATE_VALUE);
export const setWidgetValue = createAction<SetWidgetValuePayload>(actionTypes.SET_WIDGET_VALUE);
export const swapXAndYChannels = createAction<void>(actionTypes.SWAP_X_AND_Y_CHANNELS);
export const switchView = createAction<string>(actionTypes.SWITCH_VIEW);
export const toggleDataModal = createAction<void>(actionTypes.TOGGLE_DATA_MODAL);
export const toggleProgramModal = createAction<void>(actionTypes.TOGGLE_PROGRAM_MODAL);
export const triggerRedo = createAction<void>(actionTypes.TRIGGER_REDO);
export const triggerUndo = createAction<void>(actionTypes.TRIGGER_UNDO);
export const updateFilter = createAction<UpdateFilterPayload>(actionTypes.UPDATE_FILTER);

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
    type: actionTypes.RECIEVE_TYPE_INFERENCES,
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
        type: actionTypes.RECIEVE_DATA,
        payload: d,
      });

      generateTypeInferences(d)(dispatch, arg2, arg3);
    });
};

export const loadCustomDataset: GenericAction<LoadDataPayload> = file => (dispatch, arg2, arg3): void => {
  const {fileName, data} = file;
  dispatch({
    type: actionTypes.CHANGE_SELECTED_FILE,
    payload: fileName,
  });
  getReader(fileName)(data);

  const liveData = getReader(fileName)(data);
  dispatch({
    type: actionTypes.RECIEVE_DATA,
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
      dispatch({type: actionTypes.RECIEVE_TEMPLATE, payload});
    });
};

export const changeSelectedFile: GenericAction<string> = fileName => (dispatch, arg2, arg3): void => {
  dispatch({
    type: actionTypes.CHANGE_SELECTED_FILE,
    payload: fileName,
  });
  loadDataFromPredefinedDatasets(fileName)(dispatch, arg2, arg3);
};
