/* eslint-disable react/prop-types */
import React, {useState, useEffect} from 'react';
import {GenericAction} from '../../actions/index';
import {Template} from '../../types';
import Modal from './modal';
import ProgramPreview from '../program-preview';
import {IgnoreKeys} from 'react-hotkeys';
import {serverPrefix, toExportStr} from '../../utils';
import {TiUploadOutline, TiEdit} from 'react-icons/ti';
import Tooltip from 'rc-tooltip';
import {AUTHORS} from '../../constants';
import JSZip from 'jszip';
import {saveAs} from 'file-saver';
import {writeUserName} from '../../utils/local-storage';

interface Props {
  loadExternalTemplate: GenericAction<Template>;
  templates: Template[];
  triggerRepaint: any;
  setModalState: GenericAction<string | null>;
  userName: string;
  recieveTemplates: GenericAction<Template[]>;
  setUserName: GenericAction<string>;
  setEncodingMode: GenericAction<string>;
}

interface QueryBuildParam {
  loadedTemplates: Template[];
  loadTemplates: any;
  makeButtonObject: any;
  localTemplates: Template[];
  loadExternalTemplate: GenericAction<Template>;
  setSearchObject: any;
  searchObject: any;
  triggerQuery: any;
  setEncodingMode: GenericAction<string>;
  setModalState: GenericAction<string | null>;
  userName: string;
}

type QueryBuild = (props: QueryBuildParam) => JSX.Element;
const FETCH_PARMS = {
  mode: 'cors', // no-cors, *cors, same-origin
  cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
  credentials: 'same-origin', // include, *same-origin, omit
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  },
  redirect: 'follow', // manual, *follow, error
  referrerPolicy: 'no-referrer', // no-referrer, *client
};
const URL_CACHE: any = {};

function runQuery(url: string, loadTemplates: any, triggerRepaint: any): void {
  if (URL_CACHE[url]) {
    loadTemplates(URL_CACHE[url].map((x: any) => x.template));
    setTimeout(triggerRepaint, 1000);
  }
  fetch(url, FETCH_PARMS as any)
    .then(x => x.json())
    .then(x => {
      URL_CACHE[url] = x;
      loadTemplates(URL_CACHE[url].map((x: any) => x.template));
      setTimeout(triggerRepaint, 1000);
    })
    .catch(e => console.log(e));
}
interface DeleteQueryProps {
  url: string;
  triggerRepaint: any;
}
function deleteQuery(props: DeleteQueryProps): Promise<any> {
  const {url, triggerRepaint} = props;
  return fetch(url, FETCH_PARMS as any)
    .then(result => {
      console.log(result);
      setTimeout(triggerRepaint, 1000);
    })
    .catch(e => {
      console.log(e);
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
  loadExternalTemplate: GenericAction<Template>,
  setEncodingMode: GenericAction<string>,
  setModalState: GenericAction<string | null>,
): JSX.Element {
  const loadedPrograms = localTemplates.reduce((acc, x) => acc.add(x.templateName), new Set());
  return (
    <div className="program-containers">
      {loadedTemplates
        .filter(d => d)
        .map((template, idx) => {
          const isLoaded = loadedPrograms.has(template.templateName);
          console.log(template);
          return (
            <ProgramPreview
              buttons={['save', template.templateAuthor === userName && 'delete from server']
                .filter(d => d)
                .map(makeButtonObject(template))}
              key={`${template.templateName}-preview-${idx}`}
              template={template}
              alreadyPresent={isLoaded}
              userName={userName}
              hideMatches={true}
              setEncodingMode={(): void => {
                const setAndClose = (): void => {
                  setEncodingMode(template.templateName);
                  setModalState(null);
                };
                if (!isLoaded) {
                  loadExternalTemplate(template);
                  setTimeout(setAndClose, 750);
                } else {
                  setAndClose();
                }
              }}
            />
          );
        })}
    </div>
  );
}

const RecentPrograms: QueryBuild = ({
  loadedTemplates,
  makeButtonObject,
  localTemplates,
  userName,
  loadExternalTemplate,
  setEncodingMode,
  setModalState,
}) => {
  return (
    <div className="flex-down">
      {DisplayLoadedPrograms(
        loadedTemplates,
        localTemplates,
        makeButtonObject,
        userName,
        loadExternalTemplate,
        setEncodingMode,
        setModalState,
      )}
    </div>
  );
};

const SearchForPrograms: QueryBuild = ({
  loadedTemplates,
  makeButtonObject,
  localTemplates,
  setSearchObject,
  triggerQuery,
  userName,
  loadExternalTemplate,
  setEncodingMode,
  setModalState,
}) => {
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
      {DisplayLoadedPrograms(
        loadedTemplates,
        localTemplates,
        makeButtonObject,
        userName,
        loadExternalTemplate,
        setEncodingMode,
        setModalState,
      )}
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
  const {
    loadExternalTemplate,
    setModalState,
    triggerRepaint,
    templates,
    userName,
    recieveTemplates,
    setUserName,
    setEncodingMode,
  } = props;
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
    if (key === 'delete from server') {
      onClick = (): any => {
        const queryParms = toQueryParams({
          templateName: template.templateName,
          templateAuthor: template.templateAuthor,
          userName: userName,
        });
        deleteQuery({url: `${serverPrefix()}/remove${queryParms}`, triggerRepaint}).then(() => {
          runQuery(
            `${serverPrefix()}/${nameToUrl[mode]}${toQueryParams(searchObject)}`,
            loadTemplates,
            triggerRepaint,
          );
        });
      };
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
                <UserNamePopover userName={userName} setUserName={setUserName} />
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
                RecentPrograms({
                  loadedTemplates,
                  loadTemplates,
                  makeButtonObject,
                  localTemplates: templates,
                  setSearchObject,
                  searchObject,
                  triggerQuery,
                  userName,
                  loadExternalTemplate,
                  setEncodingMode,
                  setModalState,
                })}
              {mode === BY_STRING &&
                SearchForPrograms({
                  loadedTemplates,
                  loadTemplates,
                  makeButtonObject,
                  localTemplates: templates,
                  setSearchObject,
                  searchObject,
                  triggerQuery,
                  userName,
                  loadExternalTemplate,
                  setEncodingMode,
                  setModalState,
                })}
              {mode === BY_DATA && <div>WIP</div>}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

interface UserNamePopover {
  userName: string;
  setUserName: GenericAction<string>;
}

function UserNamePopover(props: UserNamePopover): JSX.Element {
  const {userName, setUserName} = props;
  const [localName, setName] = useState(userName);

  return (
    <Tooltip
      placement="top"
      trigger="click"
      overlay={
        <div className="tooltip-internal flex-down">
          <h3>Change your user name</h3>
          <input
            value={localName}
            onChange={(e): void => {
              setName(e.target.value);
            }}
          />
          <button
            onClick={(): void => {
              writeUserName(localName);
              setUserName(localName);
            }}
          >
            Change
          </button>
        </div>
      }
    >
      <span className="cursor-pointer">
        <TiEdit />
      </span>
    </Tooltip>
  );
}
