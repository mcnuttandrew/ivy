import React from 'react';
import {Spec} from 'vega-typings';
import {FaEraser} from 'react-icons/fa';
import {GenericAction} from '../actions/index';
import Shelf from './shelf';
import Filter from './filter';
import {ColumnHeader} from '../types';

interface EncodingColumnProps {
  spec: any;
  columns: ColumnHeader[];
  onDrop: any;
  setEncodingParameter: GenericAction;
  clearEncoding: GenericAction;
  changeMarkType: GenericAction;
  updateFilter: GenericAction;
  deleteFilter: GenericAction;
}
export default class EncodingColumn extends React.Component<EncodingColumnProps> {
  render() {
    const {
      columns,
      spec,
      onDrop,
      setEncodingParameter,
      clearEncoding,
      changeMarkType,
      deleteFilter,
      updateFilter,
    } = this.props;
    return (
      <div className="flex-down column full-height background-3">
        <div className="flex space-between">
          <h1 className="section-title flex"> Encoding </h1>
          <div className="clear-encoding" onClick={clearEncoding}>
            <FaEraser />
            Clear
          </div>
        </div>
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
        <div className="flex space-between">
          <h1 className="section-title"> Marks </h1>
          <div>
            <select
              value={spec.mark.type}
              onChange={({target: {value}}) => changeMarkType(value)}
            >
              {[
                'bar',
                'circle',
                'square',
                'tick',
                'line',
                'area',
                'point',
                'geoshape',
                'rule',
                'text',
                'boxplot',
                'errorband',
                'errorbar',
              ].map((mark: string) => {
                return (
                  <option value={mark} key={mark}>
                    {mark}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
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
        <h1 className="section-title"> Filter </h1>
        <div className="flex-down">
          {spec.transform.map((filter: any, idx: number) => {
            return (
              <Filter
                column={columns.find(
                  ({field}) => field === filter.filter.field,
                )}
                spec={spec}
                filter={filter}
                key={`${idx}-filter`}
                updateFilter={(newFilterValue: any) => {
                  updateFilter({newFilterValue, idx});
                }}
                deleteFilter={() => deleteFilter(idx)}
              />
            );
          })}
        </div>
      </div>
    );
  }
}
