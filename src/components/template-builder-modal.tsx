import React from 'react';
import {List} from 'immutable';
import {TiDelete, TiArrowDownThick, TiArrowUpThick} from 'react-icons/ti';
import {GenericAction} from '../actions/index';
import {
  DataTargetWidget,
  TemplateWidget,
  Template,
  SwitchWidget,
  TextWidget,
  ListWidget,
} from '../constants/templates';
import {DataType} from '../types';
import {classnames} from '../utils';
import MonacoEditor from 'react-monaco-editor';
import Select from 'react-select';
import Switch from 'react-switch';
import Modal from './modal';

interface Props {
  spec: any;
  toggleTemplateBuilder: GenericAction;
  createTemplate: GenericAction;
  editFrom?: Template | boolean;
}

interface State {
  code: string;
  widgets: List<TemplateWidget>;
  templateName?: string;
  templateDescription?: string;
  error: boolean;
}

function widgetInUse(code: string, widgetName: string) {
  return code.match(new RegExp(`\\[${widgetName}\\]`, 'g'));
}
function allWidgetsInUse(code: string, widgets: List<TemplateWidget>) {
  return widgets
    .filter((widget: TemplateWidget) => widget.widgetType !== 'Text')
    .every((widget: TemplateWidget) => !!widgetInUse(code, widget.widgetName));
}

const DATA_TYPES: DataType[] = ['MEASURE', 'DIMENSION', 'TIME', 'METACOLUMN'];
const toSelectFormat = (arr: string[]) =>
  arr.map((x: string) => ({value: x, label: x}));

const widgetFactory = {
  List: (idx: number) => {
    const allowedValues: string[] = [];
    const newWidget: ListWidget = {
      widgetName: `ListItem${idx}`,
      widgetType: 'List',
      required: true,
      allowedValues,
      defaultValue: null,
    };
    return newWidget;
  },
  DataTarget: (idx: number) => {
    const newWidget: DataTargetWidget = {
      widgetName: `Dim${idx}`,
      widgetType: 'DataTarget',
      allowedTypes: DATA_TYPES,
      required: true,
    };
    return newWidget;
  },
  Switch: (idx: number) => {
    const newWidget: SwitchWidget = {
      widgetName: `Switch${idx}`,
      widgetType: 'Switch',
      defaultValue: true,
      required: true,
    };
    return newWidget;
  },
  Text: (idx: number) => {
    const newWidget: TextWidget = {
      widgetName: `Text${idx}`,
      widgetType: 'Text',
      text: '',
      required: false,
    };
    return newWidget;
  },
};

