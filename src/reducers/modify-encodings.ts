import produce from 'immer';
import stringify from 'json-stringify-pretty-compact';

import {CoerceTypePayload, HandleCodePayload, SetTemplateValuePayload} from '../actions/index';
import {findField, getAllInUseFields, extractFieldStringsForType, get} from '../utils';
import {ActionResponse, EMPTY_SPEC, AppState, UndoRedoStackItem, blindSet} from './default-state';
import {TYPE_TRANSLATE} from './apt-actions';
import {fillTemplateMapWithDefaults} from './template-actions';
import {evaluateHydraProgram} from '../hydra-lang';

const usingNestedSpec = (state: AppState): boolean => Boolean(state.spec.spec);

// remove the current encoding
export const clearEncoding: ActionResponse<void> = state => {
  if (state.currentTemplateInstance) {
    return fillTemplateMapWithDefaults(state);
  } else {
    return produce(state, draftState => {
      draftState.spec = EMPTY_SPEC;
    });
  }
};

// change the mark type
export const changeMarkType: ActionResponse<string> = (state, payload) => {
  const usingNested = usingNestedSpec(state);
  const route = usingNested ? ['spec', 'spec', 'mark', 'type'] : ['spec', 'mark', 'type'];
  return produce(state, draftState => {
    if (!get(state, route)) {
      draftState.spec.mark = {...draftState.spec.mark, type: payload};
      return;
    }
    if (usingNested) {
      draftState.spec.spec.mark.type = payload;
    } else {
      draftState.spec.mark.type = payload;
    }
  });
};

// blindly set a new spec
export const setNewSpec = blindSet('spec');

// set the spec code
export const setNewSpecCode: ActionResponse<HandleCodePayload> = (state, payload) => {
  const {code, inError} = payload;
  if (state.currentTemplateInstance) {
    // TODO i think eval should get checked here
    // const filledInSpec = setTemplateValues(code, state.templateMap);
    return produce(state, draftState => {
      draftState.currentTemplateInstance.code = code;
      draftState.editorError = inError;
      // draftState.spec = JSON.parse(filledInSpec);
      draftState.spec = evaluateHydraProgram(draftState.currentTemplateInstance, draftState.templateMap);
    });
  }
  if (inError) {
    return produce(state, draftState => {
      draftState.specCode = code;
      draftState.editorError = inError;
    });
  }
  // using shelf mode
  return produce(state, draftState => {
    draftState.specCode = code;
    draftState.editorError = null;
    // this one is based on the t0 and doesn't require a full parse & execute
    draftState.spec = JSON.parse(code);
  });
};

export const coerceType: ActionResponse<CoerceTypePayload> = (state, payload) => {
  const {field, type} = payload;
  return produce(state, draftState => {
    const columnIdx = state.columns.findIndex((d: any) => d.field === field);
    draftState.columns[columnIdx].type = type;
  });
};

function maybeRemoveRepeats(oldState: AppState, newState: AppState, targetChannel: string): AppState {
  const route = usingNestedSpec(newState) ? ['spec', 'spec', 'encoding'] : ['spec', 'encoding'];
  // figure out if target removing field is a metacolumn
  const oldField = get(oldState, [...route, targetChannel]);
  const repeaterField = get(oldField, ['field', 'repeat']);
  if (!repeaterField) {
    return newState;
  }
  // check to see if that column is still in use after the removal
  const inUse = getAllInUseFields(newState.spec);
  if (inUse.has(repeaterField)) {
    return newState;
  }
  return produce(newState, draftState => {
    delete draftState.spec.repeat[repeaterField];
  });
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
    delete draftState.spec.encoding;
    delete draftState.spec.mark;
  });
}

function removeMetaEncoding(state: AppState): AppState {
  return produce(state, draftState => {
    draftState.spec.encoding = draftState.spec.spec.encoding;
    draftState.spec.mark = draftState.spec.spec.mark;
    delete draftState.spec.spec;
    delete draftState.spec.repeat;
  });
}

