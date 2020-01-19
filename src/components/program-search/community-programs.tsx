import React, {useState, useEffect} from 'react';
import {GenericAction} from '../../actions/index';
import {Template} from '../../templates/types';
import ProgramPreview from './program-preview';
import {receiveThumbnail} from '../../thumbnail';
import {serverPrefix, classnames} from '../../utils';

interface Props {
  loadExternalTemplate: GenericAction;
}

const URL_CACHE: any = {};
function fetchWithCache(url: string): Promise<any> {
  return new Promise(resolve => {
    if (URL_CACHE[url]) {
      resolve(URL_CACHE[url]);
    } else {
      fetch(url)
        .then(x => x.json())
        .then(x => {
          URL_CACHE[url] = x;
          return resolve(x);
        });
    }
  });
}

const BY_TIME = 'Recent';
const BY_STRING = 'Search by name and description';
const BY_DATA = 'Search by data field';
const nameToUrl: {[x: string]: string} = {
  [BY_TIME]: 'recent',
  [BY_STRING]: 'search',
  [BY_DATA]: 'data-field',
};

export default function CommunityPrograms(props: Props): JSX.Element {
  const {loadExternalTemplate} = props;
  const [mode, setMode] = useState(BY_TIME);
  const [loadedTemplates, loadTemplates] = useState([]);
  const [searchConstructionComplete, changeSearchConstruction] = useState(false);
  const searchObj = {};
  useEffect(() => {
    // only recent should actuall trigger search completions
    changeSearchConstruction(mode === BY_TIME);
  }, [mode]);

  useEffect(() => {
    if (searchConstructionComplete) {
      console.log('skipped query');
      return;
    }
    console.log('ran query');
    const URL = `${serverPrefix()}/${nameToUrl[mode]}?${JSON.stringify(searchObj)}`;
    fetchWithCache(URL).then(result => {
      loadTemplates(result.map((x: any) => x.template));
      result.forEach((x: any) => receiveThumbnail(x.template.templateName, x.templateImg));
    });
  }, [searchConstructionComplete]);

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
        {[BY_TIME, BY_STRING, BY_DATA].map(row => {
          return (
            <button
              key={row}
              className={classnames({selected: row === mode})}
              onClick={(): any => setMode(row)}
            >
              {row}
            </button>
          );
        })}
      </div>
      <div className="query-configuration-block">
        {mode === BY_STRING && (
          <React.Fragment>
            Enter Search term here (matches against template name, template description, and creator name)
            <input />
          </React.Fragment>
        )}
        {mode === BY_DATA && (
          <React.Fragment>
            Enter Search term here (matches against template name, template description, and creator name)
            <input />
          </React.Fragment>
        )}
      </div>
      <div className="program-containers">
        {loadedTemplates.map(template => {
          console.log(loadedTemplates);
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
