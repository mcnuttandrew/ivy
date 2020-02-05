import React from 'react';
import {TiArrowBack, TiArrowForward} from 'react-icons/ti';
import Popover from './popover';
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
      <div className="header flex full-width background-1">
        <img src="logo.png" />
        <div>Hydra</div>
        <div className="flex state-action-controls">
          <div
            className={classnames({
              'action-deactivated': !canUndo,
              'state-action-button': true,
            })}
            onClick={(): void => {
              (canUndo ? triggerUndo : NULL)();
            }}
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
        <Popover
          clickTarget={<div className="about-bar">Template + Settings = Visualization (Learn More)</div>}
          body={(): JSX.Element => (
            <div>
              <h1>About this application</h1>
              <div>Terminology, etc</div>
            </div>
          )}
        />
      </div>
    );
  }
}
