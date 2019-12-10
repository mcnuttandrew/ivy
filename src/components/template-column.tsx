import React from 'react';
import {ColumnHeader} from '../types';
import {
  Template,
  TextWidget,
  ListWidget,
  SwitchWidget,
  DataTargetWidget,
  SliderWidget,
} from '../templates/types';
import TemplateShelf from './template-shelf';
import Selector from './selector';
import Switch from 'react-switch';
import {trim} from '../utils';
interface TemplateColumnProps {
  templateMap: any;
  template: Template;
  columns: ColumnHeader[];
  setTemplateValue?: any;
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

  renderSliderWidget(widget: SliderWidget) {
    const {templateMap, setTemplateValue} = this.props;
    const clamp = (v: any) =>
      Math.max(widget.minVal, Math.min(widget.maxVal, Number(v)));
    const setVal = (text: any) =>
      setTemplateValue({field: widget.widgetName, text: clamp(text)});
    return (
      <div className="slide-widget" key={widget.widgetName}>
        <div>{widget.widgetName}</div>
        <div className="flex">
          <input
            type="number"
            value={templateMap[widget.widgetName]}
            onChange={({target: {value}}) => setVal(value)}
          />
          <div className="flex-down">
            <input
              type="range"
              min={widget.minVal}
              max={widget.maxVal}
              value={templateMap[widget.widgetName]}
              onChange={event => setVal(event.target.value)}
              step={widget.step}
              className="slider"
            />
            <div className="flex space-between">
              <span>{widget.minVal}</span>
              <span>{widget.maxVal}</span>
            </div>
          </div>
        </div>
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
            if (widget.widgetType === 'Slider') {
              return this.renderSliderWidget(widget as SliderWidget);
            }
            return <div key={widget.widgetName}>{widget.widgetName}</div>;
          })}
        </div>
      </div>
    );
  }
}
