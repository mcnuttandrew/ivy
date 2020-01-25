import {Dispatch} from 'redux';
import {csvParse} from 'd3-dsv';
import {get} from 'idb-keyval';
import {getDomain, getUniques, executePromisesInSeries} from '../utils';
import {DEFAULT_TEMPLATES} from '../templates';
import {Template, TemplateWidget, WidgetSubType} from '../templates/types';
import {ColumnHeader, DataType} from '../types';

import {CHANGE_SELECTED_FILE, RECIEVE_DATA, RECIEVE_TYPE_INFERENCES} from './action-types';

import {Action} from 'redux';
import {ThunkAction} from 'redux-thunk';
import {AppState} from '../reducers/default-state';
export type AppThunk<T> = ThunkAction<void, AppState, null, Action<T>>;

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

// TODO this is the correc typing, fix it
// export interface GenericAction<T> {
//   (payload: T): AppThunk<T>;
// }

export interface GenericAction<T> {
  (payload: T): (dispatch: Dispatch, arg2?: any, arg3?: any) => void;
}

function createAction<T>(type: string): GenericAction<T> {
  return payload => (dispatch): any => dispatch({type, payload});
}

export const addToNextOpenSlot = createAction<ColumnHeader>('add-to-next-open-slot');
export const addWidget = createAction<TemplateWidget<WidgetSubType>>('add-widget-to-template');
export const changeMarkType = createAction<string>('change-mark-type');
export const changeTheme = createAction<string>('change-theme');
export const clearEncoding = createAction<void>('clear-encoding');
export const cloneView = createAction<void>('clone-view');

export const coerceType = createAction<CoerceTypePayload>('coerce-type');
export const createFilter = createAction<ColumnHeader>('create-filter');
export const createNewView = createAction<void>('create-new-view');
export const deleteFilter = createAction<number>('delete-filter');
export const deleteTemplate = createAction<string>('delete-template');
export const deleteView = createAction<string>('delete-view');
export const loadExternalTemplate = createAction<Template>('load-external-template');
export const modifyValueOnTemplate = createAction<ModifyValueOnTemplatePayload>('modify-value-on-template');
export const moveWidget = createAction<MoveWidgetPayload>('move-widget-in-template');
export const readInTemplate = createAction<HandleCodePayload>('read-in-template');
export const readInTemplateMap = createAction<HandleCodePayload>('read-in-template-map');
export const removeWidget = createAction<number>('remove-widget-from-template');
export const saveCurrentTemplate = createAction<void>('save-template');
export const setBlankTemplate = createAction<boolean>('set-blank-template');
export const setCodeMode = createAction<string>('set-code-mode');
export const setEditMode = createAction<boolean>('set-edit-mode');
export const setEditorFontSize = createAction<number>('set-editor-font-size');
export const setEncodingMode = createAction<string>('set-encoding-mode');
export const setEncodingParameter = createAction<SetTemplateValuePayload>('set-encoding-param');
export const setGuiView = createAction<boolean>('set-gui-view');
export const setNewSpec = createAction<any>('set-new-encoding');
export const setNewSpecCode = createAction<HandleCodePayload>('set-new-encoding-code');
export const setProgrammaticView = createAction<void>('toggle-programmatic-view');
export const setRepeats = createAction<SetRepeatsPayload>('set-repeats');
export const setSimpleDisplay = createAction<boolean>('set-simple-display');
export const setTemplateValue = createAction<SetTemplateValuePayload>('set-template-value');
export const setWidgetValue = createAction<SetWidgetValuePayload>('set-widget-value');
export const swapXAndYChannels = createAction<void>('swap-x-and-y-channels');
export const switchView = createAction<string>('switch-view');
export const toggleDataModal = createAction<void>('toggle-data-modal');
export const toggleProgramModal = createAction<void>('toggle-program-modal');
export const triggerRedo = createAction<void>('trigger-redo');
export const triggerUndo = createAction<void>('trigger-undo');
export const updateFilter = createAction<UpdateFilterPayload>('update-filter');

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
      dispatch({type: 'recieve-templates', payload});
    });
};

export const changeSelectedFile: GenericAction<string> = fileName => (dispatch, arg2, arg3): void => {
  dispatch({
    type: 'change-selected-file',
    payload: fileName,
  });
  loadDataFromPredefinedDatasets(fileName)(dispatch, arg2, arg3);
};
