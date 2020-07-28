import React, {useState} from 'react';
import {LanguageExtension, RendererProps, JsonMap, Template} from '../types';
import TABLE from '../templates/table';

import {TiArrowSortedDown, TiArrowSortedUp} from 'react-icons/ti';

const PAGE_SIZE = 30;
const abstractCompare = (sortKey: string, reverseSort: boolean) => (a: any, b: any): number =>
  (reverseSort ? -1 : 1) * `${a[sortKey]}`.localeCompare(`${b[sortKey]}`);
function DataTableRenderer(props: RendererProps): JSX.Element {
  const {spec, data = []} = props;
  const {columns} = spec as JsonMap;
  const [page, setPage] = useState(0);
  const [sortKey, setSort] = useState(null);
  const [reverseSort, setSortOrder] = useState(false);
  const numPages = Math.ceil(data.length / PAGE_SIZE);
  const nextPageExists = page < numPages;
  const prevPageExists = page > 0;
  // TODO sorting, pagination
  const reducedData = data.map(row =>
    ((columns as any) || []).reduce((acc: any, column: any) => ({...acc, [column]: row[column]}), {} as any),
  );
  return (
    <div className="ivy-data-table">
      <div className="flex ivy-data-table-controls">
        <button onClick={(): any => setPage(0)}>Reset</button>
        <button disabled={!nextPageExists} onClick={(): any => nextPageExists && setPage(page + 1)}>
          Next Page
        </button>
        <button disabled={!prevPageExists} onClick={(): any => prevPageExists && setPage(page - 1)}>
          Prev Page
        </button>
        <div>{`PAGE: ${page} / ${numPages}`}</div>
      </div>
      <table>
        <thead>
          <tr>
            {(columns as any[]).map((column: any) => {
              const isSort = column === sortKey;
              return (
                <th key={column} onClick={(): any => (isSort ? setSortOrder(!reverseSort) : setSort(column))}>
                  {column}
                  {isSort && (reverseSort ? <TiArrowSortedUp /> : <TiArrowSortedDown />)}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {reducedData
            .sort(abstractCompare(sortKey, reverseSort))
            .slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
            .map((row, idx: number) => {
              return (
                <tr key={idx}>
                  {(columns as any[]).map((column: any, jdx: number) => {
                    return <td key={`${column}-${idx}-${jdx}`}>{row[column]}</td>;
                  })}
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}

export const BLANK_TEMPLATE: Template = {
  templateAuthor: '',
  templateLanguage: 'data-table',
  templateName: 'BLANK DATA TABLE',
  templateDescription: 'FILL IN DESCRIPTION',
  disallowFanOut: true,
  customCards: [],
  code: TABLE.code,
  widgets: [],
};

const DATA_TABLE_CONFIG: LanguageExtension = {
  renderer: DataTableRenderer,
  suggestion: () => [],
  language: 'data-table',
  blankTemplate: BLANK_TEMPLATE,
  getDataViews: () => Promise.resolve([]),
};

export default DATA_TABLE_CONFIG;
