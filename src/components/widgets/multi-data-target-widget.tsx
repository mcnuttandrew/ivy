import React from 'react';
import {MultiDataTargetWidget, TemplateWidget} from '../../templates/types';
import {DataType} from '../../types';
import {GeneralWidget} from './general-widget';
import TemplateMultiShelf from '../template-multi-shelf';
import DataSymbol from '../data-symbol';
import {trim} from '../../utils';

const DATA_TYPES: DataType[] = ['MEASURE', 'DIMENSION', 'TIME'];

export default function MultiDataTargetComponent(
  props: GeneralWidget<TemplateWidget<MultiDataTargetWidget>>,
): JSX.Element {
  const {widget, idx, setWidgetValue, editMode, templateMap, columns, setTemplateValue} = props;
  const fieldValue = templateMap[widget.name];
  const allowedTypesSet = new Set(widget.config.allowedTypes);
  return (
    <div>
      <TemplateMultiShelf
        channelEncodings={(Array.isArray(fieldValue) ? (fieldValue as string[]) : []).map(trim)}
        field={widget.name}
        columns={columns}
        onDrop={setTemplateValue}
        widget={widget}
        setName={editMode ? (value: string): any => setWidgetValue('name', value, idx) : null}
      />
      {editMode && (
        <div className="flex-down">
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
      )}
    </div>
  );
}
