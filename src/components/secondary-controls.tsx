import React from 'react';
import {GenericAction} from '../actions/index';
import {classnames} from '../utils';
import {VegaTheme} from '../types';

import Selector from './selector';

const VEGA_THEMES = [
  'dark',
  'default',
  'excel',
  'fivethirtyeight',
  'ggplot2',
  'latimes',
  'quartz',
  'urbaninstitute',
  'vox',
].map((x: string) => ({display: x, value: x}));
export interface SecondaryHeaderProps {
  changeTheme: GenericAction;
  currentTheme: VegaTheme;
  setProgrammaticView: GenericAction;
  setSimpleDisplay: GenericAction;
  showProgrammaticMode: boolean;
  showSimpleDisplay: boolean;
}

export default function SecondaryHeader(props: SecondaryHeaderProps): JSX.Element {
  const {
    changeTheme,
    currentTheme,
    setProgrammaticView,
    setSimpleDisplay,
    showProgrammaticMode,
    showSimpleDisplay,
  } = props;
  return (
    <div className="secondary-controls background-2 flex-down">
      <h5>SECONDARY CONTROLS</h5>
      <div className="flex-down">
        <div className="mode-selector flex">
          <span>{'Code: '}</span>
          {['HIDE', 'SHOW'].map(mode => {
            return (
              <div
                key={mode}
                onClick={(): any => setProgrammaticView(mode === 'SHOW')}
                className={classnames({
                  'mode-option': true,
                  'selected-mode':
                    (mode === 'HIDE' && !showProgrammaticMode) || (mode === 'SHOW' && showProgrammaticMode),
                })}
              >
                {mode}
              </div>
            );
          })}
        </div>
        <div className="mode-selector flex">
          <span>{'Input: '}</span>
          {['SIMPLE', 'GOG'].map(mode => {
            return (
              <div
                key={mode}
                onClick={(): any => setSimpleDisplay(mode === 'SIMPLE')}
                className={classnames({
                  'mode-option': true,
                  'selected-mode':
                    (mode === 'GOG' && !showSimpleDisplay) || (mode === 'SIMPLE' && showSimpleDisplay),
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
            onChange={(value): any => changeTheme(value)}
            options={VEGA_THEMES}
            selectedValue={currentTheme}
          />
        </span>
      </div>
    </div>
  );
}
