import React from 'react';
import {GenericAction} from '../actions/index';
import {classnames} from '../utils';
import {Spec} from 'vega-typings';
import {VegaTheme} from '../types';

const VEGA_THEMES = [
  'dark',
  'excel',
  'fivethirtyeight',
  'ggplot2',
  'latimes',
  'quartz',
  'urbaninstitute',
  'vox',
];
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
        <select
          value={currentTheme}
          onChange={({target: {value}}) => changeTheme(value)}
        >
          {VEGA_THEMES.map(theme => {
            return (
              <option value={theme} key={theme}>
                {theme}
              </option>
            );
          })}
        </select>
      </div>
    </div>
  );
}
