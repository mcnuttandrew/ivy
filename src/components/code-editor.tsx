import React from 'react';
import MonacoEditor from 'react-monaco-editor';
import {MdPlayCircleOutline} from 'react-icons/md';
import stringify from 'json-stringify-pretty-compact';
import {FaAngleDown, FaAngleUp} from 'react-icons/fa';
import {MdSettings} from 'react-icons/md';

import Popover from './popover';
import Selector from './selector';
import {EDITOR_OPTIONS} from '../constants/index';
import {GenericAction} from '../actions';
import {Template, TemplateMap} from '../templates/types';
import {classnames, serializeTemplate} from '../utils';
import {synthesizeSuggestions, takeSuggestion, Suggestion} from '../utils/introspect';

interface Props {
  addWidget?: GenericAction;
  codeMode: string;
  editorError: null | string;
  setCodeMode: GenericAction;
  setNewSpecCode: GenericAction;
  spec: any;
  specCode: string;
  template?: Template;
  templateMap?: TemplateMap;
}
type updateMode = 'automatic' | 'manual';
interface State {
  error?: string;
  suggestionBox: boolean;
  updateMode: updateMode;
}

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
];

export default class CodeEditor extends React.Component<Props, State> {
  constructor(props: any) {
    super(props);
    this.editorDidMount = this.editorDidMount.bind(this);
    this.handleCodeUpdate = this.handleCodeUpdate.bind(this);
    this.state = {
      error: null,
      updateMode: 'automatic',
      suggestionBox: false,
    };
  }
  editorDidMount(editor: any): void {
    editor.focus();
    /* eslint-disable */
    // @ts-ignore
    import('monaco-themes/themes/Chrome DevTools.json').then(data => {
      // @ts-ignore
      monaco.editor.defineTheme('cobalt', data);
      // @ts-ignore
      monaco.editor.setTheme('cobalt');
    });
    /* eslint-enable */
  }

  getCurrentCode(): string {
    const {template, codeMode, specCode, spec, templateMap} = this.props;
    if (codeMode === 'CODE') {
      return template ? template.code : specCode;
    }
    if (codeMode === 'TEMPLATE') {
      return template ? serializeTemplate(template) : 'TEMPLATE NOT AVAILABLE';
    }
    if (codeMode === 'OUTPUT') {
      return stringify(spec);
    }
    if (codeMode === 'VAR-TAB') {
      return JSON.stringify(templateMap, null, 2);
    }
  }

  editorControls(): JSX.Element {
    const {setNewSpecCode, codeMode} = this.props;
    return (
      <div className="flex-down code-editor-controls">
        <h1>Macros</h1>
        {SHORTCUTS.map((shortcut: any) => {
          const {action, name, description} = shortcut;
          return (
            <div
              className="flex-down"
              key={name}
              onClick={(): void => {
                if (codeMode !== 'CODE') {
                  return;
                }
                setNewSpecCode({
                  code: stringify(action(JSON.parse(this.getCurrentCode()))),
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

  handleCodeUpdate(code: string): void {
    const {setNewSpecCode, codeMode} = this.props;
    if (codeMode === 'TEMPLATE') {
      // TODO allow text editing on template
      // Promise.resolve()
      // .then(() => JSON.parse(code))
      // .then(() => setNewTemplate({code, inError: false}))
      // .catch(() => setNewTemplate({code, inError: true}));
    } else {
      Promise.resolve()
        .then(() => JSON.parse(code))
        .then(() => setNewSpecCode({code, inError: false}))
        .catch(() => setNewSpecCode({code, inError: true}));
    }
  }

  editor(): JSX.Element {
    const {codeMode} = this.props;
    const {updateMode} = this.state;
    const currentCode = this.getCurrentCode();
    return (
      /*eslint-disable react/no-string-refs*/
      <div className="flex full-height">
        <MonacoEditor
          ref="monaco"
          language="json"
          theme="monokai"
          height={'calc(100% - 99px)'}
          value={currentCode}
          options={EDITOR_OPTIONS}
          onChange={(code: string): void => {
            if (codeMode === 'OUTPUT') {
              return;
            }

            if (updateMode === 'automatic') {
              this.handleCodeUpdate(code);
            }
          }}
          editorDidMount={this.editorDidMount}
        />
      </div>
      /*eslint-enable react/no-string-refs*/
    );
  }

  render(): JSX.Element {
    const {editorError, setCodeMode, codeMode, template, addWidget} = this.props;
    const {suggestionBox, updateMode} = this.state;
    const currentCode = this.getCurrentCode();

    // todo this should move out of the render path
    const suggestions =
      (template && codeMode === 'CODE' && synthesizeSuggestions(currentCode, template.widgets || [])) || [];
    console.log(suggestions);
    return (
      <div className="full-height full-width inline-block code-container">
        <div
          className={classnames({
            'error-bar': true,
            'has-error': Boolean(editorError),
          })}
        >
          ERROR
        </div>
        <div className="code-option-tabs">
          <div className="execute-code-control">
            <div
              className="execute-code-control-button"
              onClick={(): void => {
                /* eslint-disable */
                // @ts-ignore
                const model = this.refs.monaco.editor.getModel();
                /* eslint-enable */

                const value = model.getValue();
                this.handleCodeUpdate(value);
              }}
            >
              <MdPlayCircleOutline />
            </div>
            <Selector
              onChange={(newMode): void => {
                this.setState({updateMode: newMode});
              }}
              selectedValue={updateMode}
              options={[
                {display: 'Auto', value: 'automatic'},
                {display: 'Manual', value: 'manual'},
              ]}
            />
          </div>
          {['CODE', 'TEMPLATE', 'OUTPUT', 'VAR-TAB'].map(key => {
            return (
              <div
                className={classnames({
                  'code-option-tab': true,
                  'selected-tab': key === codeMode,
                })}
                key={key}
                onClick={(): any => setCodeMode(key)}
              >
                {key}
              </div>
            );
          })}
          <Popover clickTarget={<MdSettings />} body={(): JSX.Element => this.editorControls()} />
        </div>
        <div className="suggestion-box">
          <div className="suggestion-box-header flex space-between">
            <h5>
              <span>Suggestions</span>
              {suggestions.length ? <span>(!)</span> : ''}
            </h5>
            <div onClick={(): any => this.setState({suggestionBox: !suggestionBox})}>
              {suggestionBox ? <FaAngleDown /> : <FaAngleUp />}
            </div>
          </div>
          {suggestionBox && (
            <div className="suggestion-box-body">
              {template &&
                suggestions.map((suggestion: Suggestion, idx: number) => {
                  const {from, to, comment = '', sideEffect} = suggestion;
                  return (
                    <button
                      onClick={(): void => {
                        this.handleCodeUpdate(takeSuggestion(currentCode, suggestion));
                        if (sideEffect) {
                          addWidget(sideEffect());
                        }
                      }}
                      key={`${from} -> ${to}-${idx}`}
                    >
                      {comment}
                    </button>
                  );
                })}
            </div>
          )}
        </div>
        {this.editor()}
      </div>
    );
  }
}
