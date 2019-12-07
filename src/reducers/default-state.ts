import Immutable, {Map} from 'immutable';
import {OLD_EXAMPLE} from '../constants/vega-examples';
// import {ColumnHeader} from '../types';
// import {Spec, Data} from 'vega-typings/types';
export type AppState = Immutable.Map<any, any>;

// {
//   spec: Spec;
//   specCode: string;
//   data: Data;
//   columns: ColumnHeader[];
//   currentlySelectedFile: string;
//   selectedGUIMode: string;
//   // selectedGUIMode: 'PROGRAMMATIC';
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
  specCode: JSON.stringify(EMPTY_SPEC, null, 2),
  editorError: null,
  columns: [],
  metaColumns: [],
  unprouncableInGrammer: false,
  selectedGUIMode: 'GUI',
  // selectedGUIMode: 'PROGRAMMATIC',
  encodingMode: 'grammer',
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
