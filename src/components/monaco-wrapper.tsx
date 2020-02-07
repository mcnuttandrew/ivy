import React from 'react';
import MonacoEditor from 'react-monaco-editor';

import {
  EDITOR_OPTIONS,
  JSON_OUTPUT,
  WIDGET_VALUES,
  WIDGET_CONFIGURATION,
  TEMPLATE_BODY,
} from '../constants/index';
import {GenericAction, HandleCodePayload} from '../actions';

interface Props {
  chainActions: GenericAction<any>;
  codeMode: string;
  currentCode: string;
  editMode: boolean;
  editorFontSize: number;
  editorLineWrap: boolean;
  readInTemplate: GenericAction<HandleCodePayload>;
  readInTemplateMap: GenericAction<HandleCodePayload>;
  setCodeMode: GenericAction<string>;
  setEditMode: GenericAction<boolean>;
  setNewSpecCode: GenericAction<HandleCodePayload>;
}

export default class CodeEditor extends React.Component<Props> {
  constructor(props: any) {
    super(props);
    this.editorDidMount = this.editorDidMount.bind(this);
    this.handleCodeUpdate = this.handleCodeUpdate.bind(this);
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

  componentDidUpdate(props: any): void {
    // on change code mode scroll to top
    if (props.codeMode !== this.props.codeMode) {
      /* eslint-disable */
      // @ts-ignore
      this.refs.monaco.editor.setScrollPosition({scrollTop: 0});
      /* eslint-enable */
    }
  }

  handleCodeUpdate(code: string): void {
    const {setNewSpecCode, readInTemplate, readInTemplateMap, codeMode} = this.props;
    const responseFunctionMap: {[x: string]: GenericAction<HandleCodePayload>} = {
      PARAMETERS: readInTemplate,
      SPECIFICATION: readInTemplateMap,
      TEMPLATE: setNewSpecCode,
    };
    Promise.resolve()
      .then(() => JSON.parse(code))
      .then(() => responseFunctionMap[codeMode]({code, inError: false}))
      .catch(() => responseFunctionMap[codeMode]({code, inError: true}));
  }

  render(): JSX.Element {
    const {
      currentCode,
      editorFontSize,
      editorLineWrap,
      codeMode,
      chainActions,
      setCodeMode,
      setEditMode,
    } = this.props;
    return (
      /*eslint-disable react/no-string-refs*/
      <MonacoEditor
        ref="monaco"
        language="json"
        theme="monokai"
        height="100%"
        value={currentCode}
        options={{
          ...EDITOR_OPTIONS,
          fontSize: editorFontSize,
          wordWrap: editorLineWrap ? 'on' : 'off',
        }}
        onChange={(code: string): void => {
          if (codeMode === JSON_OUTPUT) {
            chainActions([(): any => setEditMode(true), (): any => setCodeMode(TEMPLATE_BODY)]);
            return;
          }

          this.handleCodeUpdate(code);
        }}
        editorDidMount={this.editorDidMount}
      />
      /*eslint-en able react/no-string-refs*/
    );
  }
}
