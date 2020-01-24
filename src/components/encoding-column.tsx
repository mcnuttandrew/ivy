import React from 'react';

import {GenericAction} from '../actions/index';
import Shelf from './shelf';
import {ColumnHeader} from '../types';
import Selector from './selector';
import {get} from '../utils';

const PRIMITIVE_MARKS = ['AREA', 'BAR', 'CIRCLE', 'LINE', 'POINT', 'RECT', 'SQUARE', 'TEXT', 'TICK', 'TRAIL'];

const MARK_TYPES = PRIMITIVE_MARKS.sort().map((x: string) => ({
  display: x,
  value: x,
}));

interface EncodingColumnProps {
  changeMarkType: GenericAction;
  columns: ColumnHeader[];
  metaColumns: ColumnHeader[];
  onDrop: any;
  onDropFilter: any;
  setEncodingParameter: GenericAction;
  setNewSpec: GenericAction;
  showSimpleDisplay: boolean;
  spec: any;
  swapXAndYChannels: GenericAction;
}
export default class EncodingColumn extends React.Component<EncodingColumnProps> {
  render(): JSX.Element {
    const {
      changeMarkType,
      columns,
      metaColumns,
      onDrop,
      setEncodingParameter,
      setNewSpec,
      showSimpleDisplay,
      spec,
      swapXAndYChannels,
    } = this.props;
    const encoding = get(spec, ['spec', 'encoding']) || get(spec, ['encoding']) || {};
    const makeShelf = (disable: boolean) => (channel: string): JSX.Element => (
      <Shelf
        setEncodingParameter={setEncodingParameter}
        column={encoding[channel]}
        field={channel}
        key={channel}
        columns={columns}
        metaColumns={metaColumns}
        onDrop={onDrop}
        spec={spec}
        setNewSpec={setNewSpec}
        showSimpleDisplay={showSimpleDisplay}
        disable={disable}
      />
    );

    return (
      <div className="encoding-column">
        {/* ENCODING STUFF */}
        <h1 className="section-title flex"> Encoding </h1>
        <div className="flex-down section-body">
          {['x', 'y'].map(makeShelf(false))}
          <button onClick={swapXAndYChannels}>Swap X/Y</button>
        </div>

        {/* MARK STUFF */}
        <div className="flex space-between center">
          <h1 className="section-title"> Marks </h1>
          <div>
            <Selector
              selectedValue={(
                get(spec, ['mark', 'type']) ||
                get(spec, ['mark']) ||
                get(spec, ['spec', 'mark', 'type']) ||
                get(spec, ['spec', 'mark']) ||
                ''
              ).toUpperCase()}
              onChange={(value): any => changeMarkType(value.toLowerCase())}
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
      </div>
    );
  }
}
