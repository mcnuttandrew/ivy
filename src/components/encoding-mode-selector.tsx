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
                <div>
                  <div>Template Name: Grammer</div>
                  <div>
                    Template Description: Tableau-style grammar of graphics
                  </div>
                  <button
                    onClick={() => {
                      setEncodingMode('grammer');
                    }}
                  >
                    Use
                  </button>
                </div>
                {templates.map((template: Template) => {
                  console.log(template);
                  return (
                    <div key={`${template.templateName}-describer`}>
                      <div>{`Template Name: ${template.templateName}`}</div>
                      {template.templateDescription && (
                        <div>
                          {`Template Description: ${template.templateDescription}`}
                        </div>
                      )}
                      <button
                        onClick={() => {
                          setEncodingMode(template.templateName);
                          toggle();
                        }}
                      >
                        Use
                      </button>
                      <button
                        onClick={() => {
                          startTemplateEdit(template.templateName);
                          toggle();
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          deleteTemplate(template.templateName);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}
