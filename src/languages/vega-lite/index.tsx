import {HydraExtension, RendererProps} from '../../types';
import {synthesizeSuggestions} from './suggestions';

import React from 'react';
import {Vega} from 'react-vega';

import {Handler} from 'vega-tooltip';
import {get} from '../../utils';

// This componenent has the simple task of disallowing renders other than when the spec has changed
// in effect it is a modest caching layer. It also allows us to obscure some of the odities of the vega interface
// export default class VegaWrapper extends React.Component<VegaWrapperProps> {
//   shouldComponentUpdate(nextProps: VegaWrapperProps): boolean {
//     // TODO to memoize
//     return JSON.stringify(this.props.spec) !== JSON.stringify(nextProps.spec);
//   }

// }
function VegaLiteRenderer(props: RendererProps): JSX.Element {
  const {spec, data, onError} = props;
  const finalSpec = JSON.parse(JSON.stringify(spec));

  if (!get(finalSpec, ['data', 'values'])) {
    finalSpec.data = {values: data};
  }

  return (
    <Vega
      actions={false}
      onError={onError}
      spec={finalSpec}
      mode="vega-lite"
      tooltip={new Handler({}).call}
    />
  );
}

const VEGA_LITE_CONFIG: HydraExtension = {
  renderer: VegaLiteRenderer,
  suggestion: synthesizeSuggestions,
  language: 'vega-lite',
};

export default VEGA_LITE_CONFIG;
