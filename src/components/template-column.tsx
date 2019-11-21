import React from 'react';
import {GenericAction} from '../actions/index';
import {ColumnHeader} from '../types';
import {Template, TemplateWidget, TextWidget} from '../constants/templates';
import TemplateShelf from './template-shelf';

interface TemplateColumnProps {
  templateMap: any;
  template: Template;
  columns: ColumnHeader[];
  onDrop: GenericAction;
}
export default class TemplateColumn extends React.Component<TemplateColumnProps> {
  renderDataTargetWidget(widget: TemplateWidget) {
    const {templateMap, columns, onDrop} = this.props;
    return (
      <div key={widget.widgetName}>
        <TemplateShelf
          channelEncoding={templateMap[widget.widgetName]}
          field={widget.widgetName}
          columns={columns}
          onDrop={onDrop}
        />
      </div>
    );
  }

  renderTextWidget(generalWidget: TemplateWidget) {
    // @ts-ignore
    const widget: TextWidget = generalWidget;
    return <div key={widget.widgetName}>{widget.text}</div>;
  }
  render() {
    const {template} = this.props;
    // NEXT STEPS KATY
    // 1. make widgets have a configurable UI presence
    // 5. make default view be composed of a automatically filled out versions of the templates

    return (
      <div className="column">
        <h1 className="section-title flex"> {template.templateName}</h1>
        <div>
          {template.widgets.map(widget => {
            if (widget.widgetType === 'DataTarget') {
              return this.renderDataTargetWidget(widget);
            }
            if (widget.widgetType === 'Text') {
              return this.renderTextWidget(widget);
            }
            return <div key={widget.widgetName}>{widget.widgetName}</div>;
          })}
        </div>
      </div>
    );
  }
}
