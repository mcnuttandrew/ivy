import {Dispatch} from 'redux';

import VegaDataPreAlias from 'vega-datasets';
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
// export const loadDataFromPredefinedDatasets = buildEasyAction(
//   'load-data-from-predefined',
// );

export const loadDataFromPredefinedDatasets: GenericAction = fileName => dispatch => {
  fetch(VegaData[fileName].url)
    .then(d => d.json())
    .then(d => {
      dispatch({
        type: 'recieve-data-from-predefined',
        payload: d,
      });

      dispatch({
        type: 'recieve-type-inferences',
        payload: computeColMeta(d),
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
