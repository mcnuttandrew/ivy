import React from 'react';
import {TiCog, TiArrowSortedDown, TiArrowSortedUp} from 'react-icons/ti';

import Tooltip from 'rc-tooltip';
import {JSON_OUTPUT, WIDGET_VALUES, WIDGET_CONFIGURATION, TEMPLATE_BODY} from '../constants/index';
import {GenericAction, HandleCodePayload} from '../actions';
import {TemplateMap, GenWidget} from '../types';
import {classnames} from '../utils';
import {SimpleTooltip} from './tooltips';

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
  editorFontSize: number;
  editorLineWrap: boolean;
  setEditorFontSize: any;
  setEditorLineWrap: any;
}
function EditorControlsConfig(props: EditorControlsConfigProps): JSX.Element {
  const {editorFontSize, setEditorFontSize, editorLineWrap, setEditorLineWrap} = props;
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
                  type="button"
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
  codeMode: string;
  editMode: boolean;
  editorFontSize: number;
  editorLineWrap: boolean;
  readInTemplate: GenericAction<HandleCodePayload>;
  readInTemplateMap: GenericAction<HandleCodePayload>;
  setCodeMode: GenericAction<string>;
  setEditMode: GenericAction<boolean>;
  setEditorFontSize: any;
  setEditorLineWrap: any;
  setProgrammaticView: GenericAction<boolean>;
  showProgrammaticMode: boolean;
  spec: any;
  templateMap: TemplateMap;
}
export default function CodeEditorControls(props: CodeEditorControlsProps): JSX.Element {
  const {
    codeMode,
    editMode,
    editorFontSize,
    editorLineWrap,
    setCodeMode,
    setEditMode,
    setEditorFontSize,
    setEditorLineWrap,
    setProgrammaticView,
    showProgrammaticMode,
  } = props;
  const BUTTONS = [
    {
      key: TEMPLATE_BODY,
      description:
        'The templatized visualization program. Written in ITL, may feature conditionals and variable interpolations.',
    },
    {
      key: WIDGET_CONFIGURATION,
      description:
        'The configuration of the GUI elements for this template, modify it to change the configuration and appearance of the widgets.',
    },
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
  ];
  return (
    <div className="code-controls flex space-between">
      <div className="flex code-option-tabs">
        <div className="flex">
          {BUTTONS.map(({key, description}) => {
            return (
              <div
                key={key}
                className={classnames({
                  'code-option-tab': true,
                  flex: true,
                  'selected-tab': key === codeMode,
                })}
              >
                <span
                  onClick={(): any => {
                    setCodeMode(key);
                    if (!editMode) {
                      setEditMode(true);
                    }
                  }}
                >
                  {key}
                </span>
                <SimpleTooltip message={description} />
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex">
        <div className="flex code-controls-buttons">
          <Tooltip
            placement="right"
            trigger="click"
            overlay={
              <EditorControlsConfig
                editorFontSize={editorFontSize}
                editorLineWrap={editorLineWrap}
                setEditorFontSize={setEditorFontSize}
                setEditorLineWrap={setEditorLineWrap}
              />
            }
          >
            <div className="code-edit-controls-button cursor-pointer">
              <TiCog />
            </div>
          </Tooltip>
        </div>
        <CodeCollapse showProgrammaticMode={showProgrammaticMode} setProgrammaticView={setProgrammaticView} />
      </div>
    </div>
  );
}
