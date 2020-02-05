import React, {useState} from 'react';
import {GenericAction} from '../../actions/index';
import {Template} from '../../templates/types';
import ProgramPreview from './program-preview';
import {thumbnailLocation} from '../../thumbnail';
import {serverPrefix, searchPredicate} from '../../utils';
import {GRAMMAR_NAME, GRAMMAR_DESC, NONE_TEMPLATE} from '../../constants/index';

interface Props {
  chainActions: GenericAction<any>;
  deleteTemplate: GenericAction<string>;
  setEncodingMode: GenericAction<string>;
  templates: Template[];
  toggleProgramModal: GenericAction<void>;
}

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
            templateAuthor={'BUILT_IN'}
            buttons={['Use'].map(makeButtonObject(GRAMMAR_NAME))}
          />
        )}
        {templates
          .filter(
            x =>
              x.templateName !== NONE_TEMPLATE &&
              searchPredicate(searchKey, x.templateName, x.templateDescription),
          )
          .map((template: Template, idx: number) => (
            <ProgramPreview
              templateName={template.templateName}
              templateDescription={template.templateDescription}
              templateAuthor={template.templateAuthor}
              buttons={['Publish', 'Use', 'Delete'].map(makeButtonObject(template.templateName))}
              key={`${template.templateName}-${idx}`}
            />
          ))}
      </div>
    </React.Fragment>
  );
}
