import React from 'react';
import stringify from 'json-stringify-pretty-compact';
import {TiCog, TiEdit, TiArrowSortedDown, TiArrowSortedUp} from 'react-icons/ti';

import Tooltip from 'rc-tooltip';
import {JSON_OUTPUT, WIDGET_VALUES, WIDGET_CONFIGURATION, TEMPLATE_BODY} from '../constants/index';
import {GenericAction, HandleCodePayload} from '../actions';
import {Template, TemplateMap, GenWidget} from '../templates/types';
import {classnames, get, getTemplateName} from '../utils';
import SimpleTooltip from './simple-tooltip';

const SHORTCUTS = [
  {
    name: 'Add Height/Width',
    action: (code: any): any => {
      const usingNested = !!code.spec;
      if (usingNested) {
        code.spec.height = 500;
        code.spec.width = 500;
      } else {
        code.height = 500;
        code.width = 500;
      }
      return code;
    },
    description: 'Insert height and width values in to the current template',
  },
  {
    name: 'Clean Up',
    action: (code: any): any => code,
    description: 'Clean up the formatting of the current code',
  },
  {
    name: 'Swap x and y',
    action: (code: any): any => {
      if (get(code, ['encoding', 'x', 'field']) && get(code, ['encoding', 'y', 'field'])) {
        const xTemp = code.encoding.x.field;
        code.encoding.x.field = code.encoding.y.field;
        code.encoding.y.field = xTemp;
      }
      return code;
    },
    description: 'Swap the x and y dimensions of encoding if they exist',
  },
];

const fontSizes = [
  {name: 'small', value: 10},
  {name: 'medium', value: 15},
  {name: 'large', value: 20},
];
const lineWraps = [
  {name: 'on', value: true},
  {name: 'off', value: false},
];
interface EditorControlsConfigProps {
  codeMode: string;
  currentCode: string;
  editorFontSize: number;
  editorLineWrap: boolean;
  setEditorFontSize: any;
  setEditorLineWrap: any;
  setNewSpecCode: GenericAction<HandleCodePayload>;
}
function EditorControlsConfig(props: EditorControlsConfigProps): JSX.Element {
  const {
    setNewSpecCode,
    codeMode,
    editorFontSize,
    setEditorFontSize,
    currentCode,
    editorLineWrap,
    setEditorLineWrap,
  } = props;
  const EDITOR_CONTROLS: any[] = [
    {name: 'Font Size', options: fontSizes, update: setEditorFontSize, current: editorFontSize},
    {name: 'Line wrap', options: lineWraps, update: setEditorLineWrap, current: editorLineWrap},
  ];
  return (
    <div className="flex-down code-editor-controls">
      <h3>Controls</h3>
      {EDITOR_CONTROLS.map(control => {
        return (
          <div className="flex" key={control.name}>
            <span>{control.name}</span>
            {control.options.map((row: any) => {
              return (
                <button
                  className={classnames({selected: row.value === control.current})}
                  key={row.name}
                  onClick={(): any => control.update(row.value)}
                >
                  {row.name}
                </button>
              );
            })}
          </div>
        );
      })}
      <h3>Text Manipulation Shortcuts</h3>
      {SHORTCUTS.map((shortcut: any) => {
        const {action, name, description} = shortcut;
        return (
          <div
            className="flex-down"
            key={name}
            onClick={(): void => {
              if (codeMode !== TEMPLATE_BODY) {
                return;
              }
              setNewSpecCode({
                code: stringify(action(JSON.parse(currentCode))),
                inError: false,
              });
            }}
          >
            <button>{name}</button>
            <div>{description}</div>
          </div>
        );
      })}
    </div>
  );
}

interface CodeCollapseProps {
  showProgrammaticMode: boolean;
  setProgrammaticView: GenericAction<boolean>;
  disable?: boolean;
}
export function CodeCollapse(props: CodeCollapseProps): JSX.Element {
  const {showProgrammaticMode, setProgrammaticView, disable} = props;
  return (
    <div
      className={classnames({
        'background-2': true,
        'code-collapse': true,
        collapsed: !showProgrammaticMode,
      })}
      onClick={(): any => {
        if (!disable) {
          setProgrammaticView(!showProgrammaticMode);
        }
      }}
    >
      <div>
        {disable ? 'CODE EDITOR DISABLED ON GALLERY' : showProgrammaticMode ? 'Hide Code' : 'Show Code'}
      </div>
      {disable ? null : showProgrammaticMode ? <TiArrowSortedDown /> : <TiArrowSortedUp />}
    </div>
  );
}

