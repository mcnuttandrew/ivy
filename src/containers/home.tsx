import React, {useEffect, useState} from 'react';
import {connect} from 'react-redux';
import {TiStar} from 'react-icons/ti';
import {RenderTypeCounts} from '../components/template-card';

import Tooltip from 'rc-tooltip';
import {getFavoriteTemplates, setFavoriteTemplates} from '../utils/local-storage';
import {getTemplates} from '../utils/api';
import * as actionCreators from '../actions/index';
import {FETCH_PARMS, BINDER} from '../constants';
import {AppState, DataReducerState, Template} from '../types';
import {toSection, SECTIONS, classnames} from '../utils';
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
  return templates.map((template) => ({template, entries: groups[toKey(template)] || []}));
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
}
function InstanceCard(props: InstanceCardProps): JSX.Element {
  const {entry, forPreview} = props;
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
      </div>
    </div>
  );
}

interface RenderTemplateWithInstancesProps {
  row: {template: Template; entries: any[]};
  favoriteTemplatesConfig: {favs: Set<string>; setFavs: any};
}
function RenderTemplateWithInstances(props: RenderTemplateWithInstancesProps): JSX.Element {
  const {row, favoriteTemplatesConfig} = props;
  const {template, entries} = row;

  const {templateName, templateAuthor, templateDescription} = template;
  const kabobbedAuthor = templateAuthor.replace(/\s+/g, '-');
  const kabbobedName = templateName.replace(/\s+/g, '-');
  const {favs, setFavs} = favoriteTemplatesConfig;
  const key = toKey(template);
  return (
    <div className={`margin-bottom home-template-row flex  ${kabobbedAuthor}-${kabbobedName}`}>
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
                Array.from(newSet).map((x) => {
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
          <b className="margin-right">{'Template: '}</b>
          <Link to={`/editor/${templateAuthor}/${templateName}`}>{templateName}</Link>
        </h4>
        <h5>
          <b>{'Author: '}</b>
          {templateAuthor}
        </h5>
        <h5>
          <b>{'Description: '}</b>
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
        <Tooltip
          placement="bottom"
          trigger={'click'}
          overlay={
            <div className="home-template-row-instances-container">
              <div className="flex-down">
                <h3>Templates Instances for {templateName}</h3>
                <p>These are the saved examples of this template in use. </p>
              </div>
              <div className="flex flex-wrap">
                {entries.map((entry, idx) => (
                  <InstanceCard entry={entry} forPreview={false} key={`instance-${idx}`} />
                ))}
              </div>
            </div>
          }
        >
          <button className="instance-toggle">
            Template Instances ({entries.length} instance{entries.length === 1 ? '' : 's'})
          </button>
        </Tooltip>
      </div>
    </div>
  );
}

const polestar = DEFAULT_TEMPLATES.find((x) => x.templateName === 'Polestar');
export function HomeContainer(props: Props): JSX.Element {
  const {recieveTemplates, templates} = props;
  const [favs, setFavs] = useState(new Set([]));
  const [instances, setInstances] = useState([] as Instance[]);
  const [sortStratagey, setSortStratagey] = useState(location.hash.split('?')[1] || 'favorites');

  useEffect(() => {
    // eslint-disable-next-line no-undef
    if (process.env.NODE_ENV === 'test') {
      return;
    }
    getFavoriteTemplates().then((x) => {
      const newFavs =
        x && x.length
          ? x.map((el) => `${el.templateName}${BINDER}${el.templateAuthor}`)
          : [`${polestar.templateName}${BINDER}${polestar.templateAuthor}`];
      return setFavs(new Set(newFavs));
    });
    getTemplates().then((x) => recieveTemplates(x));
    // .then((loadedTemplates) => recieveTemplates(loadedTemplates.map((x: any) => x.template)));
    fetch(`.netlify/functions/template-instances`, FETCH_PARMS as any)
      .then((x) => x.json())
      .then((loadedInstances) => setInstances(loadedInstances));
  }, []);
  // function removeInstance(templateAuthor: string, templateName: string, instanceName: string): void {
  //   setInstances(
  //     instances.filter(
  //       instance =>
  //         !(
  //           instance.template_name === templateName &&
  //           instance.template_creator === templateAuthor &&
  //           instance.name === instanceName
  //         ),
  //     ),
  //   );
  // }
  const nestedTemplates = prepareNesting(templates, instances);
  const sections = sortStratagey !== 'river' && toSection(nestedTemplates, sortStratagey, favs);
  return (
    <div className="home-container">
      <Header />
      <div className="home-container-contents">
        <div className="home-container-contents-width-set full-width">
          <h1>Ivy: A Visualization Editor</h1>
        </div>
        <div className="flex flex-wrap home-header">
          {instances
            .concat([...new Array(Math.max(62 - instances.length, 0))])
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
            These <b>Templates</b> are essentially little functions that can be represented both graphically
            and textually. They have arguments (the values of GUI widgets) and they have a function body (the
            way that chart interacts with those arguments). They provide a series of light abstraction
            mechanisms that enable a good degree of flexibility in the way that interfaces to charts are
            formed. You can find out more about the specifics of this template language (called the Ivy
            Template Language or ITL) in the <Link to="/docs">docs</Link>.
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
          <p className="flex-down">
            <span>
              You can view a <a href="https://archive.org/embed/ivy-tutorial-1-v-2">video tutorial here</a>.
            </span>
          </p>
          <p className="flex-down">
            <span>
              Find out more by checking out our{' '}
              <a href="https://arxiv.org/pdf/2101.07902.pdf">CHI21 paper here</a>.
            </span>
          </p>
          <hr />
          <h3 className="home-container-label">
            Select a template or template instance (or just go to <Link to="/editor/">the editor</Link>)
          </h3>
          <div className="flex">
            <b>Sort by</b>
            {['favorites', 'river', ...SECTIONS].map((strat) => (
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
                    <div className="flex flex-wrap">
                      {temps.map((row: any) => {
                        const {
                          template: {templateName, templateAuthor},
                        } = row;
                        return (
                          <RenderTemplateWithInstances
                            key={`${templateName}${BINDER}${templateAuthor}`}
                            row={row}
                            favoriteTemplatesConfig={{favs, setFavs}}
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
                  <InstanceCard entry={x} forPreview={false} key={`river-instance-${idx}`} />
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
