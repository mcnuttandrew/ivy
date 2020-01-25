import React from 'react';
import {FaEraser, FaSave} from 'react-icons/fa';
import {GoRepoForked} from 'react-icons/go';
import {IoIosCreate, IoMdCreate} from 'react-icons/io';
import {GenericAction, ModifyValueOnTemplatePayload} from '../actions/index';
import {Template} from '../templates/types';
import {classnames, NULL} from '../utils';

interface Props {
  chainActions: GenericAction<any>;
  clearEncoding: GenericAction<void>;
  deleteTemplate: GenericAction<string>;
  editMode: boolean;
  encodingMode: string;
  modifyValueOnTemplate: GenericAction<ModifyValueOnTemplatePayload>;
  saveCurrentTemplate: GenericAction<void>;
  setBlankTemplate: GenericAction<boolean>;
  setCodeMode: GenericAction<string>;
  setEditMode: GenericAction<boolean>;
  setEncodingMode: GenericAction<string>;
  template?: Template;
  templateSaveState: string;
  templates?: Template[];
}

const UPDATE_TEMPLATE: {[x: string]: boolean} = {
  'NOT FOUND': true,
  DIFFERENT: true,
};

export default function EncodingControls(props: Props): JSX.Element {
  const {
    chainActions,
    clearEncoding,
    editMode,
    saveCurrentTemplate,
    setBlankTemplate,
    setCodeMode,
    setEditMode,
    template,
    templateSaveState,
  } = props;

  const canSave = editMode && UPDATE_TEMPLATE[templateSaveState];
  const isGrammar = !template;
  const FULL_BUTTONS = [
    {
      disabled: false,
      onClick: (): any =>
        chainActions([
          (): any => setBlankTemplate(false),
          (): any => setEditMode(true),
          (): any => setCodeMode('TEMPLATE'),
        ]),
      icon: <IoMdCreate />,
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
      icon: <IoIosCreate />,
      label: editMode ? 'STOP EDIT' : 'START EDIT',
    },
    {
      disabled: false,
      onClick: clearEncoding,
      icon: <FaEraser />,
      label: 'RESET',
    },
  ];
  return (
    <div className="encoding-mode-selector">
      <div className="flex space-between full-width flex-wrap">
        {FULL_BUTTONS.map(button => {
          return (
            <div
              key={button.label}
              className={classnames({
                'template-modification-control': true,
                'template-modification-control--disabled': button.disabled,
              })}
              onClick={(): void => {
                button.onClick();
              }}
            >
              {button.icon} <span className="template-modification-control-label">{button.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
