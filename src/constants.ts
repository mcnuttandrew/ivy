import {VegaMark} from './types';
export const marks: VegaMark[] = [
  'arc',
  'area',
  // 'image',
  // 'group',
  // 'line',
  // 'path',
  'rect',
  // 'rule',
  // 'shape',
  'symbol',
  'text',
  // 'trail',
];

const spatialAggs = [
  {display: 'none', value: undefined},
  {display: 'count', value: 'count'},
  {display: 'min', value: 'min'},
  {display: 'max', value: 'max'},
  {display: 'sum', value: 'sum'},
  {display: 'mean', value: 'mean'},
  {display: 'median', value: 'median'},
  {display: 'mode', value: 'mode'},
];

export const configurationOptions: any = {
  x: {
    aggregate: spatialAggs,
  },
  y: {
    aggregate: spatialAggs,
  },
};
