import React from 'react';
import {MultiDataTargetWidget} from '../../templates/types';
import {DataType} from '../../types';
import {GeneralWidget} from './general-widget';
import TemplateMultiShelf from '../template-multi-shelf';
import DataSymbol from '../data-symbol';
import {trim} from '../../utils';

const DATA_TYPES: DataType[] = ['MEASURE', 'DIMENSION', 'TIME'];

export default function MultiDataTarget(
  props: GeneralWidget<MultiDataTargetWidget>,
) {
  const {
    widget,
    idx,
    setWidgetValue,
    editMode,
    templateMap,
    columns,
    setTemplateValue,
  } = props;
  const fieldValue = templateMap[widget.widgetName];
  const allowedTypesSet = new Set(widget.allowedTypes);
  return (
    <div>
      <TemplateMultiShelf
        channelEncodings={(Array.isArray(fieldValue)
          ? (fieldValue as string[])
          : []
        ).map(trim)}
        field={widget.widgetName}
        columns={columns}
        onDrop={setTemplateValue}
        widget={widget}
        setName={
          editMode
            ? (value: string) => setWidgetValue('widgetName', value, idx)
            : null
        }
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
                    <div
                      className="flex"
                      key={type}
                      style={{marginRight: '10px'}}
                    >
                      <div>
                        <DataSymbol type={type} />
                      </div>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          if (checked) {
                            allowedTypesSet.delete(type);
                          } else {
                            allowedTypesSet.add(type);
                          }

                          setWidgetValue(
                            'allowedTypes',
                            Array.from(allowedTypesSet),
                            idx,
                          );
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
                onChange={() =>
                  setWidgetValue('required', !widget.required, idx)
                }
                checked={!!widget.required}
              />
            </div>
          </div>
          <div className="flex">
            <div className="flex-down">
              <span className="tool-description">Min Targets</span>
              <input
                value={widget.minNumberOfTargets}
                onChange={event =>
                  setWidgetValue('minNumberOfTargets', event.target.value, idx)
                }
              />
            </div>
            <div className="flex-down">
              <span className="tool-description">Max Targets</span>
              <input
                value={widget.maxNumberOfTargets}
                onChange={event =>
                  setWidgetValue('maxNumberOfTargets', event.target.value, idx)
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
