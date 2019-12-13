import React from 'react';
import {GenericAction} from '../actions/index';
import {classnames} from '../utils';
import {VegaTheme} from '../types';

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
  showProgrammaticMode: boolean;
  changeTheme: GenericAction;
  setProgrammaticView: GenericAction;
}

export default function SecondaryHeader(props: SecondaryHeaderProps) {
  const {
    changeTheme,
    currentTheme,
    showProgrammaticMode,
    setProgrammaticView,
  } = props;
  return (
    <div className="secondary-controls flex-down">
      <h5>SECONDARY CONTROLS</h5>
      <div className="flex space-between">
        <div className="mode-selector flex">
          Text View:{' '}
          {['HIDE', 'SHOW'].map(mode => {
            return (
              <div
                key={mode}
                onClick={() =>
                  setProgrammaticView(mode === 'HIDE' ? false : true)
                }
                className={classnames({
                  'mode-option': true,
                  'selected-mode':
                    (mode === 'HIDE' && !showProgrammaticMode) ||
                    (mode === 'SHOW' && showProgrammaticMode),
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
