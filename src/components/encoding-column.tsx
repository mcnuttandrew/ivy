import React from 'react';
import {FaEraser} from 'react-icons/fa';
import {GenericAction} from '../actions/index';
import Shelf from './shelf';
import Filter from './filter';
import FilterTarget from './filter-target';
import {ColumnHeader} from '../types';
import Selector from './selector';

import {PRIMITIVE_MARKS} from 'vega-lite/build/src/mark';

const MARK_TYPES = PRIMITIVE_MARKS.map((x: string) => ({
  display: x,
  value: x,
}));

interface EncodingColumnProps {
  spec: any;
  iMspec: any;
  columns: ColumnHeader[];
  onDrop: any;
  onDropFilter: any;

  changeMarkType: GenericAction;
  clearEncoding: GenericAction;
  deleteFilter: GenericAction;
  setNewSpec: GenericAction;
  setEncodingParameter: GenericAction;
  updateFilter: GenericAction;
}
export default class EncodingColumn extends React.Component<EncodingColumnProps> {
  render() {
    const {
      columns,
      spec,
      iMspec,
      onDrop,
      setEncodingParameter,
      clearEncoding,
      changeMarkType,
      deleteFilter,
      updateFilter,
      onDropFilter,
      setNewSpec,
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
        <div className="flex-down section-body">
          {['x', 'y', 'column', 'row'].map(channel => {
            return (
              <Shelf
                setEncodingParameter={setEncodingParameter}
                column={spec.encoding[channel]}
                field={channel}
                key={channel}
                columns={columns}
                onDrop={onDrop}
                iMspec={iMspec}
                setNewSpec={setNewSpec}
              />
            );
          })}
        </div>
        <div className="flex space-between center">
          <h1 className="section-title"> Marks </h1>
          <div>
            <Selector
              selectedValue={spec.mark.type || spec.mark}
              onChange={value => changeMarkType(value)}
              options={MARK_TYPES}
            />
          </div>
        </div>
        <div className="flex-down section-body">
          {['size', 'color', 'shape', 'detail', 'text'].map(channel => {
            return (
              <Shelf
                setEncodingParameter={setEncodingParameter}
                column={spec.encoding[channel]}
                field={channel}
                key={channel}
                columns={columns}
                onDrop={onDrop}
                iMspec={iMspec}
                setNewSpec={setNewSpec}
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
        <div>
          <FilterTarget onDrop={onDropFilter} />
        </div>
      </div>
    );
  }
}
