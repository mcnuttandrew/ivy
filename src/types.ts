import {GenericAction} from './actions/index';
import * as LangType from './lang-types';
export * from './lang-types';
/**
 * The meta data for a particular data column.
 *
 */
export interface ColumnHeader {
  type: LangType.DataType;
  originalType: LangType.DataType;
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
  currentTemplateInstance: LangType.Template;
}
/**
 * vega transform syntax
 */
export interface DataTransform {
  [x: string]: any;
}
export interface UndoRedoStackItem {
  columns: ColumnHeader[];
  currentTemplateInstance: LangType.Template;
  currentView: string;
  encodingMode: string;
  codeMode: string;
  editMode: boolean;
  showProgrammaticMode: boolean;
  templateMap: TemplateMap;
  viewCatalog: ViewCatalog;
  views: string[];
}

export interface AppState {
  // meta-data
  columns: ColumnHeader[];
  currentlySelectedFile: string | null;

  // spec configs
  editMode: boolean;
  editorError: boolean;

  languages: {[x: string]: LanguageExtension};

  // GUI
  codeMode: string;
  currentTemplateInstance: LangType.Template;
  openModal: string | null;
  encodingMode: string;
  showGUIView: boolean;
  showProgrammaticMode: boolean;
  userName: string;

  // undo redo
  redoStack: UndoRedoStackItem[];
  undoStack: UndoRedoStackItem[];
  atomicLock: boolean;

  // view stuff
  currentView: string;
  viewCatalog: ViewCatalog;
  views: string[];

  // template stuff
  templateMap: TemplateMap;
  templates: LangType.Template[];
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

export interface TemplateMap {
  paramValues: {
    [key: string]: string | string[];
  };
  systemValues: {
    dataTransforms: DataTransform[];
    viewsToMaterialize: ViewsToMaterialize;
  };
}

export interface Suggestion {
  from: string;
  to: string;
  comment: string;
  sideEffect?: (setAllTemplateValues?: GenericAction<TemplateMap>) => LangType.GenWidget | null;
  codeEffect?: (code: string) => string;
  simpleReplace: boolean;
}

export interface RendererProps {
  spec: any;
  data: DataRow[];
  onError: (x: any) => any;
}

/**
 * Support for a particular language
 */
export interface LanguageExtension {
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
  suggestion: (code: string, widgets: LangType.GenWidget[], columns: ColumnHeader[]) => Suggestion[];
  language: string;
  blankTemplate: LangType.Template;
}

export type DataRow = {[x: string]: any};
