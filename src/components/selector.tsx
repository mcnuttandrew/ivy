import React from 'react';

interface SelectorProps {
  onChange: (x: any) => any;
  options: {display: any; value: any}[];
  selectedValue?: any;
}

export default function Selector(props: SelectorProps): JSX.Element {
  const {options, onChange, selectedValue} = props;

  return (
    <select
      className="hydra-selector"
      value={selectedValue}
      onChange={({target: {value}}): any => onChange(value)}
    >
      {options.map(
        ({display, value}: {display: any; value: any}, idx: number) => (
          <option value={value || ''} key={idx}>
            {display}
          </option>
        ),
      )}
    </select>
  );
}
