import React from 'react';
import {useDrop} from 'react-dnd';

import Pill from './pill';
import Selector from './selector';
import {ColumnHeader} from '../types';
import {DataTargetWidget, TemplateWidget, Template} from '../templates/types';
import {classnames, makeCustomType, makeOptionsForDropdown} from '../utils';
import AllowedTypesList from './allowed-types-list';

// TODO this type is a mess, it is very confusing.
interface TemplateShelf {
  /**
   * The current field held in the shelf, can be empty if nothing is there
   */
  shelfValue?: string;

  /**
   * The meta data for the columns
   */
  columns: ColumnHeader[];

  /**
   * The name of the shelf, the write parameter
   */
  shelfName: string;

  /**
   * What to do when something is droped on shelf
   */
  onDrop: any;

  /**
   * The widget that this shelf is contained within
   */
  widget: TemplateWidget<DataTargetWidget>;

  /**
   * The containing template
   */
  template: Template;
}

export default function TemplateShelf(props: TemplateShelf): JSX.Element {
  const {shelfValue, columns, shelfName, onDrop, widget, template} = props;
  const [{isOver, canDrop}, drop] = useDrop({
    accept: 'CARD',
    drop: (item: any) => onDrop({...item, text: `"${item.text}"`, field: shelfName}),
    collect: monitor => ({isOver: monitor.isOver(), canDrop: monitor.canDrop()}),
  });

  const columnHeader =
    columns.find(({field}) => shelfValue && field === shelfValue) ||
    (template.customCards || []).includes(shelfValue)
      ? makeCustomType(shelfValue)
      : null;
  const fieldSelector = (
    <Selector
      useGroups={true}
      options={makeOptionsForDropdown({template, widget, columns})}
      selectedValue={shelfValue || ' '}
      onChange={(text: string): void => {
        onDrop({field: shelfName, type: 'CARD', text: `"${text}"`, disable: false});
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
              containingShelf={shelfName}
              containingField={shelfName}
              column={columnHeader}
              setEncodingParameter={onDrop}
              fieldSelector={fieldSelector}
            />
          )}
          {!shelfValue && !columnHeader && fieldSelector}
        </div>
      </div>
    </div>
  );
}
