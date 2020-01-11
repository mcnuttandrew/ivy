import React from 'react';

// TODO improve typing
type optionRow = {display: any; value: any; group?: string};
interface SelectorProps {
  onChange: (x: any) => any;
  options: optionRow[];
  selectedValue?: any;
  useGroups?: boolean;
}

function groupBy(options: optionRow[]): {[group: string]: optionRow[]} {
  return options.reduce((acc: {[group: string]: optionRow[]}, option) => {
    acc[option.group] = (acc[option.group] || []).concat(option);
    return acc;
  }, {});
}

function renderOption(
  {display, value}: {display: any; value: any},
  idx: number,
): JSX.Element {
  return (
    <option value={value || ''} key={idx}>
      {display}
    </option>
  );
}

export default function Selector(props: SelectorProps): JSX.Element {
  const {options, onChange, selectedValue, useGroups} = props;
  const groups = useGroups && groupBy(options);
  return (
    <select
      className="hydra-selector"
      value={selectedValue}
      onChange={({target: {value}}): any => onChange(value)}
    >
      {!useGroups && options.map(renderOption)}
      {useGroups &&
        Object.entries(groups).map(([groupName, groupOptions]) => {
          return (
            <optgroup key={groupName} label={groupName}>
              {groupOptions.map(renderOption)}
            </optgroup>
          );
        })}
    </select>
  );
}
