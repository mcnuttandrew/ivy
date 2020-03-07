import produce from 'immer';
import {ActionResponse, AppState, UndoRedoStackItem} from '../types';

const createStackItem = (state: AppState): UndoRedoStackItem => {
  return {
    currentView: state.currentView,
    templateMap: state.templateMap,
    encodingMode: state.encodingMode,
    currentTemplateInstance: state.currentTemplateInstance,
    views: state.views,
    viewCatalog: state.viewCatalog,
    viewsToMaterialize: state.viewsToMaterialize,
    columns: state.columns,
    codeMode: state.codeMode,
  };
};

// TODO if this gets any larger we will need to develop an itemized notion of undo
const applyStackItemToState = (state: AppState, stackItem: any): AppState => {
  return produce(state, draftState => {
    draftState.currentView = stackItem.currentView;
    draftState.templateMap = stackItem.templateMap;
    draftState.views = stackItem.views;
    draftState.encodingMode = stackItem.encodingMode;
    draftState.currentTemplateInstance = stackItem.currentTemplateInstance;
    draftState.viewsToMaterialize = stackItem.viewsToMaterialize;
    draftState.columns = stackItem.columns;
    draftState.codeMode = stackItem.codeMode;
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
