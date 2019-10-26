import React from 'react';
import {GenericAction} from '../actions/index';
import {classnames} from '../utils';
import {Spec} from 'vega-typings';
import {VegaTheme} from '../types';

import Selector from './selector';

const VEGA_THEMES = [
  'dark',
  'excel',
  'fivethirtyeight',
  'ggplot2',
  'latimes',
  'quartz',
  'urbaninstitute',
  'vox',
].map((x: string) => ({display: x, value: x}));
export interface SecondaryHeaderProps {
  changeGUIMode: GenericAction;
  changeTheme: GenericAction;
  setNewSpecCode: GenericAction;
  currentTheme: VegaTheme;
  selectedGUIMode: string;
  spec?: Spec;
}

export default function SecondaryHeader(props: SecondaryHeaderProps) {
  const {
    changeGUIMode,
    changeTheme,
    currentTheme,
    setNewSpecCode,
    spec,
    selectedGUIMode,
  } = props;
  return (
    <div className="secondary-controls flex-down">
      <h5>SECONDARY CONTROLS</h5>
      <div className="mode-selector flex">
        Mode:{' '}
        {['GRAMMAR', 'PROGRAMMATIC'].map(mode => {
          return (
            <div
              key={mode}
              onClick={() => {
                changeGUIMode(mode);
                if (mode === 'PROGRAMMATIC') {
                  setNewSpecCode({
                    code: JSON.stringify(spec, null, 2),
                    inError: false,
                  });
                }
              }}
              className={classnames({
                'mode-option': true,
                'selected-mode': mode === selectedGUIMode,
              })}
            >
              {mode}
            </div>
          );
        })}
      </div>
      <div>
        THEME:
        <Selector
          selectedValue={currentTheme}
          onChange={value => changeTheme(value)}
          options={VEGA_THEMES}
        />
      </div>
    </div>
  );
}
