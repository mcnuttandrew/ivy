import React from 'react';
import {DataTargetWidget, Widget, DataType} from '../../types';
import {trim} from '../../utils';
import {GeneralWidget, WidgetBuilder} from './general-widget';
import Shelf from '../shelf';
import {EditParameterName, EditDisplayName} from './widget-common';
import {classnames} from '../../utils/index';

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
              const toggleType = (): void => {
                if (checked) {
                  allowedTypesSet.delete(type);
                } else {
                  allowedTypesSet.add(type);
                }
                setWidgetValue('allowedTypes', Array.from(allowedTypesSet), idx);
              };
              return (
                <div className="flex" key={type} style={{marginRight: '10px'}}>
                  <div
                    onClick={toggleType}
                    className={classnames({
                      flex: true,
                      'template-card-type-pill': true,
                      [`template-card-type-pill--${type.toLowerCase()}`]: true,
                    })}
                  >
                    {type}
                  </div>
                  <input
                    aria-label={`Allowed checkbox for ${type}`}
                    type="checkbox"
                    checked={checked}
                    onChange={toggleType}
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
            aria-label="Widget is required"
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
  const fieldValue = templateMap.paramValues[widget.name];
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
    materializationOptions: (columns, widget): {name: string; group?: string}[] => {
      const widg = widget as Widget<DataTargetWidget>;
      return columns.map(d => ({
        name: `"${d.field}"`,
        group: widg.config.allowedTypes.includes(d.type) ? 'Recomended' : 'Not Recomended',
      }));
    },
  };
};

export default DataTargetBuilder;
