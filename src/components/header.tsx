import React from 'react';
import {TiArrowBack, TiArrowForward} from 'react-icons/ti';
import Tooltip from 'rc-tooltip';
import {GenericAction} from '../actions/index';
import {classnames, NULL} from '../utils';
import GALLERY from '../templates/gallery';

interface HeaderProps {
  triggerUndo: GenericAction<void>;
  triggerRedo: GenericAction<void>;
  canRedo: boolean;
  canUndo: boolean;
  setEncodingMode: GenericAction<string>;
}

export default function Header(props: HeaderProps): JSX.Element {
  const {triggerUndo, triggerRedo, canRedo, canUndo, setEncodingMode} = props;
  return (
    <div className="header flex background-1">
      <div className="flex center">
        <div className="flex cursor-pointer" onClick={(): any => setEncodingMode(GALLERY.templateName)}>
          <img alt="hydra logo" src="logo.png" />
          <div>Ivy</div>
        </div>
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
