import React from 'react';
import Shelf from './shelf';
import {Spec} from 'vega-typings';
import {ColumnHeader} from '../types';

interface EncodingColumnProps {
  spec: any;
  columns: ColumnHeader[];
}
export default class EncodingColumn extends React.Component<EncodingColumnProps> {
  render() {
    const {columns, spec} = this.props;
    return (
      <div className="flex-down column full-height background-3">
        <h1> Encoding </h1>
        <div className="flex-down">
          {['x', 'y', 'column', 'row'].map(channel => {
            return (
              <Shelf
                currentField={spec.encoding[channel]}
                field={channel}
                key={channel}
                columns={columns}
              />
            );
          })}
        </div>
        <h1> Marks </h1>
        <div className="flex-down">
          {['size', 'color', 'shape', 'detail', 'text'].map(channel => {
            return (
              <Shelf
                currentField={spec.encoding[channel]}
                field={channel}
                key={channel}
                columns={columns}
              />
            );
          })}
        </div>
        <h1> Filter </h1>
      </div>
    );
  }
}
