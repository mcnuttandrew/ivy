import React from 'react';
import {TiDeleteOutline} from 'react-icons/ti';

import {GenericAction} from '../actions/index';
import Selector from './selector';
import {EncodingOption} from '../constants';

interface ConfigurationOptionProps {
  option: EncodingOption;
  iMspec: any;

  setEncodingParameter: GenericAction;
  setNewSpec: GenericAction;
}

export default function ConfigurationOption(props: ConfigurationOptionProps) {
  const {
    option: {optionType, options, optionSetter, optionGetter, optionDefault},
    setNewSpec,
    iMspec,
  } = props;
  return (
    <div key={optionType} className="option-row flex">
      <div className="option-row-label">{optionType}</div>
      <Selector
        options={options}
        selectedValue={optionGetter(iMspec) || ''}
        onChange={(value: any) => setNewSpec(optionSetter(iMspec, value))}
      />

      <div
        className="clear-option"
        onClick={() => setNewSpec(optionSetter(iMspec, optionDefault))}
      >
        <TiDeleteOutline />
      </div>
    </div>
  );
}
