import {Dispatch} from 'redux';

import VegaDataPreAlias from 'vega-datasets';
import {getDomain, getUniques, executePromisesInSeries} from '../utils';
const VegaData: {[key: string]: any} = VegaDataPreAlias;

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
export const addToNextOpenSlot = buildEasyAction('add-to-next-open-slot');
export const changeGUIMode = buildEasyAction('change-gui-mode');
export const createFilter = buildEasyAction('create-filter');
export const updateFilter = buildEasyAction('update-filter');
export const deleteFilter = buildEasyAction('delete-filter');

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

export const loadDataFromPredefinedDatasets: GenericAction = fileName => dispatch => {
  const url = `node_modules/vega-datasets/data/${fileName}`;
  fetch(url)
    .then(d => d.json())
    .then(d => {
      dispatch({
        type: 'recieve-data-from-predefined',
        payload: d,
      });

      dispatch({
        type: 'recieve-type-inferences',
        payload: computeColMeta(d).map((columnMeta: any) => {
          if (columnMeta.category === 'DIMENSION') {
            return {...columnMeta, domain: getUniques(d, columnMeta.key)};
          }
          return {...columnMeta, domain: getDomain(d, columnMeta.key)};
        }),
      });
    });
};

export const changeSelectedFile: GenericAction = fileName => dispatch => {
  dispatch({
    type: 'change-selected-file',
    payload: fileName,
  });
  loadDataFromPredefinedDatasets(fileName)(dispatch);
};

// example action
// export const setPageId = payload => dispatch => {
//   dispatch({type: 'set-page-id', payload});
//   getTreeForId(payload)
//     .then(result => dispatch({
//       type: 'get-tree-from-cache',
//       payload: {
//         data: result,
//         pageId: payload
//       }
//     }));
// };
