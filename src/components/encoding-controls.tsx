import React from 'react';
import {FaEraser, FaSave} from 'react-icons/fa';
import {GoRepoForked} from 'react-icons/go';
import {TiExport} from 'react-icons/ti';
import {IoIosCreate, IoIosSettings} from 'react-icons/io';
import {GenericAction} from '../actions/index';
import EncodingModeSelector from './encoding-mode-selector';
import {Template} from '../templates/types';
import {classnames, NULL} from '../utils';

interface Props {
  chainActions: GenericAction;
  clearEncoding: GenericAction;
  deleteTemplate: GenericAction;
  editMode: boolean;
  encodingMode: string;
  modifyValueOnTemplate: GenericAction;
  saveCurrentTemplate: GenericAction;
  setBlankTemplate: GenericAction;
  setEditMode: GenericAction;
  setEncodingMode: GenericAction;
  showSimpleDisplay: boolean;
  template?: Template;
  templateSaveState: string;
  templates?: Template[];
}

const UPDATE_TEMPLATE: {[x: string]: boolean} = {
  'NOT FOUND': true,
  DIFFERENT: true,
};

function Buttons(props: Props): JSX.Element {
  const {
    chainActions,
    clearEncoding,
    editMode,
    saveCurrentTemplate,
    setBlankTemplate,
    setEditMode,
    showSimpleDisplay,
    template,
    templateSaveState,
  } = props;

  const canSave = editMode && UPDATE_TEMPLATE[templateSaveState];
  const isGrammar = !template;
  const PARTIAL_BUTTONS = [
    {
      disabled: false,
      onClick: clearEncoding,
      icon: <FaEraser />,
      label: 'RESET',
    },
  ];
  const FULL_BUTTONS = [
    {
      disabled: false,
      onClick: (): any => chainActions([(): any => setBlankTemplate(false), (): any => setEditMode(true)]),
      icon: <IoIosCreate />,
      label: 'NEW',
    },
    {
      disabled: false,
      onClick: (): any => chainActions([(): any => setBlankTemplate(true), (): any => setEditMode(true)]),
      icon: <GoRepoForked />,
      label: 'FORK',
    },
    {
      disabled: !canSave || isGrammar,
      onClick: (): void => {
        if (!canSave || isGrammar) {
          return;
        }
        chainActions([(): any => saveCurrentTemplate(), (): any => setEditMode(false)]);
      },
      icon: <FaSave />,
      label: 'SAVE',
    },
    {
      disabled: isGrammar,
      onClick: isGrammar ? NULL : (): any => setEditMode(!editMode),
      icon: <IoIosSettings />,
      label: editMode ? 'STOP EDIT' : 'START EDIT',
    },
  ].concat(PARTIAL_BUTTONS);
  return (
    <div className="flex space-between full-width flex-wrap">
      {(showSimpleDisplay ? PARTIAL_BUTTONS : FULL_BUTTONS).map(button => {
        return (
          <div
            key={button.label}
            className={classnames({
              'template-modification-control': true,
              'template-modification-control--disabled': button.disabled,
            })}
            onClick={button.onClick}
          >
            {button.icon} <span className="template-modification-control-label">{button.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function EncodingControls(props: Props): JSX.Element {
  const {
    chainActions,
    deleteTemplate,
    editMode,
    encodingMode,
    modifyValueOnTemplate,
    setEditMode,
    setEncodingMode,
    showSimpleDisplay,
    template,
    templates,
  } = props;

  return (
    <div className="encoding-mode-selector flex-down">
      <div className="flex full-width  space-between">
        <div className="flex">
          <img src="logo.png" />
          <div className="flex-down">
            {!editMode && <h1 className="section-title">{encodingMode}</h1>}
            {editMode && template && (
              <div className="flex">
                <h1 className="section-title">NAME:</h1>
                <input
                  type="text"
                  value={template.templateName}
                  onChange={(event): any =>
                    modifyValueOnTemplate({
                      value: event.target.value,
                      key: 'templateName',
                    })
                  }
                />
              </div>
            )}
            {!editMode && (
              <h3>{template ? template.templateDescription : 'Tableau-style grammar of graphics'}</h3>
            )}
            {editMode && template && (
              <div className="flex">
                <h1 className="section-title">Description:</h1>
                <input
                  type="text"
                  value={template.templateDescription}
                  onChange={(event): any =>
                    modifyValueOnTemplate({
                      value: event.target.value,
                      key: 'templateDescription',
                    })
                  }
                />
              </div>
            )}
          </div>
        </div>
        {!showSimpleDisplay && (
          <EncodingModeSelector
            setEditMode={setEditMode}
            chainActions={chainActions}
            deleteTemplate={deleteTemplate}
            templates={templates}
            setEncodingMode={setEncodingMode}
            clickTarget={
              <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <span style={{fontSize: 10}}>CHANGE TEMPLATE</span>
                <TiExport />
              </span>
            }
          />
        )}
      </div>
      {Buttons(props)}
    </div>
  );
}