export default class DataModal extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      code: JSON.stringify(this.props.spec, null, 2),
      templateName: null,
      widgets: List(),
      error: false,
      templateDescription: null,
    };
    if (props.editFrom) {
      // @ts-ignore
      const prevTemplate: Template = props.editFrom;
      const {code, templateName, templateDescription, widgets} = prevTemplate;
      this.state = {
        code,
        templateName,
        widgets: widgets.reduce(
          (acc: any, x: TemplateWidget) => acc.push(x),
          List(),
        ),
        error: false,
        templateDescription,
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

  renderDataTargetWidget(generalWidget: TemplateWidget, idx: number) {
    // @ts-ignore
    const widget: DataTargetWidget = generalWidget;
    return (
      <div key={widget.widgetName}>
        <Select
          isMulti={true}
          value={toSelectFormat(widget.allowedTypes)}
          options={toSelectFormat(DATA_TYPES)}
          onChange={(actionResult: any) => {
            this.setWidgetValue(
              'allowedTypes',
              (actionResult || []).map((d: any) => d.value),
              idx,
            );
          }}
        />
      </div>
    );
  }

  renderSwitchWidget(generalWidget: TemplateWidget, idx: number) {
    // @ts-ignore
    const widget: SwitchWidget = generalWidget;
    return (
      <div key={widget.widgetName}>
        <span>Defaults to be </span>
        <Switch
          checked={!!widget.defaultValue}
          offColor="#E1E9F2"
          onColor="#36425C"
          height={15}
          checkedIcon={false}
          width={50}
          onChange={() =>
            this.setWidgetValue('defaultValue', !widget.defaultValue, idx)
          }
        />
      </div>
    );
  }

  renderListWidget(widget: TemplateWidget, idx: number) {
    return <div key={widget.widgetName}>List</div>;
  }

  renderTextWidget(generalWidget: TemplateWidget, idx: number) {
    // @ts-ignore
    const widget: TextWidget = generalWidget;
    return (
      <div key={widget.widgetName}>
        <textarea
          placeholder="Type a message that will appear in the encoding area"
          value={widget.text}
          onChange={event =>
            this.setWidgetValue('text', event.target.value, idx)
          }
        />
      </div>
    );
  }

  widgetCommon(widget: TemplateWidget, idx: number) {
    const {code, widgets} = this.state;
    const showKey = widget.widgetType !== 'Text';
    const showRequired = widget.widgetType !== 'Text';
    const showInUs = widget.widgetType !== 'Text';
    return (
      <div key={widget.widgetName} className="widget">
        <div className="widget-handle">
          <div className="flex-down">
            <div
              className="cursor-pointer"
              onClick={() => {
                // @ts-ignore
                const updatedWidgets: List<any> = widgets.filter(
                  (_, jdx) => jdx !== idx,
                );
                this.setState({
                  widgets: updatedWidgets,
                });
              }}
            >
              <TiDelete />
            </div>
            <div
              className="cursor-pointer"
              onClick={() => {
                if (idx === 0) {
                  return;
                }
                this.setState({
                  widgets: widgets
                    .set(idx - 1, widget)
                    .set(idx, widgets.get(idx - 1)),
                });
              }}
            >
              <TiArrowUpThick />
            </div>
            <div
              className="cursor-pointer"
              onClick={() => {
                if (idx === widgets.size - 1) {
                  return;
                }
                this.setState({
                  widgets: widgets
                    .set(idx + 1, widget)
                    .set(idx, widgets.get(idx + 1)),
                });
              }}
            >
              <TiArrowDownThick />
            </div>
          </div>
          <div className="in-use-status">
            {showInUs
              ? widgetInUse(code, widget.widgetName)
                ? 'in use'
                : 'not used'
              : ''}
          </div>
        </div>
        <div className="widget-body">
          <div className="flex">
            {showKey && (
              <div className="flex-down">
                <span className="tool-description">WidgetKey</span>
                <input
                  value={widget.widgetName}
                  onChange={event =>
                    this.setWidgetValue('widgetName', event.target.value, idx)
                  }
                />
              </div>
            )}
            {showRequired && (
              <div className="flex-down">
                <span className="tool-description">Required:</span>
                <Switch
                  checked={!!widget.required}
                  offColor="#E1E9F2"
                  onColor="#36425C"
                  height={15}
                  checkedIcon={false}
                  width={50}
                  onChange={() =>
                    this.setWidgetValue('required', !widget.required, idx)
                  }
                />
              </div>
            )}
          </div>

          {widget.widgetType === 'Switch' &&
            this.renderSwitchWidget(widget, idx)}
          {widget.widgetType === 'List' && this.renderListWidget(widget, idx)}
          {widget.widgetType === 'Text' && this.renderTextWidget(widget, idx)}
          {widget.widgetType === 'DataTarget' &&
            this.renderDataTargetWidget(widget, idx)}
        </div>
      </div>
    );
  }

  codeColumn() {
    const {code, error} = this.state;
    const {spec} = this.props;
    const options = {
      selectOnLineNumbers: true,
      minimap: {
        enabled: false,
      },
    };

    return (
      <div className="code-column">
        <div className="flex-down">
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
            options={options}
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
      </div>
    );
  }

  widgetPanel() {
    const {code, widgets, templateName, templateDescription} = this.state;
    const {createTemplate, toggleTemplateBuilder, editFrom} = this.props;
    const componentCanBeCreated = this.validatePotentialTemplate();
    return (
      <div className="widget-configuration-panel">
        <h3>Template Creation</h3>
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
            };
            createTemplate(newTemplate);
            toggleTemplateBuilder();
          }}
        >
          {componentCanBeCreated
            ? `${editFrom ? 'Update' : 'Create'} Template`
            : 'Template Not Complete'}
        </button>
        <h3>Template Meta Data</h3>
        <div>
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
        <h3>Widgets</h3>
        <h5>
          Widgets are the way that users interact with the template you've
          created.
        </h5>
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
        </div>
        <div className="flex-down">
          {widgets.map((widget: TemplateWidget, idx: number) =>
            this.widgetCommon(widget, idx),
          )}
        </div>
      </div>
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
        {this.codeColumn()}
        {this.widgetPanel()}
      </Modal>
    );
  }
}
