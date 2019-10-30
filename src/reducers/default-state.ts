import Immutable, {Map} from 'immutable';
// interface InternalAppState {
//   spec: Spec;
//   data: any;
//   columns: ColumnHeader[];
// }
export interface ActionResponse {
  (state: AppState, payload: any): AppState;
}
export type AppState = any;
// TODO undo this embarrasment
export const EMPTY_SPEC = Immutable.fromJS({
  data: {name: 'myData'},
  transform: [],
  mark: {type: 'point', tooltip: true},
  encoding: {
    x: {},
    y: {},
  },
});
export const DEFAULT_STATE: AppState = Map({
  spec: EMPTY_SPEC,
  specCode: JSON.stringify(EMPTY_SPEC, null, 2),
  data: [],
  columns: [],
  metaColumns: [],
  currentlySelectedFile: 'iris.json',
  selectedGUIMode: 'GRAMMAR',
  // selectedGUIMode: 'PROGRAMMATIC',
  dataModalOpen: false,
  currentTheme: 'default',
  undoStack: Immutable.fromJS([]),
  redoStack: Immutable.fromJS([]),
});
