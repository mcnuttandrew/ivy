export type DataType = 'MEASURE' | 'DIMENSION' | 'TIME';

export interface ColumnHeader {
  type: DataType;
  secondaryType: string;
  field: string;
}
