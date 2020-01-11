import React, {useState} from 'react';
import {GenericAction} from '../actions/index';
import {Template} from '../templates/types';
import Popover from './popover';

interface Props {
  clickTarget: any;
  templates: Template[];

  chainActions: GenericAction;
  deleteTemplate: GenericAction;
  setEditMode: GenericAction;
  setEncodingMode: GenericAction;
}

type buttonFactory = {[action: string]: () => void};
function generateButtonActions(props: any): (x: string) => buttonFactory {
  const {setEncodingMode, toggle, deleteTemplate, chainActions, setEditMode} = props;
  return (templateName: string): buttonFactory => ({
    use: (): void => {
      chainActions([(): void => setEncodingMode(templateName), (): void => setEditMode(false)]);
      toggle();
    },
    edit: (): void => {
      chainActions([(): void => setEncodingMode(templateName), (): void => setEditMode(true)]);
      toggle();
    },
    delete: (): void => {
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
): JSX.Element {
  const buttonResponses = buttonActions(templateName);
  return (
    <div className="encoding-selection-option flex" key={`${templateName}-${idx}`}>
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

export default function EncodingMode(props: Props): JSX.Element {
  const {
    chainActions,
    clickTarget,
    deleteTemplate,
    setEditMode,
    setEncodingMode,
    templates,
  } = props;
  const [searchKey, setSearch] = useState('');

  return (
    <Popover
      clickTarget={clickTarget}
      body={(toggle: any): JSX.Element => {
        const buttonActions = generateButtonActions({
          chainActions,
          deleteTemplate,
          setEditMode,
          setEncodingMode,
          toggle,
        });
        return (
          <React.Fragment>
            <div>
              <input
                type="text"
                value={searchKey || ''}
                onChange={(event): any => setSearch(event.target.value)}
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
                .filter(template => template.templateName !== '_____none_____')
                .filter((template: Template) => {
                  const {templateName, templateDescription} = template;
                  const matchDescription =
                    templateDescription &&
                    templateDescription.toLowerCase().includes(searchKey || '');
                  const matchName =
                    templateName && templateName.toLowerCase().includes(searchKey || '');
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
