import React from 'react';
import {
  TiSortNumerically,
  TiSortAlphabetically,
  TiCalendar,
} from 'react-icons/ti';

import {DataType} from './types';

export function classnames(classObject: {[val: string]: boolean}): string {
  return Object.keys(classObject)
    .filter(name => classObject[name])
    .join(' ');
}

export function getUniques(data: any, field: string): string[] {
  return Object.keys(
    data.reduce((acc: {[a: string]: boolean}, row: any) => {
      acc[row[field]] = true;
      return acc;
    }, {}),
  ).sort();
}

export function getDomain(data: any, field: string): number[] {
  type domainType = {min: number, max: number};
  return Object.values(
    data.reduce(
      (acc: domainType, row: any) => {
        return {
          min: Math.min(acc.min, row[field]),
          max: Math.max(acc.max, row[field]),
        };
      },
      {min: Infinity, max: -Infinity},
    ),
  );
}

export function getTypeSymbol(type: DataType): JSX.Element {
  switch (type) {
    case 'MEASURE':
      return <TiSortNumerically />;
    case 'TIME':
      return <TiCalendar />;
    default:
    case 'DIMENSION':
      return <TiSortAlphabetically />;
  }
}

export function executePromisesInSeries(tasks: any): any {
  return tasks.reduce(
    (promiseChain: any, task: any): any => promiseChain.then(task),
    Promise.resolve([]),
  );
}

export function findField(state: any, targetField: string) {
  return state
    .get('columns')
    .find(({field}: {field: string}) => field === targetField);
}
