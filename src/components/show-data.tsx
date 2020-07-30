import React, {useEffect, useState} from 'react';
import {Template, Json, LanguageExtension, TemplateMap} from '../types';
import {DataRow} from '../actions';
interface Props {
  data: DataRow[];
  languages: {[x: string]: LanguageExtension};
  template: Template;
  spec: Json;
  templateMap: TemplateMap;
}

function serializeCell(cellValue: any): any {
  if (typeof cellValue === 'object') {
    if (cellValue && Object.values(cellValue).every(x => typeof x !== 'object')) {
      return JSON.stringify(cellValue);
    } else {
      return '(...)';
    }
  }
  return cellValue;
}

function showTable(data: any[]): any {
  const columns = Object.keys(data[0] || {});
  return (
    <table>
      <thead>
        <tr>
          {(columns as any[]).map((column: any) => {
            return <th key={column}>{column}</th>;
          })}
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx: number) => {
          return (
            <tr key={idx}>
              {(columns as any[]).map((column: any, jdx: number) => {
                return <td key={`${column}-${idx}-${jdx}`}>{serializeCell(row[column])}</td>;
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default function ShowData(props: Props): JSX.Element {
  const {spec, template, languages, data, templateMap} = props;
  const [loadedData, setLoadedData] = useState({} as {[x: string]: any[]});
  const [selectedData, setSelectedData] = useState(null);
  const [error, catchError] = useState(null);
  useEffect(() => {
    languages[template.templateLanguage]
      .getDataViews({
        spec,
        data,
        onError: () => {},
      })
      .then(x => {
        setSelectedData(Object.keys(x)[0]);
        setLoadedData(x);
      })
      .catch(e => catchError(e));
  }, [JSON.stringify(spec), JSON.stringify(templateMap)]);
  return (
    <div className="flex-down">
      <div className="show-data-table-controls">
        <select onChange={(x): any => setSelectedData(x.target.value)}>
          {Object.keys(loadedData).map(key => (
            <option value={key} key={key}>
              {key}
            </option>
          ))}
        </select>
        <div>Showing a sample of the current data</div>
      </div>
      {error && <div>{error}</div>}
      <div className="show-data-table">{showTable((loadedData[selectedData] || []).slice(0, 10))}</div>
    </div>
  );
}
