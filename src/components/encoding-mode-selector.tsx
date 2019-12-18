import React, {useState} from 'react';
import {GenericAction} from '../actions/index';
import {Template} from '../templates/types';
import Popover from './popover';

interface Props {
  templates: Template[];
  clickTarget: any;

  setEditMode: GenericAction;
  deleteTemplate: GenericAction;
  setEncodingMode: GenericAction;
  chainActions: GenericAction;
}

function generateButtonActions(props: any) {
  const {
    setEncodingMode,
    toggle,
    deleteTemplate,
    chainActions,
    setEditMode,
  } = props;
  return (templateName: string) => ({
    use: () => {
      chainActions([
        () => setEncodingMode(templateName),
        () => setEditMode(false),
      ]);
      toggle();
    },
    edit: () => {
      chainActions([
        () => setEncodingMode(templateName),
        () => setEditMode(true),
      ]);
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
  const {
    templates,
    setEncodingMode,
    deleteTemplate,
    chainActions,
    setEditMode,
    clickTarget,
  } = props;
  const [searchKey, setSearch] = useState('');

  return (
    <Popover
      clickTarget={clickTarget}
      body={(toggle: any) => {
        const buttonActions = generateButtonActions({
          setEncodingMode,
          toggle,
          deleteTemplate,
          chainActions,
          setEditMode,
        });
        return (
          <React.Fragment>
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
          </React.Fragment>
        );
      }}
    />
  );
}
