import React from 'react';

import {Spec} from 'vega-typings';

interface EncodingColumnProps {
  spec?: Spec;
}
export default class EncodingColumn extends React.Component<EncodingColumnProps> {
  render() {
    return (
      <div className="flex-down column full-height background-3">
        <h1> Encoding </h1>
        <div className="flex-down">{['x', 'y', 'column', 'row']}</div>
        <h1> Marks </h1>
        <div className="flex-down">
          {['size', 'color', 'shape', 'detail', 'text']}
        </div>
        <h1> Filter </h1>
      </div>
    );
  }
}
