import Immutable, {Map} from 'immutable';
import stringify from 'json-stringify-pretty-compact';
import {OLD_EXAMPLE} from '../constants/vega-examples';
import TABLE from '../templates/example-templates/table';
// import {ColumnHeader} from '../types';
// import {Spec, Data} from 'vega-typings/types';
export type AppState = Immutable.Map<any, any>;

// {
//   spec: Spec;
//   specCode: string;
//   data: Data;
//   columns: ColumnHeader[];
//   currentlySelectedFile: string;
//   dataModalOpen: boolean;
//   currentTheme: string;
//   undoStack: any;
//   redoStack: any;
// }
export interface ActionResponse {
  (state: AppState, payload: any): AppState;
}
// export type AppState = any;
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
  spec: EMPTY_SPEC,
  specCode: stringify(EMPTY_SPEC),
  editorError: null,
  columns: [],
  metaColumns: [],
  unprouncableInGrammer: false,
  showProgrammaticMode: true,
  encodingMode: 'grammer',
  currentTemplateInstance: null,

  // encodingMode: 'Data Table',
  // currentTemplateInstance: TABLE,

  // encodingMode: 'overview',
  currentTheme: 'default',
  undoStack: Immutable.fromJS([]),
  redoStack: Immutable.fromJS([]),
  views: ['view1'],
  viewCatalog: {},
  currentView: 'view1',

  templates: [],
  templateMap: {},
  templateBuilderModalOpen: false,
})
  // need data to have a consistant type, i.e POJO, not immutable
  .set('data', []);
