export type DataType = 'MEASURE' | 'DIMENSION' | 'TIME' | 'METADATA';

export interface ColumnHeader {
  type: DataType;
  originalType: DataType;
  secondaryType: string;
  field: string;
  domain: number[] | string[];
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
