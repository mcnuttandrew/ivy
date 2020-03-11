import React, {useState, useEffect} from 'react';
import {GenericAction} from '../../actions/index';
import {Template} from '../../types';
import Modal from './modal';
import ProgramPreview from '../program-preview';
import {IgnoreKeys} from 'react-hotkeys';
import {serverPrefix, buildCounts, toExportStr} from '../../utils';
import {TiUploadOutline} from 'react-icons/ti';
import {AUTHORS} from '../../constants';
import JSZip from 'jszip';
import {saveAs} from 'file-saver';

interface Props {
  loadExternalTemplate: GenericAction<Template>;
  templates: Template[];
  triggerRepaint: any;
  setModalState: GenericAction<string | null>;
  userName: string;
  recieveTemplates: GenericAction<Template[]>;
}

type QueryBuild = (
  loadedTemplates: Template[],
  loadTemplates: any,
  makeButtonObject: any,
  localTemplates: Template[],
  setSearchObject: any,
  searchObject: any,
  triggerQuery: any,
  userName: string,
) => JSX.Element;

const URL_CACHE: any = {};
function fetchWithCache(url: string): Promise<any> {
  return new Promise(resolve => {
    if (URL_CACHE[url]) {
      resolve(URL_CACHE[url]);
    } else {
      fetch(url, {
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *client
      })
        .then(x => x.json())
        .then(x => {
          URL_CACHE[url] = x;
          return resolve(x);
        });
    }
  });
}

