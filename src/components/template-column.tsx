import React from 'react';
import {GenericAction} from '../actions/index';
import {ColumnHeader} from '../types';
import {Template, TemplateWidget, TextWidget} from '../constants/templates';
import TemplateShelf from './template-shelf';
import Selector from './selector';

interface TemplateColumnProps {
  templateMap: any;
  template: Template;
  columns: ColumnHeader[];
  setTemplateValue: GenericAction;
}
export default class TemplateColumn extends React.Component<TemplateColumnProps> {
  renderDataTargetWidget(widget: TemplateWidget) {
    const {templateMap, columns, setTemplateValue} = this.props;
    return (
      <div key={widget.widgetName}>
        <TemplateShelf
          channelEncoding={templateMap[widget.widgetName]}
          field={widget.widgetName}
          columns={columns}
          onDrop={setTemplateValue}
        />
      </div>
    );
  }

  renderTextWidget(generalWidget: TemplateWidget) {
    // @ts-ignore
    const widget: TextWidget = generalWidget;
    return <div key={widget.widgetName}>{widget.text}</div>;
  }

  renderListWidget(generalWidget: TemplateWidget) {
    const {templateMap, setTemplateValue} = this.props;
    // @ts-ignore
    const widget: ListWidget = generalWidget;
    return (
      <div key={widget.widgetName} className="list-widget">
        <div>{widget.widgetName}</div>
        <Selector
          options={widget.allowedValues}
          selectedValue={templateMap[widget.widgetName]}
          onChange={(value: any) => {
            setTemplateValue({field: widget.widgetName, text: value});
          }}
        />
      </div>
    );
  }
  render() {
    const {template} = this.props;
    console.log(this.props.templateMap);
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
            if (widget.widgetType === 'List') {
              return this.renderListWidget(widget);
            }
            return <div key={widget.widgetName}>{widget.widgetName}</div>;
          })}
        </div>
      </div>
    );
  }
}
