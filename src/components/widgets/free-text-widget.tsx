import React from 'react';
import {FreeTextWidget, Widget} from '../../types';
import {GeneralWidget, WidgetBuilder} from './general-widget';
import {EditParameterName, EditDisplayName, Reset, widgetName, AddLabelToWidget} from './widget-common';
import {trim} from '../../utils';
import {IgnoreKeys} from 'react-hotkeys';
import Switch from 'react-switch';
import {switchCommon} from '../../constants';

function FreeTextWidgetConfiguration(props: GeneralWidget<FreeTextWidget>): JSX.Element {
  const {widget, idx, setWidgetValue} = props;
  return (
    <div className="flex-down">
      <EditParameterName widget={widget} idx={idx} setWidgetValue={setWidgetValue} />
      <EditDisplayName widget={widget} idx={idx} setWidgetValue={setWidgetValue} />
      <AddLabelToWidget label="use paragraph mode">
        {/* @ts-ignore */}
        <Switch
          {...switchCommon}
          checked={!!widget.config.useParagraph}
          onChange={(): any => setWidgetValue({key: 'useParagraph', value: !widget.config.useParagraph, idx})}
        />
      </AddLabelToWidget>
    </div>
  );
}

function FreeTextWidgetComponent(props: GeneralWidget<FreeTextWidget>): JSX.Element {
  const {widget, setTemplateValue, widgetValue, editMode} = props;
  const field = widget.name;
  const inputProps = {
    value: trim(widgetValue || ''),
    type: 'text',
    onChange: (event: any): any => setTemplateValue({field, text: `"${event.target.value}"`}),
  };
  return (
    <div className="flex free-text-widget">
      <div className="widget-title">{widgetName(widget, editMode)}</div>
      {/* @ts-ignore */}
      <IgnoreKeys style={{height: '100%'}}>
        {!widget.config.useParagraph && <input aria-label={`${widget.name} text box`} {...inputProps} />}
        {widget.config.useParagraph && <textarea aria-label={`${widget.name} text box`} {...inputProps} />}
      </IgnoreKeys>
      <Reset
        tooltipLabel={'Reset to free text widget to be empty'}
        onClick={(): any => setTemplateValue({field, text: ''})}
      />
    </div>
  );
}

const FreeTextBuilder: WidgetBuilder = (widget, common) => {
  const widg = widget as Widget<FreeTextWidget>;
  return {
    controls: <FreeTextWidgetConfiguration {...common} widget={widg} />,
    uiElement: <FreeTextWidgetComponent {...common} widget={widg} />,
    materializationOptions: (): {name: string; group?: string}[] => [],
  };
};
export default FreeTextBuilder;
