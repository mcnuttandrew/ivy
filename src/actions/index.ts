import {Dispatch} from 'redux';
import {csvParse} from 'd3-dsv';
import {get} from 'idb-keyval';
import {getDomain, getUniques, executePromisesInSeries} from '../utils';
import {DEFAULT_TEMPLATES} from '../templates';
import {Template} from '../templates/types';

import {Analyzer} from 'type-analyzer';
const {computeColMeta} = Analyzer;

export interface GenericAction {
  (payload?: any): (dispatch: Dispatch) => void;
}
interface GenericActionCreator {
  (type: string): GenericAction;
}

const buildEasyAction: GenericActionCreator = type => payload => (dispatch): any => dispatch({type, payload});

export const addToNextOpenSlot = buildEasyAction('add-to-next-open-slot');
export const addWidget = buildEasyAction('add-widget-to-template');
export const changeMarkType = buildEasyAction('change-mark-type');
export const changeTheme = buildEasyAction('change-theme');
export const clearEncoding = buildEasyAction('clear-encoding');
export const cloneView = buildEasyAction('clone-view');
export const coerceType = buildEasyAction('coerce-type');
export const createFilter = buildEasyAction('create-filter');
export const createNewView = buildEasyAction('create-new-view');
export const deleteFilter = buildEasyAction('delete-filter');
export const deleteTemplate = buildEasyAction('delete-template');
export const deleteView = buildEasyAction('delete-view');
export const loadExternalTemplate = buildEasyAction('load-external-template');
export const modifyValueOnTemplate = buildEasyAction('modify-value-on-template');
export const moveWidget = buildEasyAction('move-widget-in-template');
export const readInTemplate = buildEasyAction('read-in-template');
export const removeWidget = buildEasyAction('remove-widget-from-template');
export const saveCurrentTemplate = buildEasyAction('save-template');
export const setBlankTemplate = buildEasyAction('set-blank-template');
export const setCodeMode = buildEasyAction('set-code-mode');
export const setEditMode = buildEasyAction('set-edit-mode');
export const setEditorFontSize = buildEasyAction('set-editor-font-size');
export const setEncodingMode = buildEasyAction('set-encoding-mode');
export const setEncodingParameter = buildEasyAction('set-encoding-param');
export const setGuiView = buildEasyAction('set-gui-view');
export const setNewSpec = buildEasyAction('set-new-encoding');
export const setNewSpecCode = buildEasyAction('set-new-encoding-code');
export const setProgrammaticView = buildEasyAction('toggle-programmatic-view');
export const setRepeats = buildEasyAction('set-repeats');
export const setSimpleDisplay = buildEasyAction('set-simple-display');
export const setTemplateValue = buildEasyAction('set-template-value');
export const setWidgetValue = buildEasyAction('set-widget-value');
export const swapXAndYChannels = buildEasyAction('swap-x-and-y-channels');
export const switchView = buildEasyAction('switch-view');
export const toggleDataModal = buildEasyAction('toggle-data-modal');
export const toggleProgramModal = buildEasyAction('toggle-program-modal');
export const triggerRedo = buildEasyAction('trigger-redo');
export const triggerUndo = buildEasyAction('trigger-undo');
export const updateFilter = buildEasyAction('update-filter');

export const chainActions = (actions: GenericAction[]) => (dispatch: Dispatch): void => {
  executePromisesInSeries(
    actions.map((action: GenericAction) => {
      return (): Promise<any> => Promise.resolve().then(() => action(dispatch));
    }),
  );
};

export const generateTypeInferences: GenericAction = data => (dispatch): void => {
  dispatch({
    type: 'recieve-type-inferences',
    payload: computeColMeta(data).map((columnMeta: any) => {
      const isDimension = columnMeta.category === 'DIMENSION';
      return {
        ...columnMeta,
        domain: (isDimension ? getUniques : getDomain)(data, columnMeta.key),
      };
    }),
  });
};

type dataRow = {[x: string]: any};
type Reader = (x: string) => dataRow[];
const csvReader = (data: string): dataRow[] => csvParse(data);
const jsonReader = (data: string): dataRow[] => JSON.parse(data);
const getReader = (fileName: string): Reader => {
  if (fileName.includes('.csv')) {
    return csvReader;
  }
  if (fileName.includes('.json')) {
    return jsonReader;
  }
  return (): dataRow[] => [];
};

// when the application is deployed on the internet don't try to get data from a folder that doesn't exisit
const vegaDatasetAdress =
  window.location.origin === 'http://localhost:8080'
    ? (fileName: string): string => `node_modules/vega-datasets/data/${fileName}`
    : (fileName: string): string =>
        `https://raw.githubusercontent.com/vega/vega-datasets/master/data/${fileName}`;

export const loadDataFromPredefinedDatasets: GenericAction = fileName => (dispatch): void => {
  fetch(vegaDatasetAdress(fileName))
    .then(d => d.text())
    .then(d => getReader(fileName)(d))
    .then(d => {
      dispatch({
        type: 'recieve-data',
        payload: d,
      });

      generateTypeInferences(d)(dispatch);
    });
};

export const loadCustomDataset: GenericAction = file => (dispatch): void => {
  const {fileName, data} = file;
  dispatch({
    type: 'change-selected-file',
    payload: fileName,
  });
  getReader(fileName)(data);

  const liveData = getReader(fileName)(data);
  dispatch({
    type: 'recieve-data',
    payload: liveData,
  });
  generateTypeInferences(liveData)(dispatch);
};

export const loadTemplates: GenericAction = () => (dispatch): void => {
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

export const changeSelectedFile: GenericAction = fileName => (dispatch): void => {
  dispatch({
    type: 'change-selected-file',
    payload: fileName,
  });
  loadDataFromPredefinedDatasets(fileName)(dispatch);
};
