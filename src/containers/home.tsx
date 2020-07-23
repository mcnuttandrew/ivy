import React, {useEffect, useState} from 'react';
import {connect} from 'react-redux';
import {TiStar} from 'react-icons/ti';
import {RenderTypeCounts} from '../components/template-card';

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
): JSX.Element {
  const {templateName, templateAuthor, templateDescription} = template;
  const {favs, setFavs} = favoriteTemplatesConfig;
  const key = toKey(template);
  return (
    <div className="flex template-info-container">
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
      <div className="flex-down template-info">
        <h4>
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
      </div>
    </div>
  );
}

function renderTemplateWithInstances(
  row: {template: Template; entries: any[]},
  favoriteTemplatesConfig: {favs: Set<string>; setFavs: any},
  // currentlySelectedFile: string,
): JSX.Element {
  const {template, entries} = row;
  const {templateName, templateAuthor} = template;

  const key = `${templateName}${BINDER}${templateAuthor}`;
  const kabobbedAuthor = templateAuthor.replace(/\s+/g, '-');
  const kabbobedName = templateName.replace(/\s+/g, '-');
  return (
    <div
      key={key}
      className={`margin-bottom home-template-row flex flex-wrap ${kabobbedAuthor}-${kabbobedName}`}
    >
      {templateInfo(template, favoriteTemplatesConfig)}
      {entries.map((entry: any, idx: number) => {
        // const {instance_name, dataset} = entry;
        const {name} = entry;
        // const changingDataset = dataset === currentlySelectedFile;
        // console.log(changingDataset);
        return (
          <div key={`${templateName}-${templateAuthor}-${idx}`} className="flex-down">
            {/* TODO ADD AN "ARE YOU SURE IF THE ASSOCIATED DATASET IS DIFFERENT" */}
            {/* the way to do this is to have this component if it's the same or ndivl and a checker if it's different */}
            <div className="home-preview-container">
              <Link to={`/editor/${templateAuthor}/${templateName}/${name}`}>
                <div className="home-preview">
                  <Thumbnail
                    templateName={templateName}
                    templateAuthor={templateAuthor}
                    templateInstance={name}
                  />
                </div>
                {name}
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const polestar = DEFAULT_TEMPLATES.find(x => x.templateName === 'Polestar');
export function HomeContainer(props: Props): JSX.Element {
  const {loadTemplates, templates} = props;
  const [favs, setFavs] = useState(new Set([]));
  const [instances, setInstances] = useState([]);
  const [sortStratagey, setSortStratagey] = useState('favorites');

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
      .then(loadedTemplates => loadTemplates(loadedTemplates.map((x: any) => x.template)));
    fetch(`${serverPrefix()}/template-instances`, FETCH_PARMS as any)
      .then(x => x.json())
      .then(loadedInstances => setInstances(loadedInstances));
  }, []);
  const nestedTemplates = prepareNesting(templates, instances);
  const sections = toSection(nestedTemplates, sortStratagey, favs);
  return (
    <div className="home-container">
      <Header />
      <div className="home-container-contents">
        <h1>Ivy: an Integrated Visualization Editor </h1>
        <p>
          This is the home page of Ivy, an application for exploring data and creating data visualizations. It
          supports a number of different types of visualization making including the chart choosing (found in
          tools like Excel), shelf building (found in tools like Tableau), and programmatic manipulation (such
          as in tools like vega or vega-lite). All of these modalities are linked together through a single
          interfaces made possible by an abstraction called <b>templates</b>.
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
          , and a custom data table language. It&apos;s okay if you are familar with these languages,
          it&apos;s not strictly necessary to know them in order to make effective usage of our tool.
        </p>
        <hr />
        <h3>
          Select a template or template instance (or just go to <Link to="/editor/">the editor</Link>)
        </h3>
        <div className="flex">
          <b>Sort by</b>
          {['favorites', ...SECTIONS].map(strat => (
            <button type="button" onClick={(): any => setSortStratagey(strat)} key={strat}>
              {strat}
            </button>
          ))}
        </div>
        <div className="flex-down">
          {Object.entries(sections).map(([name, temps], idx) => {
            return (
              <div className="flex-down" key={`${name}-row-${idx}`}>
                {name !== `null` && <h1>{name}</h1>}
                <div className="">
                  {temps.map((row: any) => renderTemplateWithInstances(row, {favs, setFavs}))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function mapStateToProps({base}: {base: AppState; data: DataReducerState}): any {
  return {
    currentlySelectedFile: base.currentlySelectedFile,
    templates: base.templates,
  };
}

export default connect(mapStateToProps, actionCreators)(HomeContainer);
