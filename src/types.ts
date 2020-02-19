import {DataType} from './templates/types';
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

/**
 * One of 'excel' | 'ggplot2' | 'quartz' | 'vox' | 'dark'
 */
export type VegaTheme = 'excel' | 'ggplot2' | 'quartz' | 'vox' | 'dark';

// https://github.com/microsoft/TypeScript/issues/1897
export interface JsonMap {
  [member: string]: string | number | boolean | null | JsonArray | JsonMap;
}
export type JsonArray = Array<string | number | boolean | null | JsonArray | JsonMap>;
export type Json = JsonMap | JsonArray | string | number | boolean | null;
