import produce from 'immer';
import stringify from 'json-stringify-pretty-compact';
import {ColumnHeader} from '../types';
import {Template, TemplateMap} from '../templates/types';
// import SCATTERPLOT from '../templates/example-templates/scatterplot';
export interface UndoRedoStackItem {
  spec: any;
  currentView: string;
  templateMap: TemplateMap;
  views: string[];
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
  showSimpleDisplay: boolean;
  showGUIView: boolean;
  codeMode: string;
  editorFontSize: number;
  programModalOpen: boolean;

  // undo redo
  undoStack: UndoRedoStackItem[];
  redoStack: UndoRedoStackItem[];

  // view stuff
  views: string[];
  viewCatalog: {[x: string]: any};
  currentView: string;

  // template stuff

  templates: Template[];
  templateMap: TemplateMap;
  templateBuilderModalOpen: boolean;

  data: {[x: string]: any}[];
  originalData: {[x: string]: any}[];
  dataModification: string;
}

export interface ActionResponse {
  (state: AppState, payload: any): AppState;
}

export const blindSet = (key: string): ActionResponse => (state, payload): AppState =>
  produce(state, draftState => {
    /* eslint-disable @typescript-eslint/ban-ts-ignore*/
    // @ts-ignore
    draftState[key] = payload;
    /* eslint-enable @typescript-eslint/ban-ts-ignore*/
  });
export const toggle = (key: string): ActionResponse => (state): AppState =>
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
  spec: EMPTY_SPEC,
  specCode: stringify(EMPTY_SPEC),
  currentTheme: 'default',
  editorError: null,
  editMode: false,

  // GUI
  // currentTemplateInstance: SCATTERPLOT,
  // encodingMode: 'Scatterplot',
  currentTemplateInstance: null,

  dataModalOpen: false,
  encodingMode: 'grammer',
  showProgrammaticMode: true,
  showSimpleDisplay: false,
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

  data: [],
  originalData: [],
  dataModification: null,
};
