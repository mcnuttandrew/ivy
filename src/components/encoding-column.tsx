import React from 'react';
import {Spec} from 'vega-typings';
import {GenericAction} from '../actions/index';
import Shelf from './shelf';
import {ColumnHeader} from '../types';

interface EncodingColumnProps {
  spec: any;
  columns: ColumnHeader[];
  onDrop: any;
  setEncodingParameter: GenericAction;
  clearEncoding: GenericAction;
}
export default class EncodingColumn extends React.Component<EncodingColumnProps> {
  render() {
    const {
      columns,
      spec,
      onDrop,
      setEncodingParameter,
      clearEncoding,
    } = this.props;
    return (
      <div className="flex-down column full-height background-3">
        <h1> Encoding </h1>
        <div onClick={clearEncoding}>clear selection</div>
        <div className="flex-down">
          {['x', 'y', 'column', 'row'].map(channel => {
            return (
              <Shelf
                setEncodingParameter={setEncodingParameter}
                currentField={spec.encoding[channel]}
                field={channel}
                key={channel}
                columns={columns}
                onDrop={onDrop}
              />
            );
          })}
        </div>
        <h1> Marks </h1>
        <div className="flex-down">
          {['size', 'color', 'shape', 'detail', 'text'].map(channel => {
            return (
              <Shelf
                setEncodingParameter={setEncodingParameter}
                currentField={spec.encoding[channel]}
                field={channel}
                key={channel}
                columns={columns}
                onDrop={onDrop}
              />
            );
          })}
        </div>
        <h1> Filter </h1>
      </div>
    );
  }
}
