/* eslint-disable react/display-name */
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
import Tooltip from 'rc-tooltip';
import {GenericAction, ModifyValueOnTemplatePayload} from '../actions/index';
import {Template} from '../templates/types';
import {classnames, NULL} from '../utils';
import {TEMPLATE_BODY} from '../constants/index';
import NONE from '../templates/example-templates/none';
import SimpleTooltip from './simple-tooltip';

interface Props {
  chainActions: GenericAction<any>;
  clearEncoding: GenericAction<void>;
  deleteTemplate: GenericAction<string>;
  editMode: boolean;
  encodingMode: string;
  modifyValueOnTemplate: GenericAction<ModifyValueOnTemplatePayload>;
  saveCurrentTemplate: GenericAction<void>;
  setBlankTemplate: GenericAction<{fork: boolean; language: string}>;
  setCodeMode: GenericAction<string>;
  setEditMode: GenericAction<boolean>;
  setProgrammaticView: GenericAction<boolean>;
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
    setCodeMode,
    setEditMode,
    setEncodingMode,
    setProgrammaticView,
    template,
    templateSaveState,
    toggleProgramModal,
  } = props;

  const canSave = editMode && UPDATE_TEMPLATE[templateSaveState];
  const isGrammar = !template;
  const onGallery = template && template.templateName === NONE.templateName;
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

      icon: <TiPencil />,
      customTooltip: (
        <div className="tooltip-internal flex-down">
          <h5>Create Blank Template</h5>
          {['vega-lite', 'vega', 'unit-vis', 'hydra-data-table'].map(language => {
            return (
              <button
                key={language}
                onClick={(): void => {
                  chainActions([
                    (): any => setBlankTemplate({fork: false, language}),
                    (): any => setEditMode(true),
                    (): any => setCodeMode(TEMPLATE_BODY),
                    (): any => setProgrammaticView(true),
                  ]);
                }}
              >{`New ${language} template`}</button>
            );
          })}
        </div>
      ),
      label: 'Blank',
      tooltip: 'Create a new blank template, good if you are pasting in some code from somewhere else.',
    },
    {
      disabled: onGallery,
      onClick: onGallery
        ? NULL
        : (): any =>
            chainActions([
              (): any => setBlankTemplate({fork: true, language: template.templateLanguage}),
              (): any => setEditMode(true),
            ]),
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
      disabled: isGrammar || onGallery,
      onClick: isGrammar || onGallery ? NULL : (): any => setEditMode(!editMode),
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
        <div className="template-modification-control">
          <div className="flex" onClick={(): any => setEncodingMode(NONE.templateName)}>
            <div className="template-modification-control-icon">
              <TiHomeOutline />
            </div>
            <span className="template-modification-control-label">Home</span>
          </div>
          <SimpleTooltip message="Return to the view of the template gallery." />
        </div>
        {FULL_BUTTONS.map(button => {
          const {disabled, onClick, customTooltip, icon, label, tooltip} = button;
          const iconComponent = (
            <React.Fragment>
              <div className="template-modification-control-icon">{icon}</div>
              <span className="template-modification-control-label">{label}</span>
            </React.Fragment>
          );
          if (customTooltip) {
            return (
              <Tooltip key={button.label} placement="bottom" trigger="click" overlay={customTooltip}>
                <div
                  key={button.label}
                  className={classnames({
                    'template-modification-control': true,
                    'template-modification-control--disabled': disabled,
                  })}
                >
                  {iconComponent}
                  <SimpleTooltip message={tooltip} />
                </div>
              </Tooltip>
            );
          }

          console.log(customTooltip);
          return (
            <div
              key={button.label}
              className={classnames({
                'template-modification-control': true,
                'template-modification-control--disabled': disabled,
              })}
            >
              <div className="flex" onClick={(): any => onClick()}>
                {iconComponent}
              </div>

              <SimpleTooltip message={tooltip} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
