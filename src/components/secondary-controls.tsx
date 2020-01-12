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
  setGuiView: GenericAction;
  setProgrammaticView: GenericAction;
  setSimpleDisplay: GenericAction;
  showGUIView: boolean;
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
    showGUIView,
    setGuiView,
  } = props;

  const BINARY_CONTROLS = [
    {
      label: 'Code',
      options: ['HIDE', 'SHOW'],
      onClick: (mode: string) => (): any => setProgrammaticView(mode === 'SHOW'),
      selectedMode: (mode: string): boolean =>
        (mode === 'HIDE' && !showProgrammaticMode) || (mode === 'SHOW' && showProgrammaticMode),
    },
    {
      label: 'Input',
      options: ['SIMPLE', 'GOG'],
      onClick: (mode: string) => (): any => setSimpleDisplay(mode === 'SIMPLE'),
      selectedMode: (mode: string): boolean =>
        (mode === 'GOG' && !showSimpleDisplay) || (mode === 'SIMPLE' && showSimpleDisplay),
    },
    {
      label: 'GUI',
      options: ['HIDE', 'SHOW'],
      onClick: (mode: string) => (): any => setGuiView(mode === 'SHOW'),
      selectedMode: (mode: string): boolean =>
        (mode === 'HIDE' && !showGUIView) || (mode === 'SHOW' && showGUIView),
    },
  ];
  return (
    <div className="secondary-controls flex-down">
      <h5>SECONDARY CONTROLS</h5>
      <div className="flex-down">
        {BINARY_CONTROLS.map(control => {
          return (
            <div className="mode-selector flex" key={control.label}>
              <span>{`${control.label}: `}</span>
              {control.options.map(mode => {
                return (
                  <div
                    key={mode}
                    onClick={control.onClick(mode)}
                    className={classnames({
                      'mode-option': true,
                      'selected-mode': control.selectedMode(mode),
                    })}
                  >
                    {mode}
                  </div>
                );
              })}
            </div>
          );
        })}

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
