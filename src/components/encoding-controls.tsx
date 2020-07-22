/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */
import React from 'react';
import {TiArrowSync, TiPencil, TiFlowChildren} from 'react-icons/ti';
import Tooltip from 'rc-tooltip';
import {GenericAction, ModifyValueOnTemplatePayload} from '../actions/index';
import {Template, LanguageExtension, TemplateMap} from '../types';
import {classnames, getTemplateName} from '../utils';
import {TEMPLATE_BODY} from '../constants/index';
import GALLERY from '../templates/gallery';
import {HoverTooltip} from './tooltips';
import {Link} from 'react-router-dom';
import PublishInstanceTooltip from './publish-instance-tooltip';
import PublishTemplateTooltip from './publish-template-tooltip';
import UnpublishTemplateTooltip from './unpublish-template-tooltip';

// TODO clean props
interface Props {
  chainActions: GenericAction<any>;
  currentlySelectedFile: string;
  fillTemplateMapWithDefaults: GenericAction<void>;
  deleteTemplate: GenericAction<{templateAuthor: string; templateName: string}>;
  editMode: boolean;
  encodingMode: string;
  languages: {[x: string]: LanguageExtension};
  modifyValueOnTemplate: GenericAction<ModifyValueOnTemplatePayload>;
  saveCurrentTemplate: GenericAction<void>;
  setBlankTemplate: GenericAction<{fork: string | null; language: string}>;
  setCodeMode: GenericAction<string>;
  setEditMode: GenericAction<boolean>;
  setProgrammaticView: GenericAction<boolean>;
  template: Template;
  templateSaveState: string;
  templates: Template[];
  templateMap: TemplateMap;
  userName: string;
}

export default function EncodingControls(props: Props): JSX.Element {
  const {
    chainActions,
    currentlySelectedFile,
    fillTemplateMapWithDefaults,
    deleteTemplate,
    languages,
    saveCurrentTemplate,
    setBlankTemplate,
    setCodeMode,
    setEditMode,
    setProgrammaticView,
    template,
    templateMap,
    templateSaveState,
    userName,
  } = props;

  // const canSave = editMode && UPDATE_TEMPLATE[templateSaveState];
  const onGallery = template.templateName === GALLERY.templateName;
  const FULL_BUTTONS = [
    {
      disabled: false,

      icon: <TiPencil />,
      customTooltip: (): JSX.Element => (
        <div className="flex-down">
          <h5>Create Blank Template</h5>
          {Object.keys(languages).map(language => {
            return (
              <button
                type="button"
                key={language}
                onClick={(): void => {
                  chainActions([
                    (): any => setBlankTemplate({fork: null, language}),
                    (): any => setEditMode(true),
                    (): any => setCodeMode(TEMPLATE_BODY),
                    (): any => setProgrammaticView(true),
                  ]);
                }}
              >
                <Link to="/editor">{`New ${language} template`}</Link>
              </button>
            );
          })}
        </div>
      ),
      label: 'New',
      tooltip: 'Create a new blank template, good if you are pasting in some code from somewhere else.',
      delay: 5,
    },
    {
      disabled: onGallery,
      customTooltip: (): JSX.Element => {
        const buildReaction = (forkType: string) => (): any =>
          chainActions([
            (): any => setBlankTemplate({fork: forkType, language: template.templateLanguage}),
            (): any => setEditMode(true),
          ]);
        return (
          <div className="tooltip-internal flex-down">
            <h5>How should we copy the current state?</h5>
            <button type="button" onClick={buildReaction('output')}>
              <Link to="/editor/new">Just output</Link>
            </button>
            <button type="button" onClick={buildReaction('body')}>
              <Link to="/editor/new">Body but not params</Link>
            </button>
            <button type="button" onClick={buildReaction('all')}>
              <Link to="/editor/new">Everything</Link>
            </button>
          </div>
        );
      },
      icon: <TiFlowChildren />,
      label: 'Fork',
      tooltip:
        'Create a new template starting from the current value of "Export To JSON" as the basis of the template.',
      delay: 5,
    },
    {
      disabled: false,
      onClick: fillTemplateMapWithDefaults,
      icon: <TiArrowSync />,
      label: 'Reset',
      tooltip: "Reset the template to it's blank state.",
    },
  ];
  return (
    <div className="template-logo">
      <div className="flex-down full-width">
        <h4>
          <b>Template:</b> {getTemplateName(template)}
        </h4>
        <h5>
          <p>
            <b>Description: </b>
            {template.templateDescription}
          </p>
        </h5>
        <div className="encoding-mode-selector flex-down">
          <div className="flex full-width flex-wrap">
            <h5>
              <b>Actions: </b>
            </h5>
            {FULL_BUTTONS.map(button => {
              const {disabled, onClick, customTooltip, icon, label, tooltip, delay} = button;
              const iconComponent = (
                <React.Fragment>
                  <div className="template-modification-control-icon">{icon}</div>
                  <span className="template-modification-control-label">{label}</span>
                </React.Fragment>
              );
              if (customTooltip) {
                return (
                  <HoverTooltip message={tooltip} key={button.label} delay={delay}>
                    <div
                      className={classnames({
                        'template-modification-control': true,
                        'template-modification-control--disabled': disabled,
                      })}
                    >
                      <Tooltip placement="bottom" trigger="click" overlay={!disabled && customTooltip()}>
                        <span className="flex">{iconComponent}</span>
                      </Tooltip>
                    </div>
                  </HoverTooltip>
                );
              }

              return (
                <div
                  key={button.label}
                  className={classnames({
                    'template-modification-control': true,
                    'template-modification-control--disabled': disabled,
                  })}
                >
                  {/* TODO this should point pull of th */}
                  <HoverTooltip message={tooltip}>
                    <div className="flex" onClick={(): any => onClick()}>
                      {iconComponent}
                    </div>
                  </HoverTooltip>
                </div>
              );
            })}
            <PublishInstanceTooltip
              templateAuthor={template.templateAuthor}
              templateName={template.templateName}
              templateMap={templateMap}
              dataset={currentlySelectedFile}
            />
            {userName === template.templateAuthor && (
              <UnpublishTemplateTooltip
                template={template}
                deleteTemplate={deleteTemplate}
                userName={userName}
              />
            )}
          </div>
        </div>
        {templateSaveState !== 'EQUAL' && (
          <h5>
            <span>Unsaved changes: </span>
            {userName === template.templateAuthor ? (
              <PublishTemplateTooltip template={template} saveCurrentTemplate={saveCurrentTemplate} />
            ) : (
              <span>fork and save to publish</span>
            )}
          </h5>
        )}
      </div>
    </div>
  );
}
