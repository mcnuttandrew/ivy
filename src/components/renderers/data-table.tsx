import React, {useState} from 'react';
import {TiArrowSortedDown, TiArrowSortedUp} from 'react-icons/ti';
interface Props {
  spec: {
    columns: string[];
  };
  data: {[x: string]: any}[];
}

const PAGE_SIZE = 30;
const abstractCompare = (sortKey: string, reverseSort: boolean) => (a: any, b: any): number =>
  (reverseSort ? -1 : 1) * `${a[sortKey]}`.localeCompare(`${b[sortKey]}`);
export default function DataTable(props: Props): JSX.Element {
  const {
    spec: {columns = []},
    data = [],
  } = props;
  const [page, setPage] = useState(0);
  const [sortKey, setSort] = useState(null);
  const [reverseSort, setSortOrder] = useState(false);
  const numPages = Math.ceil(data.length / PAGE_SIZE);
  const nextPageExists = page < numPages;
  const prevPageExists = page > 0;
  // TODO sorting, pagination
  const reducedData = data.map(row =>
    (columns || []).reduce((acc: any, column) => ({...acc, [column]: row[column]}), {}),
  );
  return (
    <div className="hydra-data-table">
      <div className="flex hydra-data-table-controls">
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
            {columns.map(column => {
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
                  {columns.map((column, jdx: number) => {
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
