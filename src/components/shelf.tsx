import React from 'react';
import {useDrop} from 'react-dnd';

import Pill from './pill';
import Selector from './selector';
import {ColumnHeader, DataTargetWidget, Widget, Template} from '../types';
import {classnames, getOrMakeColumn, makeOptionsForDropdown} from '../utils';
import AllowedTypesList from './allowed-types-list';

// TODO this type is a mess, it is very confusing.
interface Shelf {
  /**
   * The current field held in the shelf, can be empty if nothing is there
   */
  shelfValue?: string;

  /**
   * The meta data for the columns
   */
  columns: ColumnHeader[];

  /**
   * The value to be shown on the shelf
   */
  shelfName: string;

  /**
   * The write parameter
   */
  fieldKey: string;

  /**
   * What to do when something is droped on shelf
   */
  onDrop: any;

  /**
   * The widget that this shelf is contained within
   */
  widget: Widget<DataTargetWidget>;

  /**
   * The containing template
   */
  template: Template;
}

export default function Shelf(props: Shelf): JSX.Element {
  const {shelfValue, columns, shelfName, onDrop, widget, template, fieldKey} = props;
  const [{isOver, canDrop}, drop] = useDrop({
    accept: 'CARD',
    drop: (item: any) => onDrop({...item, text: `"${item.text}"`, field: fieldKey}),
    collect: monitor => ({isOver: monitor.isOver(), canDrop: monitor.canDrop()}),
  });

  const columnHeader = getOrMakeColumn(shelfValue, columns, template);
  const fieldSelector = (
    <Selector
      useGroups={true}
      options={makeOptionsForDropdown({template, widget, columns})}
      selectedValue={shelfValue || ' '}
      onChange={(text: string): void => {
        onDrop({field: fieldKey, type: 'CARD', text: `"${text}"`, disable: false});
      }}
    />
  );
  return (
    <div ref={drop} className="flex-down shelf-container">
      <div className="shelf flex">
        <div className="field-label flex space-around">
          <div className="flex">{shelfName}</div>
          <AllowedTypesList allowedTypes={widget.config.allowedTypes} />
        </div>
        <div className="pill-dropzone">
          {!columnHeader && (
            <div
              className={classnames({
                'blank-pill': true,
                'highlight-drop': isOver || canDrop,
              })}
            >
              {'drop a field here'}
            </div>
          )}
          {shelfValue && columnHeader && (
            <Pill
              inEncoding={true}
              containingShelf={fieldKey}
              containingField={fieldKey}
              column={columnHeader}
              setParam={onDrop}
              fieldSelector={fieldSelector}
            />
          )}
          {!shelfValue && !columnHeader && fieldSelector}
        </div>
      </div>
    </div>
  );
}
