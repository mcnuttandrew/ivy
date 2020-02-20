import produce from 'immer';
import stringify from 'json-stringify-pretty-compact';
import {ColumnHeader} from '../types';
import {Template, TemplateMap} from '../templates/types';
import GALLERY from '../templates/example-templates/gallery';
import TABLE from '../templates/example-templates/table';
import {UndoRedoStackItem} from './undo-actions';
import {ViewCatalog} from './view-actions';
import {JSON_OUTPUT} from '../constants/index';

export interface DataReducerState {
  data: {[x: string]: any}[];
}
export interface AppState {
  // meta-data
  columns: ColumnHeader[];
  currentlySelectedFile: string;

  // spec configs
  editMode: boolean;
  editorError: boolean;
  spec: any;
  specCode: string;

  // GUI
  codeMode: string;
  currentTemplateInstance: Template;
  dataModalOpen: boolean;
  encodingMode: string;
  programModalOpen: boolean;
  showGUIView: boolean;
  showProgrammaticMode: boolean;
  userName: string;

  // undo redo
  redoStack: UndoRedoStackItem[];
  undoStack: UndoRedoStackItem[];

  // view stuff
  currentView: string;
  viewCatalog: ViewCatalog;
  views: string[];

  // template stuff
  templateMap: TemplateMap;
  templates: Template[];
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
const vegaLitEmpty = {
  $schema: 'https://vega.github.io/schema/vega-lite/v4.json',
  transform: [] as any[],
  mark: {type: 'point', tooltip: true},
  encoding: {},
};
const vegaEmpty = {
  $schema: 'https://vega.github.io/schema/vega/v5.json',
  width: 400,
  height: 200,
  padding: 5,
  data: [] as any[],
  signals: [] as any[],
  scales: [] as any[],
  axes: [] as any[],
  marks: [] as any[],
};
const unitVisEmpty = {
  $schema: 'https://unit-vis.netlify.com/assets/unit-vis-schema.json',
  layouts: [] as any[],
  mark: {color: {key: '', type: 'categorical'}},
};
export const EMPTY_SPEC_BY_LANGUAGE: {[x: string]: any} = {
  'vega-lite': vegaLitEmpty,
  vega: vegaEmpty,
  'unit-vis': unitVisEmpty,
  'hydra-data-table': JSON.parse(TABLE.code),
};
export const DEFAULT_STATE: AppState = {
  // meta-data
  currentlySelectedFile: 'cars.json',
  columns: [],

  // spec configs
  spec: {},
  specCode: stringify(EMPTY_SPEC_BY_LANGUAGE['vega-lite']),
  editorError: null,
  editMode: false,

  // GUI
  currentTemplateInstance: GALLERY,
  // TODO COMBINE MODAL VALUES INTO A SINGLE KEY
  dataModalOpen: false,
  encodingMode: GALLERY.templateName,
  showProgrammaticMode: false,
  showGUIView: true,
  codeMode: JSON_OUTPUT,
  programModalOpen: false,
  userName: '',

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
};
