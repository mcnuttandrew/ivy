import React, {useState} from 'react';
import {GenericAction} from '../../actions/index';
import {Template} from '../../templates/types';
import ProgramPreview from './program-preview';
import {thumbnailLocation} from '../../thumbnail';
import {serverPrefix} from '../../utils';

interface Props {
  chainActions: GenericAction;
  deleteTemplate: GenericAction;
  setEncodingMode: GenericAction;
  templates: Template[];
  toggleProgramModal: GenericAction;
}

// used for filtering out unsearched templates
function searchPredicate(searchKey: string, templateName: string, templateDescription: string): boolean {
  const matchDescription = templateDescription && templateDescription.toLowerCase().includes(searchKey || '');
  const matchName = templateName && templateName.toLowerCase().includes(searchKey || '');
  return matchDescription || matchName;
}

const GRAMMAR_NAME = 'grammer';
const GRAMMAR_DESC = 'Tableau-style grammar of graphics';
export default function LocalPrograms(props: Props): JSX.Element {
  const {chainActions, deleteTemplate, setEncodingMode, templates, toggleProgramModal} = props;
  const [searchKey, setSearch] = useState('');
  const makeButtonObject = (templateName: string) => (key: string): {onClick: any; name: string} => {
    let onClick;
    if (key === 'Use') {
      onClick = (): any => chainActions([(): any => setEncodingMode(templateName), toggleProgramModal]);
    }
    if (key === 'Delete') {
      onClick = (): any => deleteTemplate(templateName);
    }
    if (key === 'Publish') {
      onClick = (): any => {
        const template = templates.find(template => template.templateName === templateName);
        if (!template) {
          return;
        }
        const thumbnail = thumbnailLocation(templateName);
        fetch(`${serverPrefix()}/publish`, {
          method: 'POST',
          mode: 'cors', // no-cors, *cors, same-origin
          cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
          credentials: 'same-origin', // include, *same-origin, omit
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            // 'Content-Type': 'application/x-www-form-urlencoded',
          },
          redirect: 'follow', // manual, *follow, error
          referrerPolicy: 'no-referrer', // no-referrer, *client
          body: JSON.stringify({
            template,
            templateImg: thumbnail === 'logo.png' ? null : thumbnail,
            creator: 'EXAMPLE_CREATOR',
          }), // body data type must match "Content-Type" header
        }).then(x => {
          console.log(x);
        });
      };
    }
    return {onClick, name: key};
  };
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
      <div className="program-containers">
        {searchPredicate(searchKey, GRAMMAR_DESC, GRAMMAR_DESC) && (
          <ProgramPreview
            templateName={GRAMMAR_NAME}
            templateDescription={GRAMMAR_DESC}
            buttons={['Use'].map(makeButtonObject(GRAMMAR_NAME))}
          />
        )}
        {templates
          .filter(template => template.templateName !== '_____none_____')
          .filter(x => searchPredicate(searchKey, x.templateName, x.templateDescription))
          .map((template: Template, idx: number) => (
            <ProgramPreview
              templateName={template.templateName}
              templateDescription={template.templateDescription}
              buttons={['Publish', 'Use', 'Delete'].map(makeButtonObject(template.templateName))}
              key={`${template.templateName}-${idx}`}
            />
          ))}
      </div>
    </React.Fragment>
  );
}
