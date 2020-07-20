import React, {useEffect, useState} from 'react';
import {connect} from 'react-redux';

import * as actionCreators from '../actions/index';
import {FETCH_PARMS} from '../constants';
import {AppState, DataReducerState} from '../types';
import {serverPrefix} from '../utils';
import {ActionUser} from '../actions';
import {DEFAULT_TEMPLATES} from '../templates';
type Props = ActionUser;
import {Link} from 'react-router-dom';

const toAuthorName = (row: any): {templateName: string; templateAuthor: string} => ({
  templateName: row.name || row.template_name || row.templateName,
  templateAuthor: row.creator || row.template_creator || row.templateAuthor,
});

function prepareNesting(templates: any[]): any {
  const BINDER = '%%%%!@%@%%#%@!%@!%#^&!@^%#^&@!';
  const groups = templates.reduce((acc, row) => {
    const {templateName, templateAuthor} = toAuthorName(row);
    const key = `${templateName}${BINDER}${templateAuthor}`;
    acc[key] = (acc[key] || []).concat(row);
    return acc;
  }, {});
  return Object.entries(groups).map(([key, entries]) => {
    const [templateName, templateAuthor] = key.split(BINDER);
    return {templateName, templateAuthor, entries: (entries as any[]).filter(row => row.instance_name)};
  });
}

export function HomeContainer(props: Props): JSX.Element {
  const [templates, setTemplates] = useState(prepareNesting(DEFAULT_TEMPLATES));
  useEffect(() => {
    fetch(`${serverPrefix()}/recent-names`, FETCH_PARMS as any)
      .then(x => x.json())
      .then(x => {
        setTemplates(prepareNesting(DEFAULT_TEMPLATES.concat(x)));
      });
  }, []);
  return (
    <div className="home-container">
      <h1>ivy: an integrated visualization editor </h1>
      <h3>
        Select a template or template instance (or just go to <Link to="/editor/">the editor</Link>)
      </h3>
      <ul>
        {templates.map((row: any) => {
          const {templateName, templateAuthor, entries} = row;
          return (
            <li key={`${templateName}-${templateAuthor}`}>
              <Link to={`/editor/${templateAuthor}/${templateName}`}>
                {templateName} - {templateAuthor}
              </Link>
              <ul>
                {entries.map((entry: any, idx: number) => {
                  const {instance_name} = entry;
                  return (
                    <li key={`${templateName}-${templateAuthor}-${idx}`}>
                      {/* TODO ADD AN "ARE YOU SURE IF THE ASSOCIATED DATASET IS DIFFERENT" */}
                      {/* the way to do this is to have this component if it's the same or null and a checker if it's different */}
                      <Link to={`/editor/${templateAuthor}/${templateName}/${instance_name}`}>
                        {entry.instance_name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function mapStateToProps({base, data}: {base: AppState; data: DataReducerState}): any {
  return {};
}

export default connect(mapStateToProps, actionCreators)(HomeContainer);
