// WIP THIS ONE IS HARD
import * as stringify from 'json-stringify-pretty-compact';
import {Template} from '../types';
import {AUTHORS} from '../constants/index';
const cols = [0, 1, 2, 3, 4, 5];

const RADAR: any = {
  $schema: 'https://vega.github.io/schema/vega/v5.json',
  description: 'A radar chart example, showing multiple dimensions in a radial layout.',
  width: '[ChartSize]',
  height: '[ChartSize]',
  padding: {
    left: 75,
    right: 100,
    top: 50,
    bottom: 50,
  },
  autosize: {type: 'none', contains: 'padding'},
  signals: [{name: 'radius', update: 'width / 2'}],
  data: [
    {name: 'inputCopy', values: 'myData'},
    {
      name: 'table',
      values: 'myData',
      transform: [
        {
          type: 'aggregate',
          fields: cols.map((idx) => ({$if: `parameters.Col${idx}`, true: `[Col${idx}]`})),
          groupby: ['[ColorBy]'],
          ops: cols.map((idx) => ({$if: `parameters.Col${idx}`, true: `[Col${idx}Agg]`})),
          as: cols.map((idx) => ({$if: `parameters.Col${idx}`, true: `[Col${idx}]`})),
        },
        {
          type: 'fold',
          fields: cols.map((idx) => ({$if: `parameters.Col${idx}`, true: `[Col${idx}]`})),
        },
      ],
    },

    {
      name: 'keys',
      source: 'table',
      transform: [{type: 'aggregate', groupby: ['[ColorBy]']}],
    },
  ],
  legends: [{fill: 'color', symbolType: 'circle', title: '[ColorBy]', orient: 'right'}],
  scales: [
    {
      name: 'angular',
      type: 'point',
      range: {signal: '[-PI, PI]'},
      padding: 0.5,
      domain: {data: 'table', field: 'key'},
    },
    {
      name: 'radial',
      type: 'linear',
      range: {signal: '[0, radius]'},
      zero: true,
      nice: false,
      domain: {data: 'table', field: 'value'},
      domainMin: 0,
    },
    ...cols.map((idx) => ({
      $if: `parameters.Col${idx}`,
      true: {
        name: `[Col${idx}]`,
        type: 'linear',
        range: {signal: '[0, radius]'},
        zero: true,
        nice: false,
        domain: {data: 'inputCopy', field: `[Col${idx}]`},
        domainMin: 0,
      },
    })),
    {
      name: 'color',
      type: 'ordinal',
      domain: {data: 'table', field: '[ColorBy]'},
      range: {scheme: '[ColorScheme]'},
    },
  ],
  encode: {enter: {x: {signal: '0'}, y: {signal: '0'}}},
  marks: [
    {
      type: 'group',
      name: 'categories',
      zindex: 1,
      from: {facet: {data: 'table', name: 'facet', groupby: ['[ColorBy]']}},
      marks: [
        {
          type: 'line',
          name: 'category-line',
          from: {data: 'facet'},
          encode: {
            enter: {
              interpolate: {value: 'linear-closed'},
              x: {
                signal:
                  "scale(datum.key, datum.value) * cos(scale('angular', datum.key) + ([chartAngle] / 360) * PI) + radius",
              },
              y: {
                signal:
                  "scale(datum.key, datum.value) * sin(scale('angular', datum.key) + ([chartAngle] / 360) * PI) + radius",
              },
              stroke: {scale: 'color', field: '[ColorBy]'},
              strokeWidth: {value: 1},
              strokeOpacity: {
                value: {$if: 'parameters.showLines.includes("true")', true: 1, false: 0},
              },
              fill: {scale: 'color', field: '[ColorBy]'},
              fillOpacity: {
                value: {$if: 'parameters.showLines.includes("true")', true: 0.1, false: 0},
              },
            },
          },
        },
        {
          $if: 'parameters.showDots.includes("true")',
          true: {
            type: 'symbol',
            name: 'value-dot',
            from: {data: 'category-line'},
            encode: {
              enter: {
                x: {signal: 'datum.x'},
                y: {signal: 'datum.y'},
                fill: {value: 'black'},
                size: {value: 30},
                tooltip: {field: 'datum'},
              },
              update: {
                stroke: {value: 'white'},
                strokeWidth: {value: 1},
                zindex: {value: 0},
              },
              hover: {stroke: {value: 'purple'}, strokeWidth: {value: 3}, zindex: {value: 1}},
            },
          },
        },
        {
          $if: 'parameters.showText.includes("true")',
          true: {
            type: 'text',
            name: 'value-text',
            from: {data: 'category-line'},
            encode: {
              enter: {
                x: {signal: 'datum.x'},
                y: {signal: 'datum.y'},
                text: {signal: 'format(datum.datum.value, ".2f")'},
                align: {value: 'center'},
                baseline: {value: 'middle'},
                fill: {value: 'black'},
              },
            },
          },
        },
      ],
    },
    // this section is the axes
    {
      type: 'rule',
      name: 'radial-grid',
      from: {data: 'table'},
      zindex: 0,
      encode: {
        enter: {
          x: {signal: 'radius'},
          y: {signal: 'radius'},
          x2: {signal: "radius * cos(scale('angular', datum.key) + ([chartAngle] / 360) * PI) + radius"},
          y2: {signal: "radius * sin(scale('angular', datum.key) + ([chartAngle] / 360) * PI) + radius"},
          stroke: {value: 'lightgray'},
          strokeWidth: {value: 1},
        },
      },
    },
    {
      type: 'text',
      name: 'key-label',
      from: {data: 'table'},
      zindex: 1,
      encode: {
        enter: {
          x: {
            signal: "(radius + 5) * cos(scale('angular', datum.key) + ([chartAngle] / 360) * PI) + radius",
          },
          y: {
            signal: "(radius + 5) * sin(scale('angular', datum.key) + ([chartAngle] / 360) * PI) + radius",
          },
          text: {field: 'key', format: '%2f'},
          align: [
            {test: "abs(scale('angular', datum.key) + ([chartAngle] / 360) * PI) > PI / 2", value: 'right'},
            {value: 'left'},
          ],
          baseline: [
            {test: "scale('angular', datum.key) > 0", value: 'top'},
            {test: "scale('angular', datum.key) == 0", value: 'middle'},
            {value: 'bottom'},
          ],
          fill: {value: 'black'},
          fontWeight: {value: 'bold'},
        },
      },
    },
    {
      type: 'line',
      name: 'outer-line',
      from: {data: 'radial-grid'},
      encode: {
        enter: {
          interpolate: {value: 'linear-closed'},
          x: {signal: 'datum.x2 '},
          y: {signal: 'datum.y2 '},
          stroke: {value: 'lightgray'},
          strokeWidth: {value: 1},
        },
      },
    },
  ],
};

