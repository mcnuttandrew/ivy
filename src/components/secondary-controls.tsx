import React from 'react';
import {GenericAction} from '../actions/index';
import {classnames} from '../utils';
import {Spec} from 'vega-typings';

export interface SecondaryHeaderProps {
  changeGUIMode: GenericAction;
  setNewSpecCode: GenericAction;
  selectedGUIMode: string;
  spec?: Spec;
}

export default function SecondaryHeader(props: SecondaryHeaderProps) {
  const {changeGUIMode, setNewSpecCode, spec, selectedGUIMode} = props;
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
    </div>
  );
}