function runQuery(url: string, loadTemplates: any, triggerRepaint: any): void {
  fetchWithCache(url).then(result => {
    loadTemplates(result.map((x: any) => x.template));
    setTimeout(triggerRepaint, 1000);
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

function DisplayLoadedPrograms(
  loadedTemplates: Template[],
  localTemplates: Template[],
  makeButtonObject: any,
  userName: string,
): JSX.Element {
  const loadedPrograms = localTemplates.reduce((acc, x) => acc.add(x.templateName), new Set());
  return (
    <div className="program-containers">
      {loadedTemplates.map((template, idx) => (
        <ProgramPreview
          typeCounts={buildCounts(template)}
          buttons={['save'].map(makeButtonObject(template))}
          key={`${template.templateName}-preview-${idx}`}
          templateName={template.templateName}
          templateDescription={template.templateDescription}
          templateAuthor={template.templateAuthor}
          preventUse={true}
          alreadyPresent={loadedPrograms.has(template.templateName)}
          userName={userName}
        />
      ))}
    </div>
  );
}

const RecentPrograms: QueryBuild = (
  loadedTemplates,
  loadTemplates,
  makeButtonObject,
  localTemplates,
  setSearchObject,
  searchObject,
  triggerQuery,
  userName,
) => {
  return (
    <div className="flex-down">
      {DisplayLoadedPrograms(loadedTemplates, localTemplates, makeButtonObject, userName)}
    </div>
  );
};

const SearchForPrograms: QueryBuild = (
  loadedTemplates,
  loadTemplates,
  makeButtonObject,
  localTemplates,
  setSearchObject,
  searchObject,
  triggerQuery,
  userName,
) => {
  return (
    <div className="flex-down">
      <div className="flex-down">
        Enter Search term here (matches against template name, template description, and creator name)
        <IgnoreKeys style={{height: '100%'}}>
          <input
            onChange={(e): any => setSearchObject({search: e.target.value})}
            placeholder="type here for search"
          />
        </IgnoreKeys>
        <button onClick={(): void => triggerQuery()}>Run Search</button>
      </div>
      {DisplayLoadedPrograms(loadedTemplates, localTemplates, makeButtonObject, userName)}
    </div>
  );
};

function toQueryParams(obj: {[x: string]: any}): string {
  const query = Object.entries(obj)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
  return query.length ? `?${query}` : '';
}

export default function CommunityPrograms(props: Props): JSX.Element {
  const {loadExternalTemplate, setModalState, triggerRepaint, templates, userName, recieveTemplates} = props;
  const [mode] = useState(BY_TIME);
  const [queryIdx, queryIdxUpdate] = useState(1);
  const triggerQuery = (): any => queryIdxUpdate(queryIdx + 1);

  const [loadedTemplates, loadTemplates] = useState([]);
  const [searchObject, setSearchObject] = useState({});
  useEffect(() => {
    runQuery(
      `${serverPrefix()}/${nameToUrl[mode]}${toQueryParams(searchObject)}`,
      loadTemplates,
      triggerRepaint,
    );
  }, [queryIdx, mode]);

  const makeButtonObject = (template: Template) => (key: string): {onClick: any; name: string} => {
    let onClick;
    if (key === 'save') {
      onClick = (): any => loadExternalTemplate(template);
    }
    return {onClick, name: key};
  };

  return (
    <Modal
      modalToggle={(): any => setModalState(null)}
      className="program-modal"
      modalTitle="Add More Templates"
      bodyDirectionDown={true}
    >
      <div className="flex-down full-height-with-hide ">
        <div className="full-height-with-hide ">
          <div className="full-height">
            <div className="full-width flex space-between">
              <div className="state-action-button">
                <div className="flex-down">
                  <h3>Load a template from your computer</h3>
                  <div className="flex">
                    <TiUploadOutline />
                    <input
                      type="file"
                      multiple
                      accept="*.ivy.json"
                      onChange={function(event: any): void {
                        const fileList = [];
                        for (let i = 0; i < event.target.files.length; i++) {
                          fileList.push(event.target.files[i]);
                        }
                        const loaderPromise = (file: any): any => {
                          return new Promise(resolve => {
                            const reader = new FileReader();
                            reader.onload = (e): void => resolve(JSON.parse(e.target.result as string));
                            reader.readAsText(file);
                          });
                        };
                        Promise.all(fileList.map(loaderPromise)).then(newTemplates => {
                          recieveTemplates(newTemplates);
                          setModalState(null);
                        });
                      }}
                    />
                  </div>
                </div>
              </div>
              <div>
                <button
                  onClick={(): void => {
                    const zip = new JSZip();
                    templates
                      .filter(d => d.templateAuthor !== AUTHORS)
                      .forEach(template => {
                        const fileName = `${toExportStr(template.templateName)}.${toExportStr(
                          template.templateAuthor,
                        )}.ivy.json`;
                        zip.file(fileName, JSON.stringify(template, null, 2));
                      });
                    // when everything has been downloaded, we can trigger the dl
                    zip.generateAsync({type: 'blob'}).then(blob => saveAs(blob, 'ivy-bundle.zip'));
                  }}
                >
                  Export All Saved Templates To Disc
                </button>
              </div>
              <div className="flex">
                <h3>{`Your user name: ${userName}`} </h3>
              </div>
            </div>
            {/* <div>
              {[
                BY_TIME,
                // BY_STRING,
                // BY_DATA
              ].map(row => {
                return (
                  <button
                    key={row}
                    className={classnames({selected: row === mode})}
                    onClick={(): any => {
                      setMode(row);
                      setSearchObject({});
                      loadTemplates([]);
                    }}
                  >
                    {row}
                  </button>
                );
              })}
            </div> */}
            <h3>Load a template from the community template server</h3>
            <div className="query-configuration-block">
              {mode === BY_TIME && !loadedTemplates.length && (
                <div className="lds-dual-ring-container">
                  <div className="lds-dual-ring"></div>
                </div>
              )}
              {mode === BY_TIME &&
                RecentPrograms(
                  loadedTemplates,
                  loadTemplates,
                  makeButtonObject,
                  templates,
                  setSearchObject,
                  searchObject,
                  triggerQuery,
                  userName,
                )}
              {mode === BY_STRING &&
                SearchForPrograms(
                  loadedTemplates,
                  loadTemplates,
                  makeButtonObject,
                  templates,
                  setSearchObject,
                  searchObject,
                  triggerQuery,
                  userName,
                )}
              {mode === BY_DATA && <div>WIP</div>}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