interface CodeEditorControlsProps {
  addWidget?: GenericAction<GenWidget>;
  chainActions: GenericAction<any>;
  codeMode: string;
  currentView: string;
  currentCode: string;
  editMode: boolean;
  editorError: null | string;
  editorFontSize: number;
  editorLineWrap: boolean;
  readInTemplate: GenericAction<HandleCodePayload>;
  readInTemplateMap: GenericAction<HandleCodePayload>;
  setCodeMode: GenericAction<string>;
  setEditMode: GenericAction<boolean>;
  setEditorFontSize: any;
  setEditorLineWrap: any;
  setNewSpecCode: GenericAction<HandleCodePayload>;
  setProgrammaticView: GenericAction<boolean>;
  showProgrammaticMode: boolean;
  spec: any;
  specCode: string;
  template?: Template;
  templateMap?: TemplateMap;
}
export default function CodeEditorControls(props: CodeEditorControlsProps): JSX.Element {
  const {
    chainActions,
    codeMode,
    currentView,
    currentCode,
    editMode,
    editorFontSize,
    editorLineWrap,
    setCodeMode,
    setEditMode,
    setEditorFontSize,
    setEditorLineWrap,
    setNewSpecCode,
    setProgrammaticView,
    showProgrammaticMode,
    template,
  } = props;
  const templateName = `Template: ${getTemplateName(template)}`;
  const BUTTONS = [
    {
      label: templateName,
      buttons: [
        {
          key: TEMPLATE_BODY,
          description:
            'The templatized visualization program. Written in hydralang, may feature conditionals and variable interpolations.',
        },
        {
          key: WIDGET_CONFIGURATION,
          description:
            'The configuration of the GUI elements for this template, modify it to change the configuration and apperance of the widgets.',
        },
      ],
    },
    {
      label: `View: ${currentView}`,
      buttons: [
        {
          key: WIDGET_VALUES,
          description:
            'The current value of the gui widgets, the values here will get combined with the body of the template to produce the out ',
        },
        {
          key: JSON_OUTPUT,
          description:
            'The json output of the template, what is shown here will be evaluated by the renderer for each respective language',
        },
      ],
    },
  ];
  return (
    <div className="code-controls flex background-2 space-between">
      <div className="flex code-option-tabs">
        {BUTTONS.map(({label, buttons}) => {
          return (
            <div
              key={label}
              className={classnames({
                'code-option-tab-section': true,
                'flex-down': true,
                'option-disabled': !editMode && label === templateName,
              })}
            >
              <div className="code-option-section-label">{label}</div>
              <div className="flex">
                {buttons.map(({key, description}) => {
                  return (
                    <div
                      key={key}
                      className={classnames({
                        'code-option-tab': true,
                        flex: true,
                        'selected-tab': key === codeMode,
                      })}
                    >
                      <span onClick={(): any => setCodeMode(key)}>{key}</span>
                      <SimpleTooltip message={description} />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex-down">
        <CodeCollapse showProgrammaticMode={showProgrammaticMode} setProgrammaticView={setProgrammaticView} />
        <div className="flex code-controls-buttons">
          <div className="flex  cursor-pointer">
            <span
              className="flex template-modification-control"
              onClick={(): any =>
                chainActions([
                  (): any => setEditMode(!editMode),
                  (): any => setCodeMode(editMode ? JSON_OUTPUT : TEMPLATE_BODY),
                ])
              }
            >
              <div className="template-modification-control-icon">
                <TiEdit />
              </div>
              <span className="template-modification-control-label">
                {editMode ? 'Stop Edit' : 'Start Edit'}
              </span>
            </span>
            <SimpleTooltip
              message="Change to edit mode, allows you to modify what gui elements are present and how they
                  visually relate"
            />
          </div>
          <Tooltip
            placement="right"
            trigger="click"
            overlay={
              <EditorControlsConfig
                codeMode={codeMode}
                currentCode={currentCode}
                editorFontSize={editorFontSize}
                editorLineWrap={editorLineWrap}
                setEditorFontSize={setEditorFontSize}
                setEditorLineWrap={setEditorLineWrap}
                setNewSpecCode={setNewSpecCode}
              />
            }
          >
            <div className="code-edit-controls-button cursor-pointer">
              <TiCog />
            </div>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
