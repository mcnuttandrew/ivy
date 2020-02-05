import produce from 'immer';
import stringify from 'json-stringify-pretty-compact';
import {ColumnHeader} from '../types';
import {Template, TemplateMap} from '../templates/types';
import NONE from '../templates/example-templates/none';
import {UndoRedoStackItem} from './undo-actions';
import {ViewCatalog} from './view-actions';

export interface DataReducerState {
  data: {[x: string]: any}[];
}
export interface AppState {
  // meta-data
  currentlySelectedFile: string;
  columns: ColumnHeader[];
  metaColumns: ColumnHeader[];

  // spec configs
  spec: any;
  specCode: string;
  currentTheme: string;
  editorError: boolean;
  editMode: boolean;

  // GUI
  // currentTemplateInstance: SCATTERPLOT;
  // encodingMode: 'Scatterplot';
  currentTemplateInstance: Template | null;
  dataModalOpen: boolean;
  encodingMode: string;
  showProgrammaticMode: boolean;
  showGUIView: boolean;
  codeMode: string;
  editorFontSize: number;
  programModalOpen: boolean;

  // undo redo
  undoStack: UndoRedoStackItem[];
  redoStack: UndoRedoStackItem[];

  // view stuff
  views: string[];
  viewCatalog: ViewCatalog;
  currentView: string;

  // template stuff

  templates: Template[];
  templateMap: TemplateMap;
  templateBuilderModalOpen: boolean;
}

/**
 * @param T the type of payload argument
 */
export interface ActionResponse<T> {
  (state: AppState, payload: T): AppState;
}

export const blindSet = (key: string): ActionResponse<any> => (state, payload): AppState =>
  produce(state, draftState => {
    /* eslint-disable @typescript-eslint/ban-ts-ignore*/
    // @ts-ignore
    draftState[key] = payload;
    /* eslint-enable @typescript-eslint/ban-ts-ignore*/
  });
export const toggle = (key: string): ActionResponse<null> => (state): AppState =>
  produce(state, draftState => {
    /* eslint-disable @typescript-eslint/ban-ts-ignore*/
    // @ts-ignore
    draftState[key] = !state[key];
    /* eslint-enable @typescript-eslint/ban-ts-ignore*/
  });

// TODO undo this embarrasment (specifically the type messes)
const defaultEmpty = {
  $schema: 'https://vega.github.io/schema/vega-lite/v4.json',
  transform: [] as any[],
  mark: {type: 'point', tooltip: true},
  encoding: {},
};
export const EMPTY_SPEC = defaultEmpty;
export const DEFAULT_STATE: AppState = {
  // meta-data
  currentlySelectedFile: 'cars.json',
  columns: [],
  metaColumns: [],

  // spec configs
  //  spec: EMPTY_SPEC,
  spec: {},
  specCode: stringify(EMPTY_SPEC),
  currentTheme: 'default',
  editorError: null,
  editMode: false,

  // GUI
  // currentTemplateInstance: SCATTERPLOT,
  // encodingMode: 'Scatterplot',
  currentTemplateInstance: NONE,
  dataModalOpen: false,
  encodingMode: NONE.templateName,
  showProgrammaticMode: false,
  showGUIView: true,
  codeMode: 'EXPORT TO JSON',
  editorFontSize: 10,
  programModalOpen: false,

  // undo redo
  undoStack: [],
  redoStack: [],

  // view stuff
  views: ['view1'],
  viewCatalog: {},
  currentView: 'view1',

  // template stuff

  templates: [],
  templateMap: {},
  templateBuilderModalOpen: false,
};
