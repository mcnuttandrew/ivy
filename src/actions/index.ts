import {Dispatch} from 'redux';
import {csvParse} from 'd3-dsv';
import {getDomain, getUniques, executePromisesInSeries} from '../utils';

import {Analyzer} from 'type-analyzer';
const {computeColMeta} = Analyzer;

// const SECOND = 1000;
// const MINUTE = SECOND * 60;
// const HOUR = MINUTE * 60;
// const DAY = HOUR * 24;

export interface GenericAction {
  (payload?: any): (dispatch: Dispatch) => void;
}
interface GenericActionCreator {
  (type: string): GenericAction;
}

const buildEasyAction: GenericActionCreator = type => payload => dispatch =>
  dispatch({type, payload});
export const setEncodingParameter = buildEasyAction('set-encoding-param');
export const clearEncoding = buildEasyAction('clear-encoding');
export const changeMarkType = buildEasyAction('change-mark-type');
export const setNewSpec = buildEasyAction('set-new-encoding');
export const setNewSpecCode = buildEasyAction('set-new-encoding-code');
export const addToNextOpenSlot = buildEasyAction('add-to-next-open-slot');
export const changeGUIMode = buildEasyAction('change-gui-mode');
export const changeTheme = buildEasyAction('change-theme');
export const createFilter = buildEasyAction('create-filter');
export const updateFilter = buildEasyAction('update-filter');
export const deleteFilter = buildEasyAction('delete-filter');
export const coerceType = buildEasyAction('coerce-type');

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

export const loadDataFromPredefinedDatasets: GenericAction = fileName => dispatch => {
  const url = `node_modules/vega-datasets/data/${fileName}`;
  fetch(url)
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

export const changeSelectedFile: GenericAction = fileName => dispatch => {
  dispatch({
    type: 'change-selected-file',
    payload: fileName,
  });
  loadDataFromPredefinedDatasets(fileName)(dispatch);
};
