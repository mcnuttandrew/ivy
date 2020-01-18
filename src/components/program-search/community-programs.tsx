import React, {useState, useEffect} from 'react';
import {GenericAction} from '../../actions/index';
import {Template} from '../../templates/types';
import ProgramPreview from './program-preview';

interface Props {
  loadExternalTemplate: GenericAction;
}

export default function CommunityPrograms(props: Props): JSX.Element {
  const {loadExternalTemplate} = props;
  const [mode, setMode] = useState('Recent');
  const loadedTemplates: Template[] = [];
  useEffect(() => {
    console.log('mode', mode);
  }, [mode]);

  const makeButtonObject = (template: Template) => (key: string): {onClick: any; name: string} => {
    let onClick;
    if (key === 'save') {
      onClick = (): any => loadExternalTemplate(template);
    }
    return {onClick, name: key};
  };
  return (
    <div>
      COMMUNTIY PROGRAMS
      <div>
        {[
          {name: 'Recent', mode: 'recent', url: 'asd'},
          {name: 'Search by name and description', mode: 'by-name', url: 'asd'},
          {name: 'Search by data field', mode: 'by-data-field', url: 'asd'},
        ].map(row => {
          return (
            <button key={row.mode} onClick={(): any => setMode(row.mode)}>
              {row.name}
            </button>
          );
        })}
      </div>
      <div>
        {loadedTemplates.map(template => {
          return (
            <ProgramPreview
              buttons={['save'].map(makeButtonObject(template))}
              key={`${template.templateName}-preview`}
              templateName={template.templateName}
              templateDescription={template.templateDescription}
            />
          );
        })}
      </div>
    </div>
  );
}
