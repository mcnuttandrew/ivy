import React from 'react';
import {TiArrowBack, TiArrowForward} from 'react-icons/ti';
import Tooltip from 'rc-tooltip';
import {GenericAction} from '../actions/index';
import {classnames, NULL} from '../utils';

interface HeaderProps {
  triggerUndo: GenericAction<void>;
  triggerRedo: GenericAction<void>;
  canRedo: boolean;
  canUndo: boolean;
}

export default class Header extends React.Component<HeaderProps> {
  render(): JSX.Element {
    const {triggerUndo, triggerRedo, canRedo, canUndo} = this.props;
    return (
      <div className="header flex background-1">
        <div className="flex center">
          <img alt="hydra logo" src="logo.png" />
          <div>Hydra</div>
          <div className="flex state-action-controls">
            <div
              className={classnames({
                'action-deactivated': !canUndo,
                'state-action-button': true,
              })}
              onClick={(): any => (canUndo ? triggerUndo : NULL)()}
            >
              <TiArrowBack /> <span>UNDO</span>
            </div>
            <div
              className={classnames({
                'action-deactivated': !canRedo,
                'state-action-button': true,
              })}
              onClick={(): void => {
                (canRedo ? triggerRedo : NULL)();
              }}
            >
              <TiArrowForward />
              <span>REDO</span>
            </div>
          </div>
        </div>
        <Tooltip
          placement="bottom"
          trigger="click"
          overlay={
            <div>
              <h1>About this application</h1>
              <div>Terminology, etc</div>
            </div>
          }
        >
          <div className="about-bar">Template + Settings = Visualization (Learn More)</div>
        </Tooltip>
      </div>
    );
  }
}
