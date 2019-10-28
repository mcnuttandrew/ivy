import Immutable from 'immutable';
const NULL_ACTION = (state: any) => state;
const DEFAULT_STORE = Immutable.fromJS({});
// allow side effects via postMessage
const actionMap: {[val: string]: any} = {
  recieveDataSample: NULL_ACTION,
  recieveTypes: NULL_ACTION,
  evaluateSpec: (store: any, payload: any, returnFunctions: any) => {
    const spec = JSON.parse(payload.spec);
    console.log(spec);
    returnFunctions.lintSpec([
      {name: 'example lint failure', severity: 'error'},
      {name: 'example lint warn', severity: 'warn'},
    ]);
    return store;
  },
  refreshStore: () => DEFAULT_STORE,
};

function dispatch(store: any, payload: any, returnFunctions: any) {
  return (actionMap[payload.type] || NULL_ACTION)(
    store,
    payload,
    returnFunctions,
  );
}

let store = DEFAULT_STORE;
addEventListener('message', event => {
  // @ts-ignore
  const message = content => postMessage(content);
  const returnFunctions: {[val: string]: any} = {
    lintSpec: (lintResults: any) => message({type: 'lintSpec', lintResults}),
  };
  const {data: payload} = event;
  store = dispatch(store, payload, returnFunctions);
  // send results back
  // postMessage({type: 'end', nodes});
});
