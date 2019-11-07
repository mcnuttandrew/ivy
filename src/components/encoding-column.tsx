import React from 'react';
import {FaEraser} from 'react-icons/fa';
import {GenericAction} from '../actions/index';
import Shelf from './shelf';
import Filter from './filter';
import FilterTarget from './filter-target';
import {ColumnHeader} from '../types';
import Selector from './selector';
import {get} from '../utils';

import {PRIMITIVE_MARKS} from 'vega-lite/build/src/mark';

const MARK_TYPES = PRIMITIVE_MARKS.sort().map((x: string) => ({
  display: x,
  value: x,
}));

interface EncodingColumnProps {
  spec: any;
  iMspec: any;
  columns: ColumnHeader[];
  metaColumns: ColumnHeader[];
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
      metaColumns,
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
    const encoding = get(spec, ['spec', 'encoding']) || get(spec, ['encoding']);
    const makeShelf = (disable: boolean) => (channel: string) => (
      <Shelf
        setEncodingParameter={setEncodingParameter}
        column={encoding[channel]}
        field={channel}
        key={channel}
        columns={columns}
        metaColumns={metaColumns}
        onDrop={onDrop}
        iMspec={iMspec}
        setNewSpec={setNewSpec}
        disable={disable}
      />
    );
    return (
      <div className="flex-down column full-height background-3">
        {/* ENCODING STUFF */}
        <div className="flex space-between">
          <h1 className="section-title flex"> Encoding </h1>
          <div className="clear-encoding" onClick={clearEncoding}>
            <FaEraser />
            Clear
          </div>
        </div>
        <div className="flex-down section-body">
          {['x', 'y'].map(makeShelf(false))}
        </div>

        {/* MARK STUFF */}
        <div className="flex space-between center">
          <h1 className="section-title"> Marks </h1>
          <div>
            <Selector
              selectedValue={
                get(spec, ['mark', 'type']) ||
                get(spec, ['mark']) ||
                get(spec, ['spec', 'mark', 'type']) ||
                get(spec, ['spec', 'mark']) ||
                ''
              }
              onChange={value => changeMarkType(value)}
              options={MARK_TYPES}
            />
          </div>
        </div>
        <div className="flex-down section-body">
          {['size', 'color', 'shape', 'detail', 'text'].map(makeShelf(false))}
        </div>

        {/* FACET STUFF */}
        <div className="flex space-between">
          <h1 className="section-title flex"> Repeat / Small Multiply </h1>
        </div>
        <div className="flex-down section-body">
          {['column', 'row'].map(makeShelf(get(spec, ['spec', 'encoding'])))}
        </div>

        <h1 className="section-title"> Filter </h1>
        <div className="flex-down">
          {(spec.transform || get(spec, ['spec', 'transform']) || []).map(
            (filter: any, idx: number) => {
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
            },
          )}
        </div>
        <div>
          <FilterTarget onDrop={onDropFilter} />
        </div>
      </div>
    );
  }
}
