import {Dispatch} from 'redux';
import {csvParse, tsvParse} from 'd3-dsv';
import {generateDomain} from '../utils';
import {
  AppState,
  ColumnHeader,
  DataType,
  GenWidget,
  LanguageExtension,
  Template,
  TemplateMap,
  ViewsToMaterialize,
  WidgetType,
} from '../types';
import * as actionTypes from '../actions/action-types';

import {Action} from 'redux';
import {ThunkAction} from 'redux-thunk';

import {Analyzer} from 'type-analyzer';
const {computeColMeta} = Analyzer;
import {summary} from 'datalib';
export type CoerceTypePayload = {field: string; type: DataType};
export type ModifyValueOnTemplatePayload = {key: string; value: any; editorError?: any};
export type MoveWidgetPayload = {fromIdx: number; toIdx: number};
export type HandleCodePayload = {code: string; inError: boolean};
export type SetTemplateValuePayload = {
  containingShelf?: string;
  text: string | string[];
  field: string;
  type?: WidgetType;
};

export type SetWidgetValuePayload = {idx: number; value: any; key: string};
export type UpdateFilterPayload = {newFilterValue: (number | string)[]; idx: number};
export interface TypeInference {
  key: string;
  label: string;
  type: string;
  category: string;
  format: string;
  domain: [number, number] | string[];
  summary: {[x: string]: number};
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
export const addWidget = createAction<GenWidget>(actionTypes.ADD_TO_WIDGET_TEMPLATE);
export const changeViewName = createAction<{idx: number; value: string}>(actionTypes.CHANGE_VIEW_NAME);
export const cloneView = createAction<void>(actionTypes.CLONE_VIEW);
export const coerceType = createAction<CoerceTypePayload>(actionTypes.COERCE_TYPE);
export const createFilter = createAction<ColumnHeader>(actionTypes.CREATE_FILTER);
export const createNewView = createAction<void>(actionTypes.CREATE_NEW_VIEW);
export const deleteFilter = createAction<number>(actionTypes.DELETE_FILTER);
export const deleteTemplate = createAction<string>(actionTypes.DELETE_TEMPLATE);
export const deleteView = createAction<string>(actionTypes.DELETE_VIEW);
export const duplicateWidget = createAction<number>(actionTypes.DUPLICATE_WIDGET);
export const modifyValueOnTemplate = createAction<ModifyValueOnTemplatePayload>(
  actionTypes.MODIFY_VALUE_ON_TEMPLATE,
);
export const moveWidget = createAction<MoveWidgetPayload>(actionTypes.MOVE_WIDGET_IN_TEMPLATE);
export const fillTemplateMapWithDefaults = createAction<void>(actionTypes.FILL_TEMPLATEMAP_WITH_DEFAULTS);
export const readInTemplate = createAction<HandleCodePayload>(actionTypes.READ_IN_TEMPLATE);
export const readInTemplateMap = createAction<HandleCodePayload>(actionTypes.READ_IN_TEMPLATE_MAP);
export const removeWidget = createAction<number>(actionTypes.REMOVE_WIDGET_FROM_TEMPLATE);
export const saveCurrentTemplate = createAction<void>(actionTypes.SAVE_TEMPLATE);
export const setAllTemplateValues = createAction<boolean>(actionTypes.SET_ALL_TEMPLATE_VALUES);
export const setBlankTemplate = createAction<{fork: string | null; language: string}>(
  actionTypes.SET_BLANK_TEMPLATE,
);
export const setCodeMode = createAction<string>(actionTypes.SET_CODE_MODE);
export const setEditMode = createAction<boolean>(actionTypes.SET_EDIT_MODE);
export const setEncodingMode = createAction<string>(actionTypes.SET_ENCODING_MODE);
export const setGuiView = createAction<boolean>(actionTypes.SET_GUI_VIEW);
export const setSpecCode = createAction<HandleCodePayload>(actionTypes.SET_SPEC_CODE);
export const setProgrammaticView = createAction<boolean>(actionTypes.TOGGLE_PROGRAMMATIC_VIEW);
export const setUserName = createAction<string>(actionTypes.SET_USER_NAME);
export const setTemplateValue = createAction<SetTemplateValuePayload>(actionTypes.SET_TEMPLATE_VALUE);
export const setTemplate = createAction<Template>(actionTypes.SET_TEMPLATE);
export const setWidgetValue = createAction<SetWidgetValuePayload>(actionTypes.SET_WIDGET_VALUE);
export const switchView = createAction<string>(actionTypes.SWITCH_VIEW);
export const setModalState = createAction<string | null>(actionTypes.SET_MODAL_STATE);
export const triggerRedo = createAction<void>(actionTypes.TRIGGER_REDO);
export const triggerUndo = createAction<void>(actionTypes.TRIGGER_UNDO);
export const updateFilter = createAction<UpdateFilterPayload>(actionTypes.UPDATE_FILTER);
export const recieveLanguages = createAction<{[x: string]: LanguageExtension}>(actionTypes.RECIEVE_LANGUAGES);
export const recieveTemplates = createAction<Template[]>(actionTypes.RECIEVE_TEMPLATE);

export const setMaterialization = createAction<ViewsToMaterialize>(actionTypes.SET_MATERIALIZATION);

export const generateTypeInferences = (data: DataRow[]): AppThunk<TypeInference[]> => (
  dispatch: Dispatch,
): void => {
  const summaries = summary(data).reduce((acc: any, d: any) => {
    acc[d.field] = {...d};
    return acc;
  }, {} as {[x: string]: any});
  dispatch({
    type: actionTypes.RECIEVE_TYPE_INFERENCES,
    payload: computeColMeta(data).map((col: any) => ({
      ...col,
      summary: {
        ...summaries[col.key],
        coercionTypes: ['MEASURE', 'DIMENSION', 'TIME'].reduce((acc, key) => {
          acc[key] = generateDomain(data, col.key, key);
          return acc;
        }, {} as any),
      },
      domain: generateDomain(data, col.key, col.category),
    })),
  });
};

type Reader = (x: string) => DataRow[];
const csvReader: Reader = data => csvParse(data);
const jsonReader: Reader = data => JSON.parse(data);
const tsvReader: Reader = data => tsvParse(data);
const getReader = (fileName: string): Reader => {
  if (fileName.includes('.csv')) {
    return csvReader;
  }
  if (fileName.includes('.json')) {
    return jsonReader;
  }
  if (fileName.includes('.tsv')) {
    return tsvReader;
  }
  return (): DataRow[] => [];
};

// when the application is deployed on the internet don't try to get data from a folder that doesn't exisit
const vegaDatasetAdress =
  window.location.origin === 'http://localhost:8080'
    ? (fileName: string): string => `node_modules/vega-datasets/data/${fileName}`
    : (fileName: string): string =>
        `https://raw.githubusercontent.com/vega/vega-datasets/master/data/${fileName}`;

export const loadDataFromPredefinedDatasets: GenericAction<{
  filename: string;
  dumpTemplateMap: boolean;
}> = ({filename, dumpTemplateMap}) => (dispatch, arg2, arg3): void => {
  // infra for tests
  // eslint-disable-next-line no-undef
  if (process.env.NODE_ENV === 'test') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const data = require(`vega-datasets/data/${filename}`);
    dispatch({type: actionTypes.RECIEVE_DATA, payload: {data, dumpTemplateMap}});
    generateTypeInferences(data)(dispatch, arg2, arg3);
    return;
  }
  // regular path
  fetch(vegaDatasetAdress(filename))
    .then(d => d.text())
    .then(d => getReader(filename)(d))
    .then(d => {
      dispatch({type: actionTypes.RECIEVE_DATA, payload: {data: d, dumpTemplateMap}});
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
    payload: {data: liveData, dumpTemplateMap: true},
  });
  generateTypeInferences(liveData)(dispatch, arg2, arg3);
};

