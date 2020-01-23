import produce from 'immer';
import stringify from 'json-stringify-pretty-compact';

import {findField, getAllInUseFields, extractFieldStringsForType} from '../utils';
import {ActionResponse, EMPTY_SPEC, AppState, UndoRedoStackItem} from './default-state';
import {TYPE_TRANSLATE} from './apt-actions';
import {fillTemplateMapWithDefaults} from './template-actions';
import {setTemplateValues} from '../hydra-lang';

const usingNestedSpec = (state: AppState): boolean => Boolean(state.spec.spec);

// remove the current encoding
export const clearEncoding: ActionResponse = state => {
  if (state.currentTemplateInstance) {
    return fillTemplateMapWithDefaults(state);
  } else {
    return produce(state, draftState => {
      draftState.spec = EMPTY_SPEC;
    });
    // return state.set('spec', EMPTY_SPEC);
  }
};

// change the mark type
export const changeMarkType: ActionResponse = (state, payload) => {
  console.log('BROKEN, TOO HARD BLIND');
  return state;
  // const route = usingNestedSpec ? ['spec', 'spec', 'mark', 'type'] : ['spec', 'mark', 'type'];
  // if (!state.getIn(route)) {
  //   return state.setIn(['spec', 'mark'], {
  //     ...state.getIn(['spec', 'mark']).toJS(),
  //     type: payload,
  //   });
  // }
  // return state.setIn(route, payload);
};

// blindly set a new spec
// TODO this could be a blind set
export const setNewSpec: ActionResponse = (state, payload) =>
  produce(state, draftState => {
    draftState.spec = payload;
  });

// set the spec code
export const setNewSpecCode: ActionResponse = (state, payload) => {
  const {code, inError} = payload;
  if (state.currentTemplateInstance) {
    // TODO i think eval should get checked here
    const filledInSpec = setTemplateValues(code, state.templateMap);
    // return state
    //   .setIn(['currentTemplateInstance', 'code'], code)
    //   .set('editorError', inError)
    //   .set('spec', JSON.parse(filledInSpec));
    return produce(state, draftState => {
      draftState.currentTemplateInstance.code = code;
      draftState.editorError = inError;
      draftState.spec = JSON.parse(filledInSpec);
    });
  }
  if (inError) {
    // return state.set('specCode', code).set('editorError', inError);
    return produce(state, draftState => {
      draftState.specCode = code;
      draftState.editorError = inError;
    });
  }
  // using shelf mode
  return produce(state, draftState => {
    draftState.specCode = code;
    draftState.editorError = null;
    draftState.spec = JSON.parse(code);
  });
  // return state
  //   .set('specCode', code)
  //   .set('editorError', null)
  //   .set('spec', JSON.parse(code));
};

export const coerceType: ActionResponse = (state, payload) => {
  const {field, type} = payload;
  console.log('this may be wrong!!!');
  const columnIdx = state.columns.findIndex((d: any) => d.field === field);
  return produce(state, draftState => {
    draftState.columns[columnIdx].type = type;
  });
  // return state.set(
  //   'columns',
  //   state
  //     .get('columns')
  //     .setIn([columnIdx, 'type'], type)
  //     .toJS(),
  // );
};

function maybeRemoveRepeats(oldState: AppState, newState: AppState, targetChannel: string): AppState {
  console.log('TODO BROKEN');
  return newState;
  // const route = usingNestedSpec(newState) ? ['spec', 'spec', 'encoding'] : ['spec', 'encoding'];
  // // figure out if target removing field is a metacolumn
  // const oldField = oldState.getIn([...route, targetChannel]);
  // const repeaterField = oldField.getIn(['field', 'repeat']);
  // if (!repeaterField) {
  //   return newState;
  // }
  // // check to see if that column is still in use after the removal
  // const inUse = getAllInUseFields(newState.getIn(['spec']));
  // if (inUse.has(repeaterField)) {
  //   return newState;
  // }
  // return newState.deleteIn(['spec', 'repeat', repeaterField]);
}

function noMetaUsage(state: AppState): boolean {
  const inUse = getAllInUseFields(state.spec);
  return !(inUse.has('row') || inUse.has('column') || inUse.has('repeat'));
}

function addMetaEncoding(state: AppState): AppState {
  return produce(state, draftState => {
    draftState.spec.spec = {};
    draftState.spec.spec.encoding = state.spec.encoding;
    draftState.spec.spec.mark = state.spec.mark;

    console.log('DELETE PART BRKOEN');
    // .deleteIn(['spec', 'encoding'])
    // .deleteIn(['spec', 'mark']);
  });
  // return state
  //   .setIn(['spec', 'spec'], {})
  //   .setIn(['spec', 'spec', 'encoding'], state.getIn(['spec', 'encoding']))
  //   .setIn(['spec', 'spec', 'mark'], state.getIn(['spec', 'mark']))
  //   .deleteIn(['spec', 'encoding'])
  //   .deleteIn(['spec', 'mark']);
}

function removeMetaEncoding(state: AppState): AppState {
  console.log('BRKOEN BRKOEN BRKOEN');
  return state;
  // return state
  //   .setIn(['spec', 'encoding'], state.getIn(['spec', 'spec', 'encoding']))
  //   .setIn(['spec', 'mark'], state.getIn(['spec', 'spec', 'mark']))
  //   .deleteIn(['spec', 'spec'])
  //   .deleteIn(['spec', 'repeat']);
}

