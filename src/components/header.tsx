import React from 'react';
import {MdUndo, MdRedo} from 'react-icons/md';
import {GenericAction} from '../actions/index';
import {classnames} from '../utils';
import {SHOW_TEMPLATE_CONTROLS} from '../constants/CONFIG';

interface HeaderProps {
  triggerUndo: GenericAction;
  triggerRedo: GenericAction;
  toggleTemplateBuilder: GenericAction;
  canRedo: boolean;
  canUndo: boolean;
}

export default class Header extends React.Component<HeaderProps> {
  render() {
    const {
      triggerUndo,
      triggerRedo,
      canRedo,
      canUndo,
      toggleTemplateBuilder,
    } = this.props;
    return (
      <div className="header flex full-width background-1">
        {/* <img src="logo.png" /> */}
        <div>Hydra</div>
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
        {SHOW_TEMPLATE_CONTROLS && (
          <button onClick={toggleTemplateBuilder}> TEMPLATE BUILDER </button>
        )}
      </div>
    );
  }
}
