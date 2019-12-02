import React from 'react';
import {GenericAction} from '../actions/index';
import {Template} from '../constants/templates';
import {TiExport} from 'react-icons/ti';

interface Props {
  templates: Template[];
  deleteTemplate: GenericAction;
  startTemplateEdit: GenericAction;
  setEncodingMode: GenericAction;
}

interface State {
  open: boolean;
}

function generateButtonActions(props: any) {
  const {setEncodingMode, startTemplateEdit, toggle, deleteTemplate} = props;
  return (templateName: string) => ({
    use: () => {
      setEncodingMode(templateName);
      toggle();
    },
    edit: () => {
      startTemplateEdit(templateName);
      toggle();
    },
    delete: () => {
      deleteTemplate(templateName);
    },
  });
}

function encodingRow(
  templateName: string,
  templateDescription: string,
  buttons: string[],
  buttonActions: any,
  idx: number,
) {
  const buttonResponses = buttonActions(templateName);
  return (
    <div
      className="encoding-selection-option flex"
      key={`${templateName}-${idx}`}
    >
      <div>
        <img src="./assets/example-chart.png" />
      </div>
      <div className="flex-down">
        <h3>{templateName}</h3>
        {templateDescription && <h5>{`${templateDescription}`}</h5>}
        <div className="flex">
          {buttons.map((button: string) => {
            return (
              <button
                onClick={buttonResponses[button.toLowerCase()]}
                key={`${templateName}-${idx}-${button}`}
              >
                {button}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default class EncodingMode extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      open: false,
    };
  }
  render() {
    const {open} = this.state;
    const {
      templates,
      setEncodingMode,
      startTemplateEdit,
      deleteTemplate,
    } = this.props;
    const toggle = () => this.setState({open: !open});
    const buttonActions = generateButtonActions({
      setEncodingMode,
      startTemplateEdit,
      toggle,
      deleteTemplate,
    });
    return (
      <div className="flex tooltip-container">
        <div onClick={toggle}>
          <TiExport />
        </div>
        {open && <div className="modal-background" onClick={toggle} />}
        <div className="modal-tooltip-container">
          {open && (
            <div className="modal-tooltip">
              <div className="flex-down">
                {encodingRow(
                  'grammer',
                  'Tableau-style grammar of graphics',
                  ['Use'],
                  buttonActions,
                  -1,
                )}
                {templates.map((template: Template, idx: number) =>
                  encodingRow(
                    template.templateName,
                    template.templateDescription,
                    ['Use', 'Edit', 'Delete'],
                    buttonActions,
                    idx,
                  ),
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}
