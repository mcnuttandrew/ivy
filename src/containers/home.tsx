import React, {useEffect, useState} from 'react';
import {connect} from 'react-redux';

import * as actionCreators from '../actions/index';
import {FETCH_PARMS} from '../constants';
import {AppState, DataReducerState} from '../types';
import {serverPrefix, toSection, SECTIONS} from '../utils';
import {ActionUser} from '../actions';
import {DEFAULT_TEMPLATES} from '../templates';
import Header from '../components/header';
import Thumbnail from '../components/thumbnail';
interface Props extends ActionUser {
  currentlySelectedFile: string;
}
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

function renderTemplateWithInstances(
  row: {templateName: string; templateAuthor: string; entries: any[]},
  // currentlySelectedFile: string,
): JSX.Element {
  const {templateName, templateAuthor, entries} = row;
  const descriptionItem = entries.find((x: any) => x.template_description);
  const description = descriptionItem && descriptionItem.template_description;
  return (
    <div
      key={`${templateName}-${templateAuthor}`}
      className={`margin-bottom home-template-row ${templateAuthor.replace(
        /\s+/g,
        '-',
      )}-${templateName.replace(/\s+/g, '-')}`}
    >
      <h4>
        <Link to={`/editor/${templateAuthor}/${templateName}`}>
          {templateName} - {templateAuthor}
        </Link>
      </h4>
      <h5>{description}</h5>
      <div className="flex flex-wrap">
        {entries.map((entry: any, idx: number) => {
          // const {instance_name, dataset} = entry;
          const {instance_name} = entry;
          // const changingDataset = dataset === currentlySelectedFile;
          // console.log(changingDataset);
          return (
            <div key={`${templateName}-${templateAuthor}-${idx}`} className="flex-down">
              {/* TODO ADD AN "ARE YOU SURE IF THE ASSOCIATED DATASET IS DIFFERENT" */}
              {/* the way to do this is to have this component if it's the same or ndivl and a checker if it's different */}
              <Link to={`/editor/${templateAuthor}/${templateName}/${instance_name}`}>
                <div className="home-preview">
                  <Thumbnail
                    templateName={templateName}
                    templateAuthor={templateAuthor}
                    templateInstance={instance_name}
                  />
                </div>
                {entry.instance_name}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function HomeContainer(): JSX.Element {
  // const {currentlySelectedFile} = props;
  const [templates, setTemplates] = useState(prepareNesting(DEFAULT_TEMPLATES));
  const [sortStratagey, setSortStratagey] = useState('none');
  const sections = toSection(
    templates.map((x: any) => ({template: x})),
    sortStratagey,
  );
  useEffect(() => {
    // eslint-disable-next-line no-undef
    if (process.env.NODE_ENV === 'test') {
      return;
    }
    fetch(`${serverPrefix()}/recent-names`, FETCH_PARMS as any)
      .then(x => x.json())
      .then(x => {
        setTemplates(prepareNesting(DEFAULT_TEMPLATES.concat(x)));
      });
  }, []);
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
            vega
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
          {SECTIONS.map(strat => (
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
                <div className="">{temps.map((row: any) => renderTemplateWithInstances(row.template))}</div>
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
  };
}

export default connect(mapStateToProps, actionCreators)(HomeContainer);
