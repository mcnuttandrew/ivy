import {Dispatch} from 'redux';
import {csvParse} from 'd3-dsv';
import {get} from 'idb-keyval';
import {getDomain, getUniques, executePromisesInSeries} from '../utils';
import {DEFAULT_TEMPLATES} from '../templates/types';

import {Analyzer} from 'type-analyzer';
const {computeColMeta} = Analyzer;

export interface GenericAction {
  (payload?: any): (dispatch: Dispatch) => void;
}
interface GenericActionCreator {
  (type: string): GenericAction;
}

const buildEasyAction: GenericActionCreator = type => payload => dispatch =>
  dispatch({type, payload});
// TODO: organize these in literally any way
export const setEncodingParameter = buildEasyAction('set-encoding-param');
export const swapXAndYChannels = buildEasyAction('swap-x-and-y-channels');
export const setRepeats = buildEasyAction('set-repeats');
export const clearEncoding = buildEasyAction('clear-encoding');
export const changeMarkType = buildEasyAction('change-mark-type');
export const setNewSpec = buildEasyAction('set-new-encoding');
export const setNewSpecCode = buildEasyAction('set-new-encoding-code');
export const addToNextOpenSlot = buildEasyAction('add-to-next-open-slot');
export const setProgrammaticView = buildEasyAction(
  'toggle-programmatic-view',
);
export const changeTheme = buildEasyAction('change-theme');
export const createFilter = buildEasyAction('create-filter');
export const updateFilter = buildEasyAction('update-filter');
export const deleteFilter = buildEasyAction('delete-filter');
export const coerceType = buildEasyAction('coerce-type');
export const setEncodingMode = buildEasyAction('set-encoding-mode');
export const toggleTemplateBuilder = buildEasyAction('toggle-template-builder');
export const createTemplate = buildEasyAction('create-template');
export const startTemplateEdit = buildEasyAction('start-edit-template');
export const deleteTemplate = buildEasyAction('delete-template');
export const setTemplateValue = buildEasyAction('set-template-value');

export const createNewView = buildEasyAction('create-new-view');
export const deleteView = buildEasyAction('delete-view');
export const switchView = buildEasyAction('switch-view');
export const cloneView = buildEasyAction('clone-view');

export const clearUnprounceWarning = buildEasyAction('clear-unprouncable');

export const triggerRedo = buildEasyAction('trigger-redo');
export const triggerUndo = buildEasyAction('trigger-undo');

export const toggleDataModal = buildEasyAction('toggle-data-modal');

export const chainActions = (actions: GenericAction[]) => (
  dispatch: Dispatch,
) => {
  executePromisesInSeries(
    actions.map((action: GenericAction) => {
      return () => Promise.resolve().then(() => action(dispatch));
    }),
  );
};

export const generateTypeInferences: GenericAction = data => dispatch => {
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

const csvReader = (data: string) => csvParse(data);
const jsonReader = (data: string) => JSON.parse(data);
const getReader = (fileName: string) => {
  if (fileName.includes('.csv')) {
    return csvReader;
  }
  if (fileName.includes('.json')) {
    return jsonReader;
  }
  return (): any[] => [];
};

// when the application is deployed on the internet don't try to get data from a folder that doesn't exisit
const vegaDatasetAdress =
  window.location.origin === 'http://localhost:8080'
    ? (fileName: string) => `node_modules/vega-datasets/data/${fileName}`
    : (fileName: string) =>
        `https://raw.githubusercontent.com/vega/vega-datasets/master/data/${fileName}`;

export const loadDataFromPredefinedDatasets: GenericAction = fileName => dispatch => {
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

export const loadCustomDataset: GenericAction = file => dispatch => {
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

export const loadTemplates: GenericAction = () => dispatch => {
  get('templates')
    .then((templates: string[]) => {
      return Promise.all(
        (templates || []).map((templateKey: string) => get(templateKey)),
      );
    })
    .then((templates: any) => {
      const seen: any = {};
      const payload = [
        ...DEFAULT_TEMPLATES,
        ...Object.values(templates || {}),
      ].filter((d: any) => {
        if (!d || seen[d.templateName]) {
          return false;
        }
        seen[d.templateName] = true;
        return true;
      });
      dispatch({type: 'recieve-templates', payload});
    });
};

export const changeSelectedFile: GenericAction = fileName => dispatch => {
  dispatch({
    type: 'change-selected-file',
    payload: fileName,
  });
  loadDataFromPredefinedDatasets(fileName)(dispatch);
};
