import React from 'react';
import MonacoEditor from 'react-monaco-editor';
import {GenericAction} from '../actions';
import {Template, TemplateMap} from '../templates/types';
import {EDITOR_OPTIONS} from '../constants/index';

interface Props {
  currentCode: string;
  codeMode: string;
  chainActions: GenericAction<any>;
  editorFontSize: number;
  setCodeMode: GenericAction<string>;
  setEditMode: GenericAction<boolean>;
  spec: any;
  specCode: string;
  template?: Template;
  templateMap?: TemplateMap;
  updateMode: 'automatic' | 'manual';
  handleCodeUpdate: any;
}

export default class CodeEditor extends React.Component<Props> {
  constructor(props: any) {
    super(props);
    this.editorDidMount = this.editorDidMount.bind(this);
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

  render(): JSX.Element {
    const {
      currentCode,
      editorFontSize,
      codeMode,
      chainActions,
      setCodeMode,
      setEditMode,
      updateMode,
      handleCodeUpdate,
    } = this.props;

    return (
      /*eslint-disable react/no-string-refs*/
      <MonacoEditor
        ref="monaco"
        language="json"
        theme="monokai"
        height={'calc(100%)'}
        value={currentCode}
        options={{...EDITOR_OPTIONS, fontSize: editorFontSize}}
        onChange={(code: string): void => {
          if (codeMode === 'EXPORT TO JSON') {
            chainActions([(): any => setEditMode(true), (): any => setCodeMode('TEMPLATE')]);
            return;
          }

          if (updateMode === 'automatic') {
            handleCodeUpdate(code);
          }
        }}
        editorDidMount={this.editorDidMount}
      />
      /*eslint-en able react/no-string-refs*/
    );
  }
}
