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

export const configurationOptions: any = {
  x: {
    aggregation: ['count', 'min', 'max', 'sum', 'mean', 'median', 'mode'],
  },
  y: {
    aggregation: ['count', 'min', 'max', 'sum', 'mean', 'median', 'mode'],
  },
};
