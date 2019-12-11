import React, {useState} from 'react';
import {GenericAction} from '../actions/index';
import {Template} from '../templates/types';
import {TiExport} from 'react-icons/ti';

interface Props {
  templates: Template[];
  deleteTemplate: GenericAction;
  startTemplateEdit: GenericAction;
  setEncodingMode: GenericAction;
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

export default function EncodingMode(props: Props) {
  const {templates, setEncodingMode, startTemplateEdit, deleteTemplate} = props;
  const [open, setOpen] = useState(false);
  const [searchKey, setSearch] = useState('');
  const toggle = () => setOpen(!open);
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
          <div className="modal-tooltip flex-down">
            <div>
              <input
                value={searchKey || ''}
                onChange={event => setSearch(event.target.value)}
                placeholder="Search for Template"
              />
            </div>
            <div className="flex-and-wrap">
              {encodingRow(
                'grammer',
                'Tableau-style grammar of graphics',
                ['Use'],
                buttonActions,
                -1,
              )}
              {templates
                .filter((template: Template) => {
                  const {templateName, templateDescription} = template;
                  const matchDescription =
                    templateDescription &&
                    templateDescription.toLowerCase().includes(searchKey || '');
                  const matchName =
                    templateName &&
                    templateName.toLowerCase().includes(searchKey || '');
                  return matchDescription || matchName;
                })
                .map((template: Template, idx: number) =>
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
