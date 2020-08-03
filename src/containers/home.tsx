import React, {useEffect, useState} from 'react';
import {connect} from 'react-redux';
import {TiStar} from 'react-icons/ti';
import {RenderTypeCounts} from '../components/template-card';
import UnpublishInstanceTooltip from '../components/tooltips/unpublish-instance-tooltip';

import {getFavoriteTemplates, setFavoriteTemplates} from '../utils/local-storage';
import * as actionCreators from '../actions/index';
import {FETCH_PARMS, BINDER} from '../constants';
import {AppState, DataReducerState, Template} from '../types';
import {serverPrefix, toSection, SECTIONS, classnames} from '../utils';
import {ActionUser} from '../actions';
import {DEFAULT_TEMPLATES} from '../templates';
import Header from '../components/header';
import Thumbnail from '../components/thumbnail';
interface Props extends ActionUser {
  currentlySelectedFile: string;
  templates: Template[];
  userName: string;
}
import {Link} from 'react-router-dom';

const toAuthorName = (row: any): {templateName: string; templateAuthor: string} => ({
  templateName: row.template_name || row.templateName,
  templateAuthor: row.creator || row.template_creator || row.templateAuthor,
});

const toKey = (x: any): string => `${x.templateName}${BINDER}${x.templateAuthor}`;
function prepareNesting(templates: any[], instances: any[]): any {
  const groups = instances.reduce((acc, row) => {
    const key = toKey(toAuthorName(row));
    acc[key] = (acc[key] || []).concat(row);
    return acc;
  }, {});
  return templates.map(template => ({template, entries: groups[toKey(template)] || []}));
}

function templateInfo(
  template: Template,
  favoriteTemplatesConfig: {favs: Set<string>; setFavs: any},
  toggleShowInstances: any,
  numEntries: number,
): JSX.Element {
  const {templateName, templateAuthor, templateDescription} = template;
  const {favs, setFavs} = favoriteTemplatesConfig;
  const key = toKey(template);
  return (
    <div className="flex template-info-container">
      <div className="margin-right">
        <Link to={`/editor/${templateAuthor}/${templateName}`}>
          <Thumbnail templateName={templateName} templateAuthor={templateAuthor} />
        </Link>
      </div>
      <div className="flex-down template-info">
        <h4 className="flex">
          <div
            onClick={(): void => {
              const newSet = new Set(Array.from(favs));
              favs.has(key) ? newSet.delete(key) : newSet.add(key);
              setFavs(newSet);
              setFavoriteTemplates(
                Array.from(newSet).map(x => {
                  const [templateName, templateAuthor] = x.split(BINDER);
                  return {templateName, templateAuthor};
                }),
              );
            }}
            className={classnames({
              'template-list-favorite': true,
              'template-list-favorited': favs.has(key),
            })}
          >
            <TiStar />
          </div>
          <b>Template: </b>
          <Link to={`/editor/${templateAuthor}/${templateName}`}>{templateName}</Link>
        </h4>
        <h5>
          <b>Author: </b>
          {templateAuthor}
        </h5>
        <h5>
          <b>Description: </b>
          {templateDescription}
        </h5>
        <h5>{RenderTypeCounts(template)}</h5>
        <h5>
          {Object.entries(
            template.widgets.reduce((acc, row) => {
              acc[row.type as string] = (acc[row.type as string] || 0) + 1;
              return acc;
            }, {} as {[x: string]: number}),
          )
            .map(([type, count]) => `${count} ${type}${count > 1 ? 's' : ''}`)
            .join(', ')}
        </h5>
        <button style={{textAlign: 'left'}} onClick={(): void => toggleShowInstances()}>
          Toggle Instances ({numEntries} instance{numEntries === 1 ? '' : 's'})
        </button>
      </div>
    </div>
  );
}
interface Instance {
  created_at: Date;
  template_creator: string;
  template_name: string;
  name: string;
  instance_creator: string;
}
interface InstanceCardProps {
  entry: Instance;
  forPreview: boolean;
  userName: string;
  removeInstance?: (templateAuthor: string, templateName: string, instanceName: string) => void;
}
function InstanceCard(props: InstanceCardProps): JSX.Element {
  const {entry, forPreview, userName, removeInstance} = props;
  // const {instance_name, dataset} = entry;
  // const changingDataset = dataset === currentlySelectedFile;
  const templateAuthor = entry.template_creator;
  const templateName = entry.template_name;
  const name = entry.name;
  return (
    <div className="flex-down">
      {/* TODO ADD AN "ARE YOU SURE IF THE ASSOCIATED DATASET IS DIFFERENT" */}
      {/* the way to do this is to have this component if it's the same or ndivl and a checker if it's different */}
      <div className="home-preview-container">
        <Link to={`/editor/${templateAuthor}/${templateName}/${name}`}>
          <div className="home-preview">
            <Thumbnail templateName={templateName} templateAuthor={templateAuthor} templateInstance={name} />
          </div>
          {!forPreview && name}
        </Link>
        {!forPreview && userName === entry.instance_creator && removeInstance && (
          <UnpublishInstanceTooltip
            templateAuthor={templateAuthor}
            templateName={templateName}
            instanceName={name}
            userName={userName}
            removeInstance={removeInstance}
          />
        )}
      </div>
    </div>
  );
}

