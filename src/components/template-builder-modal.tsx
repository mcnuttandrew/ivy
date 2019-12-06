import React from 'react';
import {List} from 'immutable';
import MonacoEditor from 'react-monaco-editor';

import {GenericAction} from '../actions/index';
import {EDITOR_OPTIONS} from '../constants/index';
import {TemplateWidget, Template, widgetFactory} from '../constants/templates';
import BuilderWidget from './widgets/builder-widget';
import {classnames, allWidgetsInUse} from '../utils';
import TemplateColumnPreview from './widget-builder/template-column-preview';
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
      code: JSON.stringify(this.props.spec, null, 2),
      templateName: null,
      widgets: List(),
      error: false,
      templateDescription: null,
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
    const {widgets} = this.state;
    this.setState({
      widgets: widgets.set(idx, {
        ...widgets.get(idx),
        [key]: value,
      }),
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
    const {code, error} = this.state;
    const {spec} = this.props;
    return (
      <React.Fragment>
        <div className="flex flex-wrap">
          <button
            onClick={() => {
              this.setState({
                code: JSON.stringify(EMPTY_SPEC.toJS(), null, 2),
              });
            }}
          >
            EMPTY VEGALITE SPEC
          </button>
          <button
            onClick={() => {
              this.setState({
                code: JSON.stringify(spec, null, 2),
              });
            }}
          >
            COPY CODE FROM CURRENT SELECTION
          </button>
          <button onClick={() => {}}>FORK EXTANT TEMPLATE</button>
          <button
            onClick={() => {
              this.setState({
                code: JSON.stringify(JSON.parse(code), null, 2),
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
            <button>x -> y</button>
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
      showPreview,
    } = this.state;
    const newTemplate: Template = {
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
      templateName,
      code,
    } = this.state;
    const {createTemplate, toggleTemplateBuilder, editFrom} = this.props;
    const componentCanBeCreated = this.validatePotentialTemplate();
    return (
      <div className="widget-configuration-panel">
        <div className="flex">
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
          <button
            disabled={!componentCanBeCreated}
            onClick={() => {
              if (!componentCanBeCreated) {
                return;
              }
              const newTemplate: Template = {
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
    return (
      <React.Fragment>
        <div className="flex meta-data-builder-container">
          <div className="flex-down">
            <span className="tool-description">Template name:</span>
            <input
              value={templateName || ''}
              placeholder="Fill out name here"
              onChange={event => {
                this.setState({templateName: event.target.value});
              }}
            />
          </div>
          <div className="flex-down">
            <span className="tool-description">Template Description:</span>
            <textarea
              value={templateDescription || ''}
              placeholder="Fill out Description"
              onChange={event => {
                this.setState({templateDescription: event.target.value});
              }}
            />
          </div>
        </div>
        <div className="flex-down widget-builder-container">
          {widgets.map((widget: TemplateWidget, idx: number) => {
            return (
              <BuilderWidget
                code={code}
                widget={widget}
                widgets={widgets}
                idx={idx}
                key={idx}
                setWidgets={(widgets: List<TemplateWidget>) =>
                  this.setState({widgets})
                }
                setWidgetValue={(key: string, value: any, idx: number) =>
                  this.setWidgetValue(key, value, idx)
                }
              />
            );
          })}
          {!widgets.size && <h1>NO WIDGETS SELECTED</h1>}
        </div>
      </React.Fragment>
    );
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
    // TODO MAKE focus not suck
    return (
      <React.Fragment>
        <div className="code-wrapper">
          <MonacoEditor
            language="json"
            theme="vs-light"
            value={JSON.stringify(serializedState, null, 2)}
            options={EDITOR_OPTIONS}
            onChange={(code: string) => {
              Promise.resolve()
                .then(() => JSON.parse(code))
                .then(code => {
                  console.log('wow', code);
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
