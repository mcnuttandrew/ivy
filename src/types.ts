import {DataType, Template, TemplateMap} from './templates/types';
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
}
export interface UndoRedoStackItem {
  currentView: string;
  currentTemplateInstance: Template;
  encodingMode: string;
  templateMap: TemplateMap;
  views: string[];
  viewCatalog: ViewCatalog;
}

export interface AppState {
  // meta-data
  columns: ColumnHeader[];
  currentlySelectedFile: string;

  // spec configs
  editMode: boolean;
  editorError: boolean;

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

export interface DataReducerState {
  data: {[x: string]: any}[];
}
