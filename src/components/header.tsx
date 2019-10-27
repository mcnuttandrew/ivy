import React from 'react';
import {MdUndo, MdRedo} from 'react-icons/md';
import {GenericAction} from '../actions/index';
import {classnames} from '../utils';

interface HeaderProps {
  triggerUndo: GenericAction;
  triggerRedo: GenericAction;
  canRedo: boolean;
  canUndo: boolean;
}

export default class Header extends React.Component<HeaderProps> {
  render() {
    const {triggerUndo, triggerRedo, canRedo, canUndo} = this.props;
    return (
      <div className="header flex full-width background-1">
        <img
          src="./logo.png"
          alt="logo showing a chart inside of a warning symbol"
        />
        <div>Untitled Data Exploration Experience</div>
        <div className="flex state-action-controls">
          <div
            className={classnames({
              'action-deactivated': !canUndo,
              'state-action-button': true,
            })}
            onClick={canUndo ? triggerUndo : () => {}}
          >
            <MdUndo /> <span>UNDO</span>
          </div>
          <div
            className={classnames({
              'action-deactivated': !canRedo,
              'state-action-button': true,
            })}
            onClick={canRedo ? triggerRedo : () => {}}
          >
            <MdRedo />
            <span>REDO</span>
          </div>
        </div>
      </div>
    );
  }
}
