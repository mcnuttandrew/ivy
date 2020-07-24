import React from 'react';
import {TiDeleteOutline} from 'react-icons/ti';
import {IgnoreKeys} from 'react-hotkeys';
import {Range} from 'rc-slider';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface Props {
  column: any;
  filter: {filter: {range: any[]; field: string; type: string}};
  updateFilter: (x: any) => void;
  deleteFilter: () => void;
}
type selType = {[x: string]: boolean};

function DateFilter({filter, updateFilter}: Props): JSX.Element {
  const {
    filter: {range},
  } = filter;
  return (
    <div className="flex-down">
      <IgnoreKeys style={{height: '100%'}}>
        <div className="flex">
          <span>Start</span>
          <DatePicker selected={range[0]} onChange={(date): any => updateFilter([date, range[1]])} />
        </div>
        <div className="flex">
          <span>End</span>
          <DatePicker selected={range[1]} onChange={(date): any => updateFilter([range[0], date])} />
        </div>
      </IgnoreKeys>
    </div>
  );
}

function MeasureFilter({filter, column, updateFilter}: Props): JSX.Element {
  const filterRange = filter.filter.range;
  const {domain} = column;
  return (
    <div className="flex-down">
      <IgnoreKeys style={{height: '100%'}}>
        <div className="grid">
          <span className="grid-col-1">min</span>
          <input
            aria-label="filter min value"
            className="grid-col-2"
            type="number"
            value={filterRange[0]}
            onChange={({target: {value}}): any => updateFilter([Number(value), filterRange[1]])}
          />
          <span className="grid-col-1">max</span>
          <input
            aria-label="filter max value"
            className="grid-col-2"
            type="number"
            value={filterRange[1]}
            onChange={({target: {value}}): any => updateFilter([filterRange[0], Number(value)])}
          />
        </div>
        <div className="range-wrap ">
          <Range
            allowCross={false}
            min={domain[0]}
            max={domain[1]}
            step={(domain[1] - domain[0]) / 100}
            marks={{[domain[0]]: domain[0], [domain[1]]: domain[1]}}
            defaultValue={filterRange}
            onChange={(x: number[]): any => updateFilter(x)}
          />
        </div>
      </IgnoreKeys>
    </div>
  );
}

function DimensionFilter({filter, updateFilter, column}: Props): JSX.Element {
  const {
    filter: {field, range},
  } = filter;
  const {domain} = column;
  const selectedVals: selType = (range || []).reduce((acc: selType, key: string) => {
    acc[key] = true;
    return acc;
  }, {});
  return (
    <div className="flex-down">
      <div className="flex space-between">
        <div
          onClick={(): void => {
            updateFilter(domain);
          }}
        >
          Select All
        </div>
        <div
          onClick={(): void => {
            updateFilter([]);
          }}
        >
          Clear All
        </div>
        <div>{`(${range.length} / ${domain.length})`}</div>
      </div>
      {domain.map((option: string) => {
        /* TODO, maybe use react-virtualized here? */
        const key = `${option}-${field}-checkbox`;
        return (
          <div key={key}>
            <label>
              <input
                type="checkbox"
                checked={selectedVals[option] ? true : false}
                onChange={(): void => {
                  selectedVals[option] = !selectedVals[option];
                  updateFilter(
                    Object.entries(selectedVals)
                      .filter((x: [string, boolean]) => x[1])
                      .map((x: [string, boolean]) => x[0]),
                  );
                }}
              />
              {option}
            </label>
          </div>
        );
      })}
    </div>
  );
}

export default function Filter(props: Props): JSX.Element {
  const {column, filter, deleteFilter} = props;
  const {
    filter: {field, type},
  } = filter;
  if (!column) {
    return <div />;
  }

  return (
    <div className="flex-down filter-container">
      <div className="flex space-between filter-header">
        <div>{field}</div>
        <div onClick={deleteFilter} className="filter-cancel">
          <TiDeleteOutline />
        </div>
      </div>
      <div className="filter-contents">
        {type === 'DIMENSION' && DimensionFilter(props)}
        {type === 'MEASURE' && MeasureFilter(props)}
        {type === 'TIME' && DateFilter(props)}
      </div>
    </div>
  );
}
