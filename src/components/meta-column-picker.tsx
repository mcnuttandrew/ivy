import React from 'react';
import {ColumnHeader} from '../types';
import {GenericAction} from '../actions/index';
import {extractFieldStringsForType} from '../utils';

interface MetaColumnPickerTypes {
  // TODO fix these terrible types
  iMspec: any;
  field: string;
  columns: ColumnHeader[];
  setRepeats: GenericAction;
}

export default function MetaColumnPicker({
  field,
  iMspec,
  columns,
  setRepeats,
}: MetaColumnPickerTypes) {
  const selectedDomain = iMspec.getIn(['repeat', field]).toJS() || [];
  const selectedVals = new Set(selectedDomain);
  const domain = columns.map((column: ColumnHeader) => column.field);
  const set = (repeats: string[]) => setRepeats({target: field, repeats});
  const options = [
    {
      name: 'Select All',
      effect: () => set(domain),
    },
    {name: 'Clear all', effect: () => set([])},
    {
      name: 'Measures Only',
      effect: () => set(extractFieldStringsForType(columns, 'MEASURE')),
    },
    {
      name: 'Dimensions Only',
      effect: () => set(extractFieldStringsForType(columns, 'DIMENSION')),
    },
    {
      name: 'Time Only',
      effect: () => set(extractFieldStringsForType(columns, 'TIME')),
    },
  ];
  console.log('????', selectedDomain);
  return (
    <div className="flex-down filter-container">
      <div className="filter-contents">
        <div className="flex-down">
          <div className="flex space-between">
            <div className="flex meta-column-filter-option-container">
              {options.map(({name, effect}: any) => (
                <div className="meta-column-filter-option" onClick={effect}>
                  {name}
                </div>
              ))}
            </div>
            <div className="meta-column-filter-count">{`(${
              (selectedDomain || []).length
            } / ${domain.length})`}</div>
          </div>
          {domain.map((option: string) => {
            return (
              <div key={`${option}-${field}-checkbox`}>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedVals.has(option)}
                    onChange={() => {
                      if (selectedVals.has(option)) {
                        selectedVals.delete(option);
                      } else {
                        selectedVals.add(option);
                      }
                      console.log(Array.from(selectedVals));
                      setRepeats({
                        target: field,
                        repeats: Array.from(selectedVals),
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