const toDisplay = (x: string): {display: string; value: string} => ({display: x, value: `"${x}"`});
const RadarChart: Template = {
  templateName: 'Radar Chart',
  templateDescription:
    'Display values relative to a center point. Use it when the categories are not directly comparable.',
  templateAuthor: AUTHORS,
  templateLanguage: 'vega',
  disallowFanOut: true,
  widgets: [
    {name: `ColorBy`, type: 'DataTarget', config: {allowedTypes: ['DIMENSION'], required: true}},
    {
      name: 'ColorScheme',
      type: 'List',
      config: {
        allowedValues: [
          'set2',
          'accent',
          'category10',
          'category20',
          'category20b',
          'category20c',
          'dark2',
          'paired',
          'pastel1',
          'pastel2',
          'set1',
          'set3',
          'tableau10',
          'tableau20',
        ].map(toDisplay),
      },
    },
    {
      name: 'ChartSize',
      displayName: 'Chart Size',
      type: 'Slider',
      config: {minVal: 300, maxVal: 800, step: 1, defaultValue: 500},
    },
    {
      name: 'chartAngle',
      displayName: 'Chart Angle',
      type: 'Slider',
      config: {minVal: 0, maxVal: 360, step: 1, defaultValue: 1},
    },
    {
      name: 'showLines',
      type: 'Switch',
      config: {active: 'true', inactive: 'false', defaultsToActive: true},
    },
    {
      name: 'showText',
      type: 'Switch',
      config: {active: 'true', inactive: 'false', defaultsToActive: false},
    },
    {
      name: 'showDots',
      type: 'Switch',
      config: {active: 'true', inactive: 'false', defaultsToActive: true},
    },
    ...cols.reduce((acc, idx) => {
      acc.push({name: `Col${idx}`, type: 'DataTarget', config: {allowedTypes: ['MEASURE'], required: !idx}});
      acc.push({
        name: `Col${idx}Agg`,
        type: 'List',
        config: {
          allowedValues: ['mean', 'sum', 'median', 'min', 'count', 'max'].map(toDisplay),
          defaultValue: '"mean"',
        },
        displayName: 'Aggregate',
      });
      return acc;
    }, []),
  ],
  code: stringify(RADAR),
};
export default RadarChart;
