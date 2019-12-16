import React from 'react';
import {MultiDataTargetWidget} from '../../templates/types';
import {GeneralWidget} from './general-widget';
import TemplateMultiShelf from '../template-multi-shelf';
import {trim} from '../../utils';

export default function DataTargetBuilderWidget(
  props: GeneralWidget<MultiDataTargetWidget>,
) {
  const {
    widget,
    idx,
    setWidgetValue,
    editMode,
    templateMap,
    columns,
    setTemplateValue,
  } = props;
  if (!editMode) {
    const fieldValue = templateMap[widget.widgetName];
    return (
      <div>
        <TemplateMultiShelf
          channelEncodings={(Array.isArray(fieldValue)
            ? (fieldValue as string[])
            : []
          ).map(trim)}
          field={widget.widgetName}
          columns={columns}
          onDrop={setTemplateValue}
          widget={widget}
        />
      </div>
    );
  }
  return <div className="flex">TODO</div>;
}
