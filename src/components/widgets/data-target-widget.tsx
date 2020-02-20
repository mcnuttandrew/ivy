import React from 'react';
import {DataTargetWidget, Widget, DataType} from '../../templates/types';
import {trim} from '../../utils';
import DataSymbol from '../data-symbol';
import {GeneralWidget, WidgetBuilder} from './general-widget';
import Shelf from '../shelf';
import {EditParameterName, EditDisplayName} from './widget-common';

const DATA_TYPES: DataType[] = ['MEASURE', 'DIMENSION', 'TIME'];

function DataTargetWidgetConfiguration(props: GeneralWidget<DataTargetWidget>): JSX.Element {
  const {widget, idx, setWidgetValue} = props;
  const allowedTypesSet = new Set(widget.config.allowedTypes);

  return (
    <div className="flex-down">
      <div className="flex">
        <EditParameterName widget={widget} idx={idx} setWidgetValue={setWidgetValue} />
        <EditDisplayName widget={widget} idx={idx} setWidgetValue={setWidgetValue} />
      </div>
      <div className="flex space-evenly">
        <div className="flex-down">
          <span className="tool-description">Data Types:</span>
          <div className="flex">
            {DATA_TYPES.map(type => {
              const checked = allowedTypesSet.has(type);
              return (
                <div className="flex" key={type} style={{marginRight: '10px'}}>
                  <div>
                    <DataSymbol type={type} />
                  </div>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(): void => {
                      if (checked) {
                        allowedTypesSet.delete(type);
                      } else {
                        allowedTypesSet.add(type);
                      }
                      setWidgetValue('allowedTypes', Array.from(allowedTypesSet), idx);
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex">
          <span className="tool-description">Required:</span>
          <input
            type="checkbox"
            onChange={(): any => setWidgetValue('required', !widget.config.required, idx)}
            checked={!!widget.config.required}
          />
        </div>
      </div>
    </div>
  );
}

function DataTargetWidgetComponent(props: GeneralWidget<DataTargetWidget>): JSX.Element {
  const {widget, templateMap, columns, setTemplateValue, template} = props;
  const fieldValue = templateMap[widget.name];
  return (
    <Shelf
      shelfValue={trim(fieldValue as string)}
      shelfName={widget.displayName || widget.name}
      fieldKey={widget.name}
      columns={columns}
      onDrop={(x: any): any => setTemplateValue({...x, widgetType: 'DataTarget'})}
      widget={widget}
      template={template}
    />
  );
}

const DataTargetBuilder: WidgetBuilder = (widget, common) => {
  const widg = widget as Widget<DataTargetWidget>;
  return {
    controls: <DataTargetWidgetConfiguration {...common} widget={widg} />,
    uiElement: <DataTargetWidgetComponent {...common} widget={widg} />,
  };
};

export default DataTargetBuilder;
