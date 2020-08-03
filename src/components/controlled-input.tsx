import React, {useState} from 'react';
interface OnBlurInputProps {
  label: string;
  initialValue: string;
  update: (newVal: string) => any;
}
export default function OnBlurInput(props: OnBlurInputProps): JSX.Element {
  const {label, initialValue, update} = props;
  const [value, setValue] = useState(initialValue);
  return (
    <div className="flex">
      <input
        aria-label={label}
        type="text"
        value={value}
        onChange={(event): any => setValue(event.target.value)}
        onBlur={(): any => update(value)}
      />
      <button type="button">update</button>
    </div>
  );
}