interface RenderTemplateWithInstancesProps {
  row: {template: Template; entries: any[]};
  favoriteTemplatesConfig: {favs: Set<string>; setFavs: any};
  userName: string;
  removeInstance?: (templateAuthor: string, templateName: string, instanceName: string) => void;
}
function RenderTemplateWithInstances(props: RenderTemplateWithInstancesProps): JSX.Element {
  const {row, favoriteTemplatesConfig, userName, removeInstance} = props;
  const [showInstances, setShowInstance] = useState(false);
  const {template, entries} = row;
  const {templateName, templateAuthor} = template;

  const kabobbedAuthor = templateAuthor.replace(/\s+/g, '-');
  const kabbobedName = templateName.replace(/\s+/g, '-');
  return (
    <div className={`margin-bottom home-template-row flex-down  ${kabobbedAuthor}-${kabbobedName}`}>
      {templateInfo(template, favoriteTemplatesConfig, () => setShowInstance(!showInstances), entries.length)}
      {showInstances && (
        <div className="flex home-template-row-instances-container">
          {entries.map((entry, idx) => (
            <InstanceCard
              entry={entry}
              forPreview={false}
              userName={userName}
              key={`instance-${idx}`}
              removeInstance={removeInstance}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const polestar = DEFAULT_TEMPLATES.find(x => x.templateName === 'Polestar');
export function HomeContainer(props: Props): JSX.Element {
  const {recieveTemplates, templates, userName} = props;
  const [favs, setFavs] = useState(new Set([]));
  const [instances, setInstances] = useState([] as Instance[]);
  const [sortStratagey, setSortStratagey] = useState(location.hash.split('?')[1] || 'favorites');

  useEffect(() => {
    // eslint-disable-next-line no-undef
    if (process.env.NODE_ENV === 'test') {
      return;
    }
    getFavoriteTemplates().then(x => {
      const newFavs =
        x && x.length
          ? x.map(el => `${el.templateName}${BINDER}${el.templateAuthor}`)
          : [`${polestar.templateName}${BINDER}${polestar.templateAuthor}`];
      return setFavs(new Set(newFavs));
    });
    fetch(`${serverPrefix()}/templates`, FETCH_PARMS as any)
      .then(x => x.json())
      .then(loadedTemplates => recieveTemplates(loadedTemplates.map((x: any) => x.template)));
    fetch(`${serverPrefix()}/template-instances`, FETCH_PARMS as any)
      .then(x => x.json())
      .then(loadedInstances => setInstances(loadedInstances));
  }, []);
  function removeInstance(templateAuthor: string, templateName: string, instanceName: string): void {
    setInstances(
      instances.filter(
        instance =>
          !(
            instance.template_name === templateName &&
            instance.template_creator === templateAuthor &&
            instance.name === instanceName
          ),
      ),
    );
  }
  const nestedTemplates = prepareNesting(templates, instances);
  const sections = sortStratagey !== 'river' && toSection(nestedTemplates, sortStratagey, favs);
  return (
    <div className="home-container">
      <Header />
      <div className="home-container-contents">
        <div className="home-container-contents-width-set full-width">
          <h1>Ivy: an Integrated Visualization Editor </h1>
        </div>
        <div className="flex flex-wrap home-header">
          {instances
            .concat([...new Array(100 - instances.length)])
            .sort(() => Math.random() * 2 - 1)
            .map((instance, idx) => {
              return (
                <InstanceCard
                  key={`blank-${idx}`}
                  entry={
                    instance ||
                    ({
                      template_creator: `blank-${idx}`,
                      template_name: 'fillter',
                      name: 'filler',
                      instance_creator: 'blank',
                    } as Instance)
                  }
                  forPreview={true}
                  userName={userName}
                />
              );
            })}
        </div>
        <div className="home-container-contents-width-set">
          <p>
            This is the home page of Ivy, an application for exploring data and creating data visualizations.
            It supports a number of different types of visualization making including the chart choosing
            (found in tools like Excel), shelf building (found in tools like Tableau), and programmatic
            manipulation (such as in tools like vega or vega-lite). All of these modalities are linked
            together through a single interfaces made possible by an abstraction called <b>templates</b>.
          </p>
          <p>
            We support templates in a variety of languages including{' '}
            <a href="https://vega.github.io/vega/" target="_blank" rel="noopener noreferrer">
              vega
            </a>
            ,{' '}
            <a href="https://vega.github.io/vega-lite/" target="_blank" rel="noopener noreferrer">
              vega-lite
            </a>
            ,{' '}
            <a href="https://unit-vis.netlify.app/" target="_blank" rel="noopener noreferrer">
              atom
            </a>
            , and a custom data table language. It&apos;s okay if you are not familiar with these languages,
            it&apos;s not strictly necessary to know them in order to make effective usage of our tool.
          </p>
          <hr />
          <h3 className="home-container-label">
            Select a template or template instance (or just go to <Link to="/editor/">the editor</Link>)
          </h3>
          <div className="flex">
            <b>Sort by</b>
            {['favorites', 'river', ...SECTIONS].map(strat => (
              <Link to={`/?${strat}`} key={strat}>
                <button type="button" onClick={(): any => setSortStratagey(strat)} key={strat}>
                  {strat}
                </button>
              </Link>
            ))}
          </div>
          {sections && (
            <div className="flex-down">
              {Object.entries(sections).map(([name, temps], idx) => {
                return (
                  <div className="flex-down" key={`${name}-row-${idx}`}>
                    {name !== `null` && <h1>{name}</h1>}
                    <div style={{paddingLeft: '10px'}}>
                      {temps.map((row: any) => {
                        const {
                          template: {templateName, templateAuthor},
                        } = row;
                        return (
                          <RenderTemplateWithInstances
                            key={`${templateName}${BINDER}${templateAuthor}`}
                            row={row}
                            favoriteTemplatesConfig={{favs, setFavs}}
                            userName={userName}
                            removeInstance={removeInstance}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {!sections && (
            <div className="flex flex-wrap">
              {instances
                .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                .map((x, idx) => (
                  <InstanceCard
                    entry={x}
                    forPreview={false}
                    userName={userName}
                    key={`river-instance-${idx}`}
                  />
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function mapStateToProps({base}: {base: AppState; data: DataReducerState}): any {
  return {
    currentlySelectedFile: base.currentlySelectedFile,
    templates: base.templates,
    userName: base.userName,
  };
}

export default connect(mapStateToProps, actionCreators)(HomeContainer);
