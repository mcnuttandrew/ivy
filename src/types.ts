export type DataType = 'MEASURE' | 'DIMENSION' | 'TIME' | 'METACOLUMN';

export interface ColumnHeader {
  type: DataType;
  originalType: DataType;
  secondaryType: string;
  field: string;
  domain: number[] | string[];
  metaColumn?: boolean;
}

export type VegaMark =
  | 'arc'
  | 'area'
  | 'image'
  | 'group'
  | 'line'
  | 'path'
  | 'rect'
  | 'rule'
  | 'shape'
  | 'symbol'
  | 'text'
  | 'trail';

export type VegaTheme = 'excel' | 'ggplot2' | 'quartz' | 'vox' | 'dark';

// https://github.com/microsoft/TypeScript/issues/1897
export interface JsonMap {
  [member: string]: string | number | boolean | null | JsonArray | JsonMap;
}
export type JsonArray = Array<string | number | boolean | null | JsonArray | JsonMap>;
export type Json = JsonMap | JsonArray | string | number | boolean | null;