export const setChannelToMetaColumn: ActionResponse = (state, payload) => {
  console.log('META COLUMN BROKEN');
  return state;
  // let newState = state;
  // // moving from un-nested spec to nested spec
  // if (!usingNestedSpec(state)) {
  //   newState = addMetaEncoding(newState).setIn(['spec', 'repeat'], {});
  // }

  // //
  // // this approach only works for column / row
  // // if the repeat operator has not been initialized, initialize it
  // const repeatRoute = ['spec', 'repeat', payload.text];
  // if (!newState.getIn(repeatRoute)) {
  //   newState = newState.setIn(repeatRoute, extractFieldStringsForType(state.get('columns'), 'MEASURE'));
  // }
  // // if there is already a card in place, check to see if removing it removes the repeats
  // const fieldRoute = ['spec', 'spec', 'encoding', payload.field];
  // if (state.getIn(fieldRoute) && state.getIn([...fieldRoute, 'field', 'repeat']) !== payload.text) {
  //   newState = maybeRemoveRepeats(newState, newState.deleteIn(fieldRoute), payload.field);
  // }

  // // if the card is being moved remove where it was before
  // if (payload.containingShelf) {
  //   const delRoute = ['spec', 'spec', 'encoding', payload.containingShelf];
  //   newState = newState.deleteIn(delRoute);
  // }

  // // finally set the new field
  // const newFieldVal = {
  //   field: {repeat: payload.text},
  //   type: 'quantitative',
  // };
  // return newState.setIn(fieldRoute, newFieldVal);
};

export const updateCodeRepresentation: ActionResponse = (_, newState: AppState) => {
  return produce(newState, (draftState: any) => {
    draftState.specCode = stringify(newState.spec);
  });
  // return newState.set('specCode', stringify(newState.get('spec')));
};

// move a field from one channel to another (origin field might be null)
export const setEncodingParameter: ActionResponse = (state, payload) => {
  console.log('encoding is broken !');
  return state;
  // if (payload.isMeta) {
  //   return setChannelToMetaColumn(state, payload);
  // }
  // const fieldHeader = findField(state, payload.text);
  // const route = usingNestedSpec(state) ? ['spec', 'spec', 'encoding'] : ['spec', 'encoding'];
  // let newState = state;
  // if (fieldHeader) {
  //   newState = newState.setIn([...route, payload.field], {
  //     field: payload.text,
  //     type: TYPE_TRANSLATE[fieldHeader.type],
  //   });
  // } else {
  //   // removing field
  //   newState = maybeRemoveRepeats(state, newState.setIn([...route, payload.field], {}), payload.field);
  // }
  // // if the card is being moved, remove where it was before
  // if (payload.containingShelf) {
  //   newState = newState.deleteIn([...route, payload.containingShelf]);
  // }
  // // check if the nesting spec should be removed
  // if (usingNestedSpec(state) && noMetaUsage(newState)) {
  //   return removeMetaEncoding(newState);
  // }
  // return newState;
};

// move a field from one channel to another (origin field might be null)
export const swapXAndYChannels: ActionResponse = state => {
  console.log('SWAP X ANDY BROKEN');
  return state;
  // const route = usingNestedSpec(state) ? ['spec', 'spec', 'encoding'] : ['spec', 'encoding'];
  // const oldX = state.getIn([...route, 'x']);
  // const oldY = state.getIn([...route, 'y']);

  // return state.setIn([...route, 'x'], oldY).setIn([...route, 'y'], oldX);
};

export const setRepeats: ActionResponse = (state, payload) => {
  const {repeats, target} = payload;
  // return state.setIn(['spec', 'repeat', target], repeats);
  return produce(state, draftState => {
    draftState.spec.repeat[target] = repeats;
  });
};

const createStackItem = (state: AppState): UndoRedoStackItem => {
  return {
    spec: state.spec,
    currentView: state.currentView,
    templateMap: state.templateMap,
    views: state.views,
  };
};

const applyStackItemToState = (state: AppState, stackItem: any): AppState => {
  return state;
  // return state
  //   .set('spec', stackItem.get('spec'))
  //   .set('currentView', stackItem.get('currentView'))
  //   .set('templateMap', stackItem.get('templateMap'))
  //   .set('views', stackItem.get('views'));
};
// takes in an old state (via a wrapping function) and an updated state and push the contents
// of the old state into the undo stack
export function pushToUndoStack(oldState: AppState, newState: AppState): AppState {
  console.log('undo log  broken');
  return newState;
  // return newState
  //   .set('undoStack', newState.get('undoStack').push(createStackItem(oldState)))
  //   .set('redoStack', []);
}
// TODO these are probably constructable as a single more elegant function
export const triggerRedo: ActionResponse = state => {
  console.log('redo broken');
  return state;
  // const undoStack = state.get('undoStack');
  // const redoStack = state.get('redoStack');
  // return applyStackItemToState(state, redoStack.last())
  //   .set('redoStack', redoStack.pop())
  //   .set('undoStack', undoStack.push(createStackItem(state)));
};

export const triggerUndo: ActionResponse = state => {
  console.log('undo broken');
  return state;
  // const undoStack = state.get('undoStack');
  // const redoStack = state.get('redoStack');
  // return applyStackItemToState(state, undoStack.last())
  //   .set('undoStack', undoStack.pop())
  //   .set('redoStack', redoStack.push(createStackItem(state)));
};
