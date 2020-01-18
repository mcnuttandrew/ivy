import React, {useState, useEffect} from 'react';
import {GenericAction} from '../../actions/index';
import {Template} from '../../templates/types';

interface Props {
  loadExternalTemplate: GenericAction;
}

export default function CommunityPrograms(props: Props): JSX.Element {
  const [mode, setMode] = useState('Recent');
  const loadedTemplates: Template[] = [];
  useEffect(() => {
    console.log('mode', mode);
  }, [mode]);
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
        {loadedTemplates.map(x => {
          return <div key={x.templateName}>PROGRAM</div>;
        })}
      </div>
    </div>
  );
}
