import React from 'react';
import {
  TiHomeOutline,
  TiArrowSync,
  TiPencil,
  TiEdit,
  TiFlowChildren,
  TiLockClosed,
  TiLockOpen,
  TiThSmallOutline,
} from 'react-icons/ti';
import {GenericAction, ModifyValueOnTemplatePayload} from '../actions/index';
import {Template} from '../templates/types';
import {classnames, NULL} from '../utils';
import {TEMPLATE_BODY, NONE_TEMPLATE} from '../constants/index';
import Tooltip from 'rc-tooltip';

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
  toggleProgramModal: GenericAction<void>;
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
    setEncodingMode,
    setCodeMode,
    setEditMode,
    template,
    templateSaveState,
    toggleProgramModal,
  } = props;

  const canSave = editMode && UPDATE_TEMPLATE[templateSaveState];
  const isGrammar = !template;
  const FULL_BUTTONS = [
    {
      disabled: false,
      onClick: (): any => toggleProgramModal(),
      icon: <TiThSmallOutline />,
      label: 'Add more templates',
      tooltip: 'View the list of available templates from the online community.',
    },
    {
      disabled: false,
      onClick: (): any =>
        chainActions([
          (): any => setBlankTemplate(false),
          (): any => setEditMode(true),
          (): any => setCodeMode(TEMPLATE_BODY),
        ]),
      icon: <TiPencil />,
      label: 'Blank',
      tooltip: 'Create a new blank template, good if you are pasting in some code from somewhere else.',
    },
    {
      disabled: false,
      onClick: (): any => chainActions([(): any => setBlankTemplate(true), (): any => setEditMode(true)]),
      icon: <TiFlowChildren />,
      label: 'Fork',
      tooltip:
        'Create a new template starting from the current value of "Export To JSON" as the basis of the template.',
    },
    {
      disabled: !canSave || isGrammar,
      onClick: (): void => {
        if (!canSave || isGrammar) {
          return;
        }
        chainActions([(): any => saveCurrentTemplate(), (): any => setEditMode(false)]);
      },
      icon: !canSave || isGrammar ? <TiLockClosed /> : <TiLockOpen />,
      label: 'Save',
      tooltip:
        !canSave || isGrammar
          ? 'There have been no changes made to this template and so doesnt need to be saved'
          : 'Save the current template in to the template store, overwrites anything with the same name.',
    },
    {
      disabled: isGrammar,
      onClick: isGrammar ? NULL : (): any => setEditMode(!editMode),
      icon: <TiEdit />,
      label: editMode ? 'Stop Edit' : 'Start Edit',
      tooltip:
        'Change to edit mode, allows you to modify what gui elements are present and how they visually relate',
    },
    {
      disabled: false,
      onClick: clearEncoding,
      icon: <TiArrowSync />,
      label: 'Reset',
      tooltip: "Reset the template to it's blank state.",
    },
  ];
  return (
    <div className="encoding-mode-selector flex-down">
      <div className="flex space-between full-width flex-wrap">
        <Tooltip
          placement="top"
          trigger="hover"
          overlay={<span className="tooltip-internal">Return to the view of the template gallery.</span>}
        >
          <div className="template-modification-control" onClick={(): any => setEncodingMode(NONE_TEMPLATE)}>
            <div className="template-modification-control-icon">
              <TiHomeOutline />
            </div>
            <span className="template-modification-control-label">Home</span>
          </div>
        </Tooltip>
        {FULL_BUTTONS.map(button => {
          return (
            <Tooltip
              key={button.label}
              placement="top"
              trigger="hover"
              overlay={<span className="tooltip-internal">{button.tooltip} </span>}
            >
              <div
                className={classnames({
                  'template-modification-control': true,
                  'template-modification-control--disabled': button.disabled,
                })}
                onClick={(): any => button.onClick()}
              >
                <div className="template-modification-control-icon">{button.icon}</div>
                <span className="template-modification-control-label">{button.label}</span>
              </div>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}
