import React from 'react';
import {List} from 'immutable';
import MonacoEditor from 'react-monaco-editor';
import stringify from 'json-stringify-pretty-compact';

import {GenericAction} from '../actions/index';
import {EDITOR_OPTIONS} from '../constants/index';
import {TemplateWidget, Template} from '../templates/types';
import {widgetFactory} from '../templates';
import Widget from './widgets/general-widget';
import {classnames, allWidgetsInUse} from '../utils';
import {synthesizeSuggestions, takeSuggestion} from '../utils/introspect';

import TemplateColumnPreview from './widget-builder/template-column-preview';
import Selector from './selector';
import {EMPTY_SPEC} from '../reducers/default-state';

import Modal from './modal';

interface Props {
  spec: any;
  toggleTemplateBuilder: GenericAction;
  createTemplate: GenericAction;
  editFrom?: Template;
}

interface State {
  code: string;
  widgets: List<TemplateWidget>;
  templateName?: string;
  templateLanguage: string;
  templateDescription?: string;
  error: boolean;
  // TODO probably remake these into some GUI variables
  showPreview: boolean;
  showTextualTemplate: boolean;
}

export default class TemplateBuilderModal extends React.Component<
  Props,
  State
> {
  constructor(props: Props) {
    super(props);
    const common = {
      error: false,
      showPreview: false,
      showTextualTemplate: false,
    };
    this.state = {
      code: stringify(this.props.spec),
      templateName: null,
      widgets: List(),
      error: false,
      templateDescription: null,
      templateLanguage: 'vega-lite',
      ...common,
    };
    // use an old template
    if (props.editFrom) {
      const {code, templateName, templateDescription, widgets} = props.editFrom;
      this.state = {
        code,
        templateName,
        widgets: widgets.reduce(
          (acc: any, x: TemplateWidget) => acc.push(x),
          List(),
        ),
        templateDescription,
        templateLanguage: 'vega-lite',
        ...common,
      };
    }
    this.editorDidMount = this.editorDidMount.bind(this);
    this.setWidgetValue = this.setWidgetValue.bind(this);
  }
  editorDidMount(editor: any) {
    editor.focus();
  }

  setWidgetValue(key: string, value: any, idx: number) {
    const {code, widgets} = this.state;
    const oldWidget = widgets.get(idx);

    // @ts-ignore
    const oldValue = `\\[${oldWidget[key]}\\]`;
    const re = new RegExp(oldValue, 'g');
    this.setState({
      widgets: widgets.set(idx, {...oldWidget, [key]: value}),
      code: key === 'widgetName' ? code.replace(re, `[${value}]`) : code,
    });
  }

  validatePotentialTemplate() {
    const {code, widgets, templateName, error} = this.state;
    if (!templateName || !templateName.length) {
      return false;
    }
    return !error && allWidgetsInUse(code, widgets);
  }

  codeColumn() {
    const {code, error, widgets} = this.state;
    const {spec} = this.props;

    return (
      <React.Fragment>
        <div className="flex flex-wrap">
          <button
            onClick={() => {
              this.setState({
                code: stringify(EMPTY_SPEC.toJS()),
              });
            }}
          >
            EMPTY VEGALITE SPEC
          </button>
          <button
            onClick={() => {
              this.setState({
                code: stringify(spec),
              });
            }}
          >
            COPY CODE FROM CURRENT SELECTION
          </button>
          <button onClick={() => {}}>FORK EXTANT TEMPLATE</button>
          <button
            onClick={() => {
              this.setState({
                code: stringify(JSON.parse(code)),
              });
            }}
          >
            CLEAN UP
          </button>
        </div>
        <div className="code-wrapper">
          <div
            className={classnames({
              'error-bar': true,
              'has-error': error,
            })}
          >
            ERROR
          </div>
          <MonacoEditor
            language="json"
            theme="vs-light"
            value={code}
            options={EDITOR_OPTIONS}
            onChange={(code: string) => {
              Promise.resolve()
                .then(() => JSON.parse(code))
                .then(() => this.setState({code, error: false}))
                .catch(() => this.setState({code, error: true}));
            }}
            editorDidMount={this.editorDidMount}
          />
        </div>
        <div className="flex-down">
          <h5>Suggestions</h5>
          <div>
            {/* {synthesizeSuggestions(code, widgets).map(
              (suggestion: any, idx: number) => {
                const {from, to, comment = '', sideEffect} = suggestion;
                return (
                  <button
                    onClick={() => {
                      this.setState({
                        code: takeSuggestion(code, suggestion),
                        widgets: sideEffect
                          ? widgets.push(sideEffect())
                          : widgets,
                      });
                    }}
                    key={`${from} -> ${to}-${idx}`}
                  >
                    {comment}
                  </button>
                );
              }, */}
            )}
          </div>
        </div>
      </React.Fragment>
    );
  }

  rightColumn() {
    const {
      code,
      widgets,
      templateName,
      templateDescription,
      templateLanguage,
      showPreview,
    } = this.state;
    const newTemplate: Template = {
      templateLanguage,
      templateDescription,
      templateName,
      code,
      widgets: widgets.toJS(),
      widgetValidations: [],
    };
    return (
      <div className="code-column">
        <button
          onClick={() => {
            this.setState({showPreview: !showPreview});
          }}
        >
          toggle prevew
        </button>
        {!showPreview && this.codeColumn()}
        {showPreview && <TemplateColumnPreview newTemplate={newTemplate} />}
      </div>
    );
  }

  leftColumn() {
    const {
      widgets,
      showTextualTemplate,
      templateDescription,
      templateLanguage,
      templateName,

      code,
    } = this.state;
    const {createTemplate, toggleTemplateBuilder, editFrom} = this.props;
    const componentCanBeCreated = this.validatePotentialTemplate();
    return (
      <div className="widget-configuration-panel">
        <div className="flex flex-wrap">
          {Object.entries(widgetFactory).map((row: any) => {
            const [key, widgetFactor] = row;
            return (
              <button
                key={key}
                onClick={() => {
                  this.setState({
                    widgets: widgets.push(widgetFactor(widgets.size + 1)),
                  });
                }}
              >
                {`Add ${key}`}
              </button>
            );
          })}
          <button
            onClick={() => {
              this.setState({showTextualTemplate: !showTextualTemplate});
            }}
          >
            toggle textual template
          </button>
          <div>
            <Selector
              options={['vega', 'vega-lite'].map((key: string) => ({
                display: key,
                value: key,
              }))}
              selectedValue={templateLanguage}
              onChange={value => this.setState({templateLanguage: value})}
            />
          </div>
          <button
            disabled={!componentCanBeCreated}
            onClick={() => {
              if (!componentCanBeCreated) {
                return;
              }
              const newTemplate: Template = {
                templateLanguage,
                templateDescription,
                templateName,
                code,
                widgets: widgets.toJS(),
                widgetValidations: [],
              };
              createTemplate(newTemplate);
              toggleTemplateBuilder();
            }}
          >
            {componentCanBeCreated
              ? `${editFrom ? 'Update' : 'Create'} Template`
              : 'Template Not Complete'}
          </button>
        </div>
        {!showTextualTemplate && this.widgetPanel()}
        {showTextualTemplate && this.textualTemplate()}
      </div>
    );
  }

  widgetPanel() {
    const {code, widgets, templateName, templateDescription} = this.state;
    return <div />;
    // return (
    //   <React.Fragment>
    //     <div className="flex meta-data-builder-container">
    //       <div className="flex-down">
    //         <span className="tool-description">Template name:</span>
    //         <input
    //           value={templateName || ''}
    //           placeholder="Fill out name here"
    //           onChange={event => {
    //             this.setState({templateName: event.target.value});
    //           }}
    //         />
    //       </div>
    //       <div className="flex-down">
    //         <span className="tool-description">Template Description:</span>
    //         <textarea
    //           value={templateDescription || ''}
    //           placeholder="Fill out Description"
    //           onChange={event => {
    //             this.setState({templateDescription: event.target.value});
    //           }}
    //         />
    //       </div>
    //     </div>
    //     <div className="flex-down widget-builder-container">
    //       {widgets.map((widget: TemplateWidget, idx: number) => {
    //         return (
    //           <Widget
    //             editMode={true}
    //             code={code}
    //             widget={widget}
    //             idx={idx}
    //             key={`${idx}`}
    //             removeWidget={() => {
    //               const updatedWidgets = widgets.filter(
    //                 (_, jdx) => jdx !== idx,
    //               );
    //               // @ts-ignore
    //               this.setState({
    //                 widgets: updatedWidgets,
    //               });
    //             }}
    //             incrementOrder={() => {
    //               if (idx === widgets.size - 1) {
    //                 return;
    //               }
    //               this.setState({
    //                 widgets: widgets
    //                   .set(idx + 1, widget)
    //                   .set(idx, widgets.get(idx + 1)),
    //               });
    //             }}
    //             decrementOrder={() => {
    //               if (idx === 0) {
    //                 return;
    //               }
    //               this.setState({
    //                 widgets: widgets
    //                   .set(idx - 1, widget)
    //                   .set(idx, widgets.get(idx - 1)),
    //               });
    //             }}
    //             setWidgetValue={(key: string, value: any, idx: number) =>
    //               this.setWidgetValue(key, value, idx)
    //             }
    //           />
    //         );
    //       })}
    //       {!widgets.size && <h1>NO WIDGETS SELECTED</h1>}
    //     </div>
    //   </React.Fragment>
    // );
  }

  textualTemplate() {
    const {widgets, templateName, templateDescription} = this.state;
    const serializedState = {
      widgets,
      templateName,
      templateDescription,
      code: '<SEE CODE PANEL>',
    };
    // TODO ADD ERROR HANDLING,
    return (
      <React.Fragment>
        <div className="code-wrapper">
          <MonacoEditor
            language="json"
            theme="vs-light"
            value={stringify(serializedState)}
            options={EDITOR_OPTIONS}
            onChange={(code: string) => {
              Promise.resolve()
                .then(() => JSON.parse(code))
                .then(code => {
                  this.setState({
                    templateName: code.templateName,
                    templateDescription: code.templateDescription,
                    widgets: List(code.widgets),
                  });
                })
                .catch((e: any) => {
                  console.error(e);
                });
              {
                /* .then(() => this.setState({code, error: false}))
                .catch(() => this.setState({code, error: true})); */
              }
              {
                /* editorDidMount={this.editorDidMount} */
              }
            }}
          />
        </div>
      </React.Fragment>
    );
  }

  render() {
    const {toggleTemplateBuilder} = this.props;
    // TODO have a warning system if it looks like a template can't actually be generalized
    return (
      <Modal
        modalToggle={toggleTemplateBuilder}
        className="template-builder-modal"
        modalTitle="Template Builder"
        bodyDirectionDown={false}
        modalDetails="In this view you can generalize vega or vega-lite charts that you have made either made locally or copied from the internet. MORE DETAILS MORE DETAILS MORE DETAILS MORE DETAILS MORE DETAILS"
      >
        {this.rightColumn()}
        {this.leftColumn()}
      </Modal>
    );
  }
}
