import {DataTransform, DataRow} from '../types';

export function wrangle(data: DataRow[], transforms: DataTransform[]): any {
  const predicates = transforms.map(d => (row: DataRow): boolean => {
    const fieldVal = row[d.filter.field];
    switch (d.filter.type) {
      case 'DIMENSION':
        return !!d.filter.range.find((key: string) => key === fieldVal);
      case 'MEASURE':
        return Number(fieldVal) >= d.filter.range[0] && Number(fieldVal) <= d.filter.range[1];
      case 'TIME':
        return new Date(fieldVal) >= d.filter.range[0] && new Date(fieldVal) <= d.filter.range[1];
      default:
        return true;
    }
  });
  return data.filter(row => predicates.every(pred => pred(row)));
}
