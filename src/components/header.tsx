import React from 'react';
import {TiArrowBack, TiArrowForward, TiThSmall, TiHome} from 'react-icons/ti';
import Tooltip from 'rc-tooltip';
import {GenericAction} from '../actions/index';
import {classnames, NULL, toExportStr} from '../utils';
import GALLERY from '../templates/gallery';
import {HoverTooltip} from './tooltips';
import {HOT_KEYS, HOT_KEY_DESCRIPTIONS} from '../constants/index';
import {saveAs} from 'file-saver';
import {Template, Workbook} from '../types';
import {Link} from 'react-router-dom';

interface HeaderProps {
  canRedo: boolean;
  canUndo: boolean;
  encodingMode: string;
  generateWorkbook: () => Workbook;
  loadWorkbook: GenericAction<Workbook>;
  setEncodingMode: GenericAction<string>;
  setModalState: GenericAction<string | null>;
  template: Template;
  triggerRedo: GenericAction<void>;
  triggerUndo: GenericAction<void>;
}

const toBlob = (x: string): any => new Blob([x], {type: 'text/plain;charset=utf-8'});

export default function Header(props: HeaderProps): JSX.Element {
  const {
    canRedo,
    canUndo,
    encodingMode,
    loadWorkbook,
    setEncodingMode,
    setModalState,
    template,
    generateWorkbook,
    triggerRedo,
    triggerUndo,
  } = props;
  const handleSubmit = (useData: boolean) => (d: any): void => {
    const file = useData ? d.dataTransfer.items[0].getAsFile() : d.target.files[0];
    const reader = new FileReader();
    reader.onload = (event): void => {
      loadWorkbook(JSON.parse(event.target.result as any) as Workbook);
    };

    reader.readAsText(file);
  };
  return (
    <div className="header flex background-1">
      <div className="flex center">
        {/* TODO delete */}
        {/* <Tooltip
          placement="bottom"
          trigger="click"
          overlay={
            <div className="flex-down">
              <button
                onClick={(): void => {
                  const fileName = `${toExportStr(template.templateName)}.${toExportStr(
                    template.templateAuthor,
                  )}.ivy.json`;
                  saveAs(toBlob(JSON.stringify(template, null, 2)), fileName);
                }}
              >
                Save current template
              </button>
              <button
                onClick={(): void => {
                  const fileName = window.prompt();
                  saveAs(
                    toBlob(JSON.stringify(generateWorkbook(), null, 2)),
                    `${fileName}.ivy-workbook.json`,
                  );
                }}
              >
                Save current workbook
              </button>

              <label className="workbook-upload">
                <input type="file" onChange={handleSubmit(false)} />
                <label>Load workbook</label>
              </label>
            </div>
          }
        >
          <div className="flex cursor-pointer center">
            <img alt="ivy logo" src="logo.png" />
            <div>Ivy</div>
          </div>
        </Tooltip> */}
        <Link to="/">
          <div className="flex cursor-pointer center">
            <img alt="ivy logo" src="logo.png" />
            <div>Ivy</div>
          </div>
        </Link>

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
          {/* <div className="state-action-button">
            <HoverTooltip message="Add More Templates">
              <div className="flex" onClick={(): any => setModalState('community')}>
                <TiThSmall />
                <span className="template-modification-control-label">Add More Templates</span>
              </div>
            </HoverTooltip>
          </div> */}
          {/* <div className="state-action-button">
            <HoverTooltip message="Return to the view of the template gallery.">
              <div className="flex" onClick={(): any => setEncodingMode(GALLERY.templateName)}>
                <TiHome />
                <span className="template-modification-control-label">
                  {encodingMode === GALLERY.templateName ? 'On Gallery' : 'Return to Gallery'}
                </span>
              </div>
            </HoverTooltip>
          </div> */}
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
      </div>
      <Tooltip
        placement="bottom"
        trigger="click"
        overlay={
          <div className="about-tooltip">
            <h1>About this application</h1>
            <div>Terminology, etc</div>
            {/* <h3>Note</h3>
            <div>
              This application makes heavy use of client-side caching. Safari deletes local storage after 1
              week of disuse, if this is an issue for you make sure you save your templates to your computer.
            </div> */}
            <h3>Hotkeys</h3>
            <ul>
              {Object.entries(HOT_KEYS).map(([key, value]) => {
                return (
                  <li key={key}>
                    {value}: {HOT_KEY_DESCRIPTIONS[key]}
                  </li>
                );
              })}
            </ul>
          </div>
        }
      >
        <div className="about-bar ">Template + Settings = Visualization (Learn More)</div>
      </Tooltip>
    </div>
  );
}