export const changeSelectedFile: GenericAction<{filename: string; dumpTemplateMap: boolean}> = payload => (
  dispatch,
  arg2,
  arg3,
): void => {
  dispatch({
    type: actionTypes.CHANGE_SELECTED_FILE,
    payload: payload.filename,
  });
  loadDataFromPredefinedDatasets(payload)(dispatch, arg2, arg3);
};

export interface ActionUser {
  addToNextOpenSlot: GenericAction<ColumnHeader>;
  addWidget: GenericAction<GenWidget>;
  changeSelectedFile: GenericAction<{filename: string; dumpTemplateMap: boolean}>;
  changeViewName: GenericAction<{idx: number; value: string}>;
  cloneView: GenericAction<void>;
  coerceType: GenericAction<CoerceTypePayload>;
  createFilter: GenericAction<ColumnHeader>;
  createNewView: GenericAction<void>;
  deleteFilter: GenericAction<number>;
  deleteTemplate: GenericAction<{templateAuthor: string; templateName: string}>;
  deleteView: GenericAction<string>;
  duplicateWidget: GenericAction<number>;
  fillTemplateMapWithDefaults: GenericAction<void>;
  loadCustomDataset: GenericAction<LoadDataPayload>;
  loadDataFromPredefinedDatasets: GenericAction<{
    filename: string;
    dumpTemplateMap: boolean;
  }>;
  modifyValueOnTemplate: GenericAction<ModifyValueOnTemplatePayload>;
  moveWidget: GenericAction<MoveWidgetPayload>;
  readInTemplate: GenericAction<HandleCodePayload>;
  readInTemplateMap: GenericAction<HandleCodePayload>;
  recieveLanguages: GenericAction<{[x: string]: LanguageExtension}>;
  recieveTemplates: GenericAction<Template[]>;
  removeWidget: GenericAction<number>;
  saveCurrentTemplate: GenericAction<void>;
  setAllTemplateValues: GenericAction<TemplateMap>;
  setBlankTemplate: GenericAction<{fork: string | null; language: string}>;
  setCodeMode: GenericAction<string>;
  setEditMode: GenericAction<boolean>;
  setEncodingMode: GenericAction<string>;
  setGuiView: GenericAction<boolean>;
  setMaterialization: GenericAction<ViewsToMaterialize>;
  setModalState: GenericAction<string | null>;
  setSpecCode: GenericAction<HandleCodePayload>;
  setProgrammaticView: GenericAction<boolean>;
  setTemplateValue: GenericAction<SetTemplateValuePayload>;
  setTemplate: GenericAction<Template>;
  setUserName: GenericAction<string>;
  setWidgetValue: GenericAction<SetWidgetValuePayload>;
  switchView: GenericAction<string>;
  triggerRedo: GenericAction<void>;
  triggerUndo: GenericAction<void>;
  updateFilter: GenericAction<UpdateFilterPayload>;
}
