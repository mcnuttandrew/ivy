import Immutable from 'immutable';
import stringify from 'json-stringify-pretty-compact';
// import SCATTERPLOT from '../templates/example-templates/scatterplot';
export type AppState = Immutable.Map<any, any>;

export interface ActionResponse {
  (state: AppState, payload: any): AppState;
}

export const blindSet = (key: string): ActionResponse => (state, payload): AppState =>
  state.set(key, payload);
export const toggle = (key: string): ActionResponse => (state): AppState => state.set(key, !state.get(key));

// TODO undo this embarrasment
const defaultEmpty = Immutable.fromJS({
  $schema: 'https://vega.github.io/schema/vega-lite/v4.json',
  transform: [],
  mark: {type: 'point', tooltip: true},
  encoding: {},
});
export const EMPTY_SPEC = defaultEmpty;

// if the goose mode should be on, then we shouldnt use defaults
const GOOSE_MODE = false;
const fileSpecificationDefaults = GOOSE_MODE
  ? {
      currentlySelectedFile: null,
      dataModalOpen: true,
      GOOSE_MODE,
    }
  : {
      currentlySelectedFile: 'cars.json',
      dataModalOpen: false,
      GOOSE_MODE,
    };

export const DEFAULT_STATE: AppState = Immutable.fromJS({
  ...fileSpecificationDefaults,

  // meta-data
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
  encodingMode: 'grammer',
  showProgrammaticMode: true,
  showSimpleDisplay: false,
  codeMode: 'CODE',

  // undo redo
  undoStack: Immutable.fromJS([]),
  redoStack: Immutable.fromJS([]),

  // view stuff
  views: ['view1'],
  viewCatalog: {},
  currentView: 'view1',

  // template stuff

  templates: [],
  templateMap: {},
  templateBuilderModalOpen: false,
})
  // need data to have a consistant type, i.e POJO, not immutable
  .set('data', []);
