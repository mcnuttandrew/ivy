import React from 'react';
import {TiDeleteOutline} from 'react-icons/ti';
import Switch from 'react-switch';

import {GenericAction, SetTemplateValuePayload} from '../actions/index';
import Selector from './selector';
import {EncodingOption} from '../constants';

interface ConfigurationOptionProps {
  option: EncodingOption;
  spec: any;

  setEncodingParameter: GenericAction<SetTemplateValuePayload>;
  setNewSpec: GenericAction<any>;
}

export default function ConfigurationOption(props: ConfigurationOptionProps): JSX.Element {
  const {
    option: {optionType, optionName, options, optionSetter, optionGetter, optionDefault},
    setNewSpec,
    spec,
  } = props;
  const selected = optionGetter(spec);
  return (
    <div key={optionName} className="option-row flex">
      <div className="option-row-label">{optionName}</div>
      {optionType === 'List' && (
        <Selector
          options={options}
          selectedValue={selected || ''}
          onChange={(value: any): any => setNewSpec(optionSetter(spec, value))}
        />
      )}
      {optionType === 'Switch' && (
        <Switch
          checked={!!selected}
          offColor="#E1E9F2"
          onColor="#36425C"
          height={15}
          checkedIcon={false}
          width={50}
          onChange={(): any => setNewSpec(optionSetter(spec, !selected))}
        />
      )}

      {optionType !== 'Switch' && (
        <div className="clear-option" onClick={(): any => setNewSpec(optionSetter(spec, optionDefault))}>
          <TiDeleteOutline />
        </div>
      )}
    </div>
  );
}
