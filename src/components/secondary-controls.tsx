import React from 'react';
import {GenericAction} from '../actions/index';
import {classnames} from '../utils';
import {Spec} from 'vega-typings';
import {VegaTheme} from '../types';
import {Template} from '../constants/templates';

import Selector from './selector';

const VEGA_THEMES = [
  'default',
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
  currentTheme: VegaTheme;
  selectedGUIMode: string;
  spec?: Spec;
  template?: Template;

  changeGUIMode: GenericAction;
  changeTheme: GenericAction;
  setNewSpecCode: GenericAction;
}

export default function SecondaryHeader(props: SecondaryHeaderProps) {
  const {
    changeGUIMode,
    changeTheme,
    currentTheme,
    setNewSpecCode,
    spec,
    selectedGUIMode,
    template,
  } = props;
  return (
    <div className="secondary-controls flex-down">
      <h5>SECONDARY CONTROLS</h5>
      <div className="flex space-between">
        <div className="mode-selector flex">
          Mode:{' '}
          {['GUI', 'PROGRAMMATIC'].map(mode => {
            return (
              <div
                key={mode}
                onClick={() => {
                  changeGUIMode(mode);
                  if (mode === 'PROGRAMMATIC' && !template) {
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
        <span className="flex">
          <span>Theme:</span>
          <Selector
            selectedValue={currentTheme}
            onChange={value => changeTheme(value)}
            options={VEGA_THEMES}
          />
        </span>
      </div>
    </div>
  );
}
