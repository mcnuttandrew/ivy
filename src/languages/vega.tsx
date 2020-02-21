import {HydraExtension} from '../types';

import React from 'react';
import {Vega} from 'react-vega';
import {RendererProps, Template} from '../types';
import {Handler} from 'vega-tooltip';

function VegaRenderer(props: RendererProps): JSX.Element {
  const {spec, data, onError} = props;
  const finalSpec = JSON.parse(JSON.stringify(spec));

  // this stratagey only supports one data set
  (finalSpec.data || []).forEach((row: any, idx: number) => {
    if (row.values === 'myData') {
      finalSpec.data[idx].values = data;
    }
  });

  return (
    <Vega actions={false} onError={onError} spec={finalSpec} mode="vega" tooltip={new Handler({}).call} />
  );
}

const vegaEmpty: any = {
  $schema: 'https://vega.github.io/schema/vega/v5.json',
  width: 400,
  height: 200,
  padding: 5,
  data: [],
  signals: [],
  scales: [],
  axes: [],
  marks: [],
};
export const BLANK_TEMPLATE: Template = {
  templateAuthor: '',
  templateLanguage: 'vega',
  templateName: 'BLANK TEMPLATE',
  templateDescription: 'FILL IN DESCRIPTION',
  code: JSON.stringify(vegaEmpty, null, 2),
  widgets: [],
};

const VEGA: HydraExtension = {
  renderer: VegaRenderer,
  suggestion: () => [],
  language: 'vega',
  blankTemplate: BLANK_TEMPLATE,
};

export default VEGA;
