import {DataTransform, DataRow} from '../types';

export function wrangle(data: DataRow[], transforms: DataTransform[]): any {
  const predicates = transforms.map(d => (row: DataRow): boolean => {
    const fieldVal = row[d.filter.field];
    if (d.filter.oneOf) {
      return !!d.filter.oneOf.find((key: string) => key === fieldVal);
    }
    if (d.filter.range) {
      return Number(fieldVal) >= d.filter.range[0] && Number(fieldVal) <= d.filter.range[1];
    }
    return true;
  });
  const fileredData = data.filter(row => predicates.every(pred => pred(row)));
  return fileredData;
}
