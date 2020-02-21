import {HydraExtension} from '../../types';

import React from 'react';
import {Vega} from 'react-vega';
import {RendererProps} from '../../types';
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

const VEGA: HydraExtension = {
  renderer: VegaRenderer,
  suggestion: () => [],
  language: 'vega',
};

export default VEGA;
