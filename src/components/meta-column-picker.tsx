import React from 'react';
import {ColumnHeader} from '../types';
import {GenericAction, SetRepeatsPayload} from '../actions/index';
import {extractFieldStringsForType} from '../utils';

interface MetaColumnPickerTypes {
  // TODO fix these terrible types
  spec: any;
  field: string;
  columns: ColumnHeader[];
  setRepeats: GenericAction<SetRepeatsPayload>;
}

export default function MetaColumnPicker({
  field,
  spec,
  columns,
  setRepeats,
}: MetaColumnPickerTypes): JSX.Element {
  const selectedDomain = (spec.repeat && spec.repeat[field]) || [];
  const selectedVals = new Set(selectedDomain);
  const domain = columns.map((column: ColumnHeader) => column.field);
  const set = (repeats: string[]): any => setRepeats({target: field, repeats});
  const options = [
    {
      name: 'Select All',
      effect: (): any => set(domain),
    },
    {name: 'Clear all', effect: (): any => set([])},
    {
      name: 'Measures Only',
      effect: (): any => set(extractFieldStringsForType(columns, 'MEASURE')),
    },
    {
      name: 'Dimensions Only',
      effect: (): any => set(extractFieldStringsForType(columns, 'DIMENSION')),
    },
    {
      name: 'Time Only',
      effect: (): any => set(extractFieldStringsForType(columns, 'TIME')),
    },
  ];

  return (
    <div className="flex-down filter-container">
      <div className="filter-contents">
        <div className="flex-down">
          <div className="flex space-between">
            <div className="flex meta-column-filter-option-container">
              {options.map(({name, effect}: any) => (
                <div key={name} className="meta-column-filter-option" onClick={effect}>
                  {name}
                </div>
              ))}
            </div>
            <div className="meta-column-filter-count">{`(${(selectedDomain || []).length} / ${
              domain.length
            })`}</div>
          </div>
          {domain.map((option: string) => {
            return (
              <div key={`${option}-${field}-checkbox`}>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedVals.has(option)}
                    onChange={(): void => {
                      if (selectedVals.has(option)) {
                        selectedVals.delete(option);
                      } else {
                        selectedVals.add(option);
                      }
                      setRepeats({
                        target: field,
                        repeats: Array.from(selectedVals) as string[],
                      });
                    }}
                  />
                  {option}
                </label>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
