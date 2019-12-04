import React from 'react';
import {GenericAction} from '../actions/index';
import {ColumnHeader} from '../types';
import {
  Template,
  TemplateWidget,
  TextWidget,
  ListWidget,
  SwitchWidget,
  DataTargetWidget,
} from '../constants/templates';
import TemplateShelf from './template-shelf';
import Selector from './selector';
import Switch from 'react-switch';

interface TemplateColumnProps {
  templateMap: any;
  template: Template;
  columns: ColumnHeader[];
  setTemplateValue?: GenericAction;
}
// setting dimensions requires that dimension name be wrapped in a string
// here we strip them off so that the channel cencoding can find the correct value
function trim(dimName: string) {
  if (!dimName || dimName.length < 2) {
    return dimName;
  }
  if (dimName[0] === '"' && dimName[dimName.length - 1] === '"') {
    return dimName.slice(1, dimName.length - 1);
  }
  return dimName;
}

export default class TemplateColumn extends React.Component<
  TemplateColumnProps
> {
  renderDataTargetWidget(widget: DataTargetWidget) {
    const {templateMap, columns, setTemplateValue} = this.props;
    return (
      <div key={widget.widgetName}>
        <TemplateShelf
          channelEncoding={trim(templateMap[widget.widgetName])}
          field={widget.widgetName}
          columns={columns}
          onDrop={setTemplateValue}
        />
      </div>
    );
  }

  renderTextWidget(widget: TextWidget) {
    return <div key={widget.widgetName}>{widget.text}</div>;
  }

  renderListWidget(widget: ListWidget) {
    const {templateMap, setTemplateValue} = this.props;
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

  renderSwitchWidget(widget: SwitchWidget) {
    const {templateMap, setTemplateValue} = this.props;
    const isActive = templateMap[widget.widgetName] === widget.activeValue;
    return (
      <div key={widget.widgetName} className="switch-widget">
        <div>{widget.widgetName}</div>
        <Switch
          checked={isActive}
          offColor="#E1E9F2"
          onColor="#36425C"
          height={15}
          checkedIcon={false}
          width={50}
          onChange={() =>
            setTemplateValue({
              field: widget.widgetName,
              text: isActive ? widget.inactiveValue : widget.activeValue,
            })
          }
        />
      </div>
    );
  }
  render() {
    const {template} = this.props;

    return (
      <div className="column">
        <h1 className="section-title flex"> {template.templateName}</h1>
        <div>
          {template.widgets.map(widget => {
            if (widget.widgetType === 'DataTarget') {
              return this.renderDataTargetWidget(widget as DataTargetWidget);
            }
            if (widget.widgetType === 'Text') {
              return this.renderTextWidget(widget as TextWidget);
            }
            if (widget.widgetType === 'List') {
              return this.renderListWidget(widget as ListWidget);
            }
            if (widget.widgetType === 'Switch') {
              return this.renderSwitchWidget(widget as SwitchWidget);
            }
            return <div key={widget.widgetName}>{widget.widgetName}</div>;
          })}
        </div>
      </div>
    );
  }
}
