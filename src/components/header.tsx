import React from 'react';
import {TiArrowBack, TiArrowForward} from 'react-icons/ti';
import Tooltip from 'rc-tooltip';
import {GenericAction} from '../actions/index';
import {classnames, NULL} from '../utils';
import {HOT_KEYS, HOT_KEY_DESCRIPTIONS} from '../constants/index';
import {Link, Route} from 'react-router-dom';

interface HeaderProps {
  canRedo?: boolean;
  canUndo?: boolean;
  triggerRedo?: GenericAction<void>;
  triggerUndo?: GenericAction<void>;
}

export default function Header(props: HeaderProps): JSX.Element {
  const {canRedo, canUndo, triggerRedo, triggerUndo} = props;

  return (
    <div className="header flex background-1">
      <div className="flex center">
        <Link to="/">
          <div className="flex cursor-pointer center">
            <img alt="ivy logo" src="logo.png" />
            <div>Ivy</div>
          </div>
        </Link>
        <Route path={['/editor/', '/editor/:x', '/editor/:x/:y', '/editor/:x/:z']}>
          <div className="flex state-action-controls">
            <div
              className={classnames({
                'action-deactivated': !canUndo,
                'state-action-button': true,
              })}
              onClick={(): any => (canUndo ? triggerUndo : NULL)()}
            >
              <TiArrowBack /> <span>Undo</span>
            </div>
            <div
              className={classnames({
                'action-deactivated': !canRedo,
                'state-action-button': true,
              })}
              onClick={(): any => (canRedo ? triggerRedo : NULL)()}
            >
              <TiArrowForward />
              <span>Redo</span>
            </div>
            {/* <a
            className="flex state-action-button"
            href="HIDDEN FOR REVIEW"
            target="_blank"
            rel="noopener noreferrer"
          >
            <TiSocialGithub />
            <span>Report a bug</span>
          </a> */}
          </div>
        </Route>
      </div>

      <div className="about-bar ">
        <Link to="/" className="margin-left">
          Gallery
        </Link>
        <Link to="/editor" className="margin-left">
          Editor
        </Link>
        <Link to="/docs" className="margin-left">
          Docs
        </Link>
        <Route path={['/editor/', '/editor/:x', '/editor/:x/:y', '/editor/:x/:z']}>
          <Tooltip
            placement="bottom"
            trigger="click"
            overlay={
              <div className="about-tooltip">
                <h3>Hotkeys</h3>
                <ul>
                  {Object.entries(HOT_KEYS).map(([key, value]) => (
                    <li key={key}>
                      {value}: {HOT_KEY_DESCRIPTIONS[key]}
                    </li>
                  ))}
                </ul>
              </div>
            }
          >
            <div>Hotkeys</div>
          </Tooltip>
        </Route>
      </div>
    </div>
  );
}
