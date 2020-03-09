import {GenericAction} from './actions/index';
/**
 * The meta data for a particular data column.
 *
 */
export interface ColumnHeader {
  type: DataType;
  originalType: DataType;
  secondaryType?: string;
  field: string;
  domain: number[] | string[];
  summary: any;
}

// https://github.com/microsoft/TypeScript/issues/1897
export interface JsonMap {
  [member: string]: string | number | boolean | null | JsonArray | JsonMap;
}
export type JsonArray = Array<string | number | boolean | null | JsonArray | JsonMap>;
export type Json = JsonMap | JsonArray | string | number | boolean | null;

export interface ViewCatalog {
  [x: string]: ViewCatalogEntry;
}
export interface ViewCatalogEntry {
  encodingMode: string;
  templateMap: TemplateMap;
  currentTemplateInstance: Template;
  viewsToMaterialize: ViewsToMaterialize;
  dataTransforms: DataTransform[];
}
/**
 * vega transform syntax
 */
export interface DataTransform {
  [x: string]: any;
}
export interface UndoRedoStackItem {
  columns: ColumnHeader[];
  currentTemplateInstance: Template;
  currentView: string;
  encodingMode: string;
  codeMode: string;
  templateMap: TemplateMap;
  viewCatalog: ViewCatalog;
  views: string[];
  viewsToMaterialize: ViewsToMaterialize;
}

export interface AppState {
  // meta-data
  columns: ColumnHeader[];
  currentlySelectedFile: string;
  dataTransforms: DataTransform[];

  // spec configs
  editMode: boolean;
  editorError: boolean;

  languages: {[x: string]: HydraExtension};

  // GUI
  codeMode: string;
  currentTemplateInstance: Template;
  openModal: string | null;
  encodingMode: string;
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
  viewsToMaterialize: ViewsToMaterialize;
}
export type ViewsToMaterialize = {[x: string]: string[]};
/**
 * @param T the type of payload argument
 */
export interface ActionResponse<T> {
  (state: AppState, payload: T): AppState;
}

export interface DataReducerState {
  data: {[x: string]: any}[];
}

export type DataType = 'MEASURE' | 'DIMENSION' | 'TIME' | 'CUSTOM';

export type WidgetType =
  | 'DataTarget'
  | 'MultiDataTarget'
  | 'List'
  | 'Switch'
  | 'Text'
  | 'Slider'
  | 'Section'
  | 'Shortcut'
  | 'FreeText';
export interface Widget<T> {
  /**
   *   The name of widget to be used, this name will be swapped into the code string, must be unqiue
   */
  name: string;
  /**
   * The name to be shown in the GUI, does not have to be unique.
   */
  displayName?: string;
  /**
   * The type of the widget to be used, this defined the specific gui item that the user interacts with
   */
  type: WidgetType;
  config: T;
  /**
   * Sometimes you want to decative certain values depending on the state of the UI
   * This advanced features allows you to do that
   */
  validations?: Validation[];
}
export interface DataTargetWidget {
  allowedTypes: DataType[];
  required: boolean;
}
export interface MultiDataTargetWidget {
  allowedTypes: DataType[];
  minNumberOfTargets?: number;
  maxNumberOfTargets?: number;
  required: boolean;
}
export interface ListWidget {
  allowedValues: {display: string; value: string}[];
  defaultValue: string;
}
export interface SwitchWidget {
  activeValue: string;
  inactiveValue: string;
  defaultsToActive: boolean;
}
export interface TextWidget {
  text: string;
}
export type SectionWidget = null;
export interface SliderWidget {
  minVal: number;
  maxVal: number;
  step?: number;
  defaultValue: number;
}

export interface Shortcut {
  label: string;
  shortcutFunction: string;
}
export interface ShortcutsWidget {
  shortcuts: Shortcut[];
}
export type FreeTextWidget = {};
export type WidgetSubType =
  | DataTargetWidget
  | MultiDataTargetWidget
  | ListWidget
  | SwitchWidget
  | TextWidget
  | SliderWidget
  | SectionWidget
  | ShortcutsWidget
  | FreeTextWidget;

/**
 * The main configuration object for templates
 */
export interface Template {
  /**
   * The language of the code, determines how the code will be interpreted.
   * Hydra currently supports vega, vega-lite, and it's own data table system
   *
   *  __Default value:__ `vega-lite`
   */
  templateLanguage: string;

  /**
   * The name of the template. Template names must be unique, so this can over-ride other extant templates
   */
  templateName: string;

  /**
   * The description that users will see in the chart chooser gallery
   */
  templateDescription?: string;

  /**
   * The creator of the template
   */
  templateAuthor: string;

  /**
   * The code to be interpreted by the renderer
   */
  code: string;

  /**
   * The mechanism by which users interact with your template
   */
  widgets: Widget<WidgetSubType>[];

  /**
   * Advanced tool for providing special extra cards
   */
  customCards?: CustomCard[];

  /**
   * Whether or not to allow view materialization / fan out
   */
  disallowFanOut?: boolean;
}
export type CustomCard = {name: string; description: string};
/**
 * A widget validation query, executed raw javascript. Parameter values (the value of the current ui)
 * is accessed through parameters.VALUE. E.g. if you wanted to construct a predicate that check if
 * there wasn't a current value for the x dimension called xDim you could do "!parameters.xDim"
 */
export type ValidationQuery = string;

/**
 * What to do in response to the result of the query, should be either 'hide' or 'show'
 */
export type QueryResult = 'show' | 'hide';
export interface Validation {
  /**
   * What to do in response to the result of the query, should be either 'hide' or 'show'
   */
  queryResult: QueryResult;

  /**
   * A widget validation query, executed raw javascript. Parameter values (the value of the current ui)
   * is accessed through parameters.VALUE. E.g. if you wanted to construct a predicate that check if
   * there wasn't a current value for the x dimension called xDim you could do "!parameters.xDim"
   */
  query: string;
}

export interface TemplateMap {
  [key: string]: string | string[];
}

/**
 * Convience container type for the general template widget case
 */
export type GenWidget = Widget<WidgetSubType>;

export interface Suggestion {
  from: string;
  to: string;
  comment: string;
  sideEffect?: (setAllTemplateValues?: GenericAction<TemplateMap>) => GenWidget | null;
  codeEffect?: (code: string) => string;
  simpleReplace: boolean;
}

export interface RendererProps {
  spec: any;
  data: DataRow[];
  onError: (x: any) => any;
}
export interface HydraExtension {
  /**
   * React Component containing the rendering logic for this language
   */
  renderer: (props: RendererProps) => JSX.Element;
  /**
   * Given a code block and the collection of widgets, try to come up with suggestions to parameterize the code
   * @param code
   * @param widgets
   * @return Suggestions[]
   */
  suggestion: (code: string, widgets: GenWidget[], columns: ColumnHeader[]) => Suggestion[];
  language: string;
  blankTemplate: Template;
}

export type DataRow = {[x: string]: any};
