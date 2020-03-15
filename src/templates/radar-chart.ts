// WIP THIS ONE IS HARD
import stringify from 'json-stringify-pretty-compact';
import {Template} from '../types';
import {toList} from '../utils';
import {AUTHORS} from '../constants/index';
const RADAR: any = {
  $schema: 'https://vega.github.io/schema/vega/v5.json',
  width: 700,
  height: 400,
  padding: 5,

  signals: [{name: 'radius', update: 'width / 2'}],
  config: {
    axisY: {
      titleX: -2,
      titleY: 410,
      titleAngle: 0,
      titleAlign: 'right',
      titleBaseline: 'top',
    },
  },

  data: [
    {
      name: 'table',
      values: 'myData',
    },
    {
      name: 'fields',
      values: [
        ...[0, 1, 2, 3, 4, 5].map(idx => {
          return {
            $cond: {query: `parameters.Col${idx}`, true: `[Col${idx}]`},
          };
        }),
      ],
    },
  ],

  scales: [
    {
      name: 'angular',
      type: 'point',
      range: {signal: '[-PI, PI]'},
      round: true,
      padding: 0.5,
      domain: {data: 'fields', field: 'data'},
    },
    ...[0, 1, 2, 3, 4, 5].map(idx => {
      return {
        $cond: {
          query: `parameters.Col${idx}`,
          true: {
            name: `[Col${idx}]`,
            type: 'linear',
            range: {signal: '[0, radius]'},
            zero: `[Col${idx}Zero]`,
            nice: false,
            domain: {data: 'table', field: `[Col${idx}]`},
            domainMin: 0,
          },
        },
      };
    }),
    {
      $cond: {
        query: 'parameters.ColorBy',
        true: {
          name: 'color',
          type: 'ordinal',
          domain: {data: 'table', field: '[ColorBy]', sort: true},
          range: 'category',
        },
      },
    },
  ],

  axes: [
    // ...[0, 1, 2, 3, 4, 5].map(idx => {
    //   return {
    //     $cond: {
    //       query: `parameters.Col${idx}`,
    //       true: {
    //         orient: 'left',
    //         zindex: 1,
    //         scale: `[Col${idx}]`,
    //         title: `[Col${idx}]`,
    //         offset: {scale: 'ord', value: `[Col${idx}]`, mult: -1},
    //       },
    //     },
    //   };
    // }),
  ],
  legends: [{stroke: 'color', title: '[ColorBy]'}],
  marks: [
    {
      type: 'group',
      from: {data: 'table'},
      marks: [
        {
          type: 'line',
          name: 'category-line',
          from: {data: 'fields'},
          encode: {
            enter: {
              x: {scale: 'angular', field: 'data'},
              y: {scale: {datum: 'data'}, field: {parent: {datum: 'data'}}},
              stroke: {value: 'steelblue'},
              strokeWidth: {value: 1.01},
              strokeOpacity: {value: 0.3},
              //   stroke: {
              //     $cond: {
              //       query: 'parameters.ColorBy',
              //       true: {field: {parent: '[ColorBy]'}, scale: 'color'},
              //       false: {value: '[Single Color]'},
              //     },
              //   },
            },
            // enter: {
            //   interpolate: {value: 'linear-closed'},
            //   x: {signal: "scale(datum.data, datum.value) * cos(scale('angular', datum.data))"},
            //   y: {signal: "scale(datum.data, datum.value) * sin(scale('angular', datum.data))"},
            //   //   stroke: {scale: 'color', field: 'category'},
            //   strokeWidth: {value: 1},
            //   //   fill: {scale: 'color', field: 'category'},
            //   fill: {value: 'red'},
            //   fillOpacity: {value: 0.1},
            // },
          },
        },
      ],
    },

    {
      type: 'rule',
      name: 'radial-grid',
      from: {data: 'fields'},
      zindex: 0,
      encode: {
        enter: {
          x: {value: 0},
          y: {value: 0},
          x2: {signal: "radius * cos(scale('angular', datum.key))"},
          y2: {signal: "radius * sin(scale('angular', datum.key))"},
          stroke: {value: 'lightgray'},
          strokeWidth: {value: 1},
        },
      },
    },
  ],
};

const cols = [0, 1, 2, 3, 4, 5];
const RadarChart: Template = {
  templateName: 'Radar Chart',
  templateDescription: 'A way to visualize the relationships between a variety of measure varables in radial',
  templateAuthor: AUTHORS,
  templateLanguage: 'vega',
  disallowFanOut: true,
  widgets: [
    {type: 'Section', name: 'warning header'},
    {
      type: 'Text',
      name: 'repeat warning',
      config: {text: 'This template requires each column be unique'},
      conditions: [
        {
          query: `${cols
            .map((d, idx) =>
              cols
                .filter((x, jdx) => idx !== jdx)
                .map(x => `(parameters.Col${d} && (parameters.Col${x} === parameters.Col${d}))`)
                .join(' || '),
            )
            .join(' || ')}`,
          queryResult: 'show',
        },
      ],
    },
    {
      name: `ColorBy`,
      type: 'DataTarget',
      config: {allowedTypes: ['DIMENSION'], required: true},
    },
    ...cols.reduce((acc, idx) => {
      acc.push({
        name: `Col${idx}`,
        type: 'DataTarget',
        config: {allowedTypes: ['MEASURE'], required: !idx},
      });
      return acc;
    }, []),
  ],
  code: stringify(RADAR),
};
export default RadarChart;
