import React from 'react';
import {TiDeleteOutline} from 'react-icons/ti';
import {Range} from 'rc-slider';

interface FilterProps {
  column: any;
  filter: any;
  updateFilter: any;
  deleteFilter: any;
}

export default function Filter({
  column,
  filter,
  updateFilter,
  deleteFilter,
}: FilterProps) {
  const {
    filter: {range, field, oneOf},
  } = filter;
  const {domain} = column;
  const selectedVals = (oneOf || []).reduce(
    (acc: {[x: string]: boolean}, key: string) => {
      acc[key] = true;
      return acc;
    },
    {},
  );
  return (
    <div className="flex-down filter-container">
      <div className="flex space-between filter-header">
        <div>{field}</div>
        <div onClick={deleteFilter} className="filter-cancel">
          <TiDeleteOutline />
        </div>
      </div>
      <div className="filter-contents">
        {range && (
          <div className="flex-down">
            <div className="grid">
              <span className="grid-col-1">min</span>
              <input
                className="grid-col-2"
                type="number"
                value={range[0]}
                onChange={({target: {value}}) =>
                  updateFilter([Number(value), range[1]])
                }
              />
              <span className="grid-col-1">max</span>
              <input
                className="grid-col-2"
                type="number"
                value={range[1]}
                onChange={({target: {value}}) =>
                  updateFilter([range[0], Number(value)])
                }
              />
            </div>
            <div className="range-wrap ">
              <Range
                allowCross={false}
                min={domain[0]}
                max={domain[1]}
                step={(domain[1] - domain[0]) / 100}
                marks={{[domain[0]]: domain[0], [domain[1]]: domain[1]}}
                defaultValue={range}
                onChange={(x: number[]) => updateFilter(x)}
              />
            </div>
          </div>
        )}
        {oneOf && (
          <div className="flex-down">
            <div className="flex space-between">
              <div
                onClick={() => {
                  updateFilter(domain);
                }}
              >
                Select All
              </div>
              <div
                onClick={() => {
                  updateFilter([]);
                }}
              >
                Clear All
              </div>
              <div>{`(${oneOf.length} / ${domain.length})`}</div>
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
                      onChange={() => {
                        selectedVals[option] = !selectedVals[option];
                        updateFilter(
                          Object.entries(selectedVals)
                            .filter(([_, x]: [string, boolean]) => x)
                            .map(([x, _]: [string, boolean]) => x),
                        );
                      }}
                    />
                    {option}
                  </label>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
