import React from 'react';

interface SelectorProps {
  onChange?: (x: any) => any;
  options: any;
  selectedValue?: string;
}

export default function SelectorFUCK(props: SelectorProps) {
  const {options, onChange, selectedValue} = props;

  return (
    <select
      className="hydra-selector"
      value={selectedValue}
      onChange={({target: {value}}) => onChange(value)}
    >
      {options.map(({display, value}: {display: any, value: any}) => (
        <option value={value || ''} key={`${display}`}>
          {display}
        </option>
      ))}
    </select>
  );
}
