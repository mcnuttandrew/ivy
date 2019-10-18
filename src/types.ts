export type DataType = 'MEASURE' | 'DIMENSION' | 'TIME';

export interface ColumnHeader {
  type: DataType;
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
