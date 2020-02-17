import React from 'react';
import {FreeTextWidget, TemplateWidget} from '../../templates/types';
import {GeneralWidget, WidgetBuilder} from './general-widget';
import {EditParameterName, EditDisplayName, Reset, widgetName} from './widget-common';
import {trim} from '../../utils';
import {IgnoreKeys} from 'react-hotkeys';

function FreeTextWidgetConfiguration(props: GeneralWidget<FreeTextWidget>): JSX.Element {
  const {widget, idx, setWidgetValue} = props;
  return (
    <div className="flex-down">
      <EditParameterName widget={widget} idx={idx} setWidgetValue={setWidgetValue} />
      <EditDisplayName widget={widget} idx={idx} setWidgetValue={setWidgetValue} />
    </div>
  );
}

function FreeTextWidgetComponent(props: GeneralWidget<FreeTextWidget>): JSX.Element {
  const {widget, setTemplateValue, templateMap, editMode} = props;
  const field = widget.name;
  return (
    <div className="flex free-text-widget">
      <div className="widget-title">{widgetName(widget, editMode)}</div>
      <IgnoreKeys style={{height: '100%'}}>
        <input
          value={trim((templateMap[widget.name] as string) || '')}
          type="text"
          onChange={(event): any => setTemplateValue({field, text: `"${event.target.value}"`})}
        />
      </IgnoreKeys>
      <Reset
        tooltipLabel={'Reset to free text widget to be empty'}
        onClick={(): any => setTemplateValue({field, text: ''})}
      />
    </div>
  );
}

const FreeTextBuilder: WidgetBuilder = (widget, common) => {
  const widg = widget as TemplateWidget<FreeTextWidget>;
  return {
    controls: <FreeTextWidgetConfiguration {...common} widget={widg} />,
    uiElement: <FreeTextWidgetComponent {...common} widget={widg} />,
  };
};
export default FreeTextBuilder;
