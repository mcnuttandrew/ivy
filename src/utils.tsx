import React from 'react';
import {
  TiSortNumerically,
  TiSortAlphabetically,
  TiCalendar,
} from 'react-icons/ti';

import {DataType, ColumnHeader} from './types';

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
    case 'METADATA':
      return <span>?</span>;
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

type findField = (
  state: any,
  targetField: string,
  table?: string,
) => ColumnHeader;
export const findField: findField = (state, targetField, table = 'columns') => {
  return state
    .get(table)
    .find(({field}: {field: string}) => field === targetField);
};

function compareObjects(a: any, b: any) {
  return JSON.stringify(a) === JSON.stringify(b);
}

const DEFAULT_CONFIG = {
  facet: {width: 150, height: 150},
  overlay: {line: true},
  scale: {useRawDomain: false},
};

export function cleanSpec(spec: any) {
  return {
    config: DEFAULT_CONFIG,
    padding: 50,
    ...spec,
    encoding: {
      ...Object.entries(spec.encoding).reduce((acc: any, [key, val]) => {
        if (!compareObjects(val, {})) {
          acc[key] = val;
        }
        return acc;
      }, {}),
    },
  };
}
