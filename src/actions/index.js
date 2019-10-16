/* global chrome*/
const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

const buildEasyAction = type => payload => dispatch =>
  dispatch({type, payload});
export const clearSelection = buildEasyAction('clear-selection');

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
