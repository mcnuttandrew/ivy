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
}

// https://github.com/microsoft/TypeScript/issues/1897
export interface JsonMap {
  [member: string]: string | number | boolean | null | JsonArray | JsonMap;
}
export type JsonArray = Array<string | number | boolean | null | JsonArray | JsonMap>;
export type Json = JsonMap | JsonArray | string | number | boolean | null;