// only used from within this file
const setChannelToMetaColumn: ActionResponse<SetTemplateValuePayload> = (state, payload) => {
  // moving from un-nested spec to nested spec
  let newState = state;
  if (!usingNestedSpec(state)) {
    newState = produce(addMetaEncoding(state), draftState => {
      draftState.spec.repeat = {};
    });
  }

  // this approach only works for column / row
  // if the repeat operator has not been initialized, initialize it
  const repeatRoute = ['spec', 'repeat', payload.text as string];

  if (!get(state, repeatRoute)) {
    newState = produce(newState, draftState => {
      draftState.spec.repeat[payload.text as string] = extractFieldStringsForType(
        newState.columns,
        'MEASURE',
      );
    });
  }
  // if there is already a card in place, check to see if removing it removes the repeats
  const fieldRoute = ['spec', 'spec', 'encoding', payload.field];
  if (get(state, fieldRoute) && get(state, [...fieldRoute, 'field', 'repeat']) !== payload.text) {
    newState = produce(newState, draftState => {
      // draftState.spec.repeat[payload.text] = extractFieldStringsForType(newState.columns, 'MEASURE');
      delete draftState.spec.spec.encoding[payload.field];
      draftState = maybeRemoveRepeats(newState, draftState, payload.field);
    });
  }

  // if the card is being moved remove where it was before
  if (payload.containingShelf) {
    newState = produce(newState, draftState => {
      delete draftState.spec.spec.encoding[payload.containingShelf];
    });
  }

  // finally set the new field
  return produce(newState, draftState => {
    draftState.spec.spec.encoding[payload.field] = {
      field: {repeat: payload.text},
      type: 'quantitative',
    };
  });
};

export const updateCodeRepresentation: ActionResponse<AppState> = (_: AppState, newState: AppState) => {
  return produce(newState, (draftState: any) => {
    draftState.specCode = stringify(newState.spec);
  });
};

// move a field from one channel to another (origin field might be null)
export const setEncodingParameter: ActionResponse<SetTemplateValuePayload> = (state, payload) => {
  if (payload.isMeta) {
    return setChannelToMetaColumn(state, payload);
  }
  const fieldHeader = findField(state, payload.text as string);
  const usingNested = usingNestedSpec(state);
  let newState = state;
  if (fieldHeader) {
    newState = produce(newState, draftState => {
      const newField = {
        field: payload.text,
        type: TYPE_TRANSLATE[fieldHeader.type],
      };
      if (usingNested) {
        draftState.spec.spec.encoding[payload.field] = newField;
      } else {
        draftState.spec.encoding[payload.field] = newField;
      }
    });
  } else {
    // removing field
    newState = maybeRemoveRepeats(
      state,
      produce(newState, draftState => {
        if (usingNested) {
          draftState.spec.spec.encoding[payload.field] = {};
        } else {
          draftState.spec.encoding[payload.field] = {};
        }
      }),
      payload.field,
    );
  }
  // if the card is being moved, remove where it was before
  if (payload.containingShelf) {
    newState = produce(newState, draftState => {
      if (usingNested) {
        delete draftState.spec.spec.encoding[payload.containingShelf];
      } else {
        delete draftState.spec.encoding[payload.containingShelf];
      }
    });
  }
  // check if the nesting spec should be removed
  if (usingNestedSpec(state) && noMetaUsage(newState)) {
    return removeMetaEncoding(newState);
  }
  return newState;
};

// move a field from one channel to another (origin field might be null)
export const swapXAndYChannels: ActionResponse<void> = state => {
  return produce(state, draftState => {
    const usingNested = usingNestedSpec(state);
    const oldEncoding = usingNested ? state.spec.spec.encoding : state.spec.encoding;
    if (usingNested) {
      draftState.spec.spec.encoding.x = oldEncoding.y;
      draftState.spec.spec.encoding.y = oldEncoding.x;
    } else {
      draftState.spec.encoding.x = oldEncoding.y;
      draftState.spec.encoding.y = oldEncoding.x;
    }
  });
};

export const setRepeats: ActionResponse<{repeats: string[]; target: string}> = (state, payload) => {
  const {repeats, target} = payload;
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
  return produce(state, draftState => {
    draftState.spec = stackItem.spec;
    draftState.currentView = stackItem.currentView;
    draftState.templateMap = stackItem.templateMap;
    draftState.views = stackItem.views;
  });
};
// takes in an old state (via a wrapping function) and an updated state and push the contents
// of the old state into the undo stack
export function pushToUndoStack(oldState: AppState, newState: AppState): AppState {
  return produce(newState, draftState => {
    draftState.undoStack.push(createStackItem(oldState));
    draftState.redoStack = [];
  });
}
// TODO these are probably constructable as a single more elegant function
export const triggerRedo: ActionResponse<void> = state => {
  const redoStack = state.redoStack;
  return produce(applyStackItemToState(state, redoStack[redoStack.length - 1]), draftState => {
    draftState.redoStack.pop();
    draftState.undoStack.push(createStackItem(state));
  });
};

export const triggerUndo: ActionResponse<void> = state => {
  const undoStack = state.undoStack;
  return produce(applyStackItemToState(state, undoStack[undoStack.length - 1]), draftState => {
    draftState.undoStack.pop();
    draftState.redoStack.push(createStackItem(state));
  });
};
