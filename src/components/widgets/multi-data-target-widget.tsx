import React from 'react';
import {MultiDataTargetWidget, TemplateWidget, DataType} from '../../templates/types';
import {GeneralWidget, WidgetBuilder} from './general-widget';
import TemplateMultiShelf from '../template-multi-shelf';
import DataSymbol from '../data-symbol';
import {trim} from '../../utils';
import {EditParameterName, EditDisplayName} from './widget-common';

const DATA_TYPES: DataType[] = ['MEASURE', 'DIMENSION', 'TIME'];

function MultiDataTargetWidgetConfiguration(props: GeneralWidget<MultiDataTargetWidget>): JSX.Element {
  const {widget, idx, setWidgetValue} = props;
  const allowedTypesSet = new Set(widget.config.allowedTypes);

  return (
    <div className="flex-down">
      <div className="flex">
        <EditParameterName widget={widget} idx={idx} setWidgetValue={setWidgetValue} />
        <EditDisplayName widget={widget} idx={idx} setWidgetValue={setWidgetValue} />
      </div>
      <div className="flex">
        <div className="flex-down">
          <span className="tool-description">Data Types</span>
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
      <div className="flex">
        <div className="flex-down">
          <span className="tool-description">Min Targets</span>
          <input
            value={widget.config.minNumberOfTargets}
            type="number"
            onChange={(event): any => setWidgetValue('minNumberOfTargets', event.target.value, idx)}
          />
        </div>
        <div className="flex-down">
          <span className="tool-description">Max Targets</span>
          <input
            type="number"
            value={widget.config.maxNumberOfTargets}
            onChange={(event): any => setWidgetValue('maxNumberOfTargets', event.target.value, idx)}
          />
        </div>
      </div>
    </div>
  );
}

function MultiDataTargetComponent(props: GeneralWidget<MultiDataTargetWidget>): JSX.Element {
  const {widget, templateMap, columns, setTemplateValue, template} = props;
  const fieldValue = templateMap[widget.name];
  return (
    <div className="multi-data-target-widget">
      <TemplateMultiShelf
        shelfValues={(Array.isArray(fieldValue) ? (fieldValue as string[]) : []).map(trim)}
        shelfName={widget.displayName || widget.name}
        fieldKey={widget.name}
        columns={columns}
        onDrop={setTemplateValue}
        widget={widget}
        template={template}
      />
    </div>
  );
}

const MultiDataTargetBuilder: WidgetBuilder = (widget, common) => {
  const widg = widget as TemplateWidget<MultiDataTargetWidget>;
  return {
    controls: <MultiDataTargetWidgetConfiguration {...common} widget={widg} />,
    uiElement: <MultiDataTargetComponent {...common} widget={widg} />,
  };
};

export default MultiDataTargetBuilder;
