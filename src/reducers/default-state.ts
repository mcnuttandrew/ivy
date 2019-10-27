import Immutable, {Map} from 'immutable';
// interface InternalAppState {
//   spec: Spec;
//   data: any;
//   columns: ColumnHeader[];
// }
export type AppState = any;
// TODO undo this embarrasment
export const EMPTY_SPEC = Immutable.fromJS({
  data: {name: 'myData'},
  transform: [],
  mark: 'point',
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
  currentlySelectedFile: 'cars.json',
  selectedGUIMode: 'GRAMMAR',
  // selectedGUIMode: 'PROGRAMMATIC',
  dataModalOpen: false,
  currentTheme: 'urbaninstitute',
});
