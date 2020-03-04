import stringify from 'json-stringify-pretty-compact';
import {Template} from '../types';
import {toList} from '../utils';
const PARALLEL_COORS: any = {
  $schema: 'https://vega.github.io/schema/vega/v5.json',
  width: 700,
  height: 400,
  padding: 5,

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
    {name: 'ord', type: 'point', range: 'width', round: true, domain: {data: 'fields', field: 'data'}},
    ...[0, 1, 2, 3, 4, 5].map(idx => {
      return {
        $cond: {
          query: `parameters.Col${idx}`,
          true: {
            name: `[Col${idx}]`,
            type: 'linear',
            range: 'height',
            zero: `[Col${idx}Zero]`,
            nice: true,
            domain: {data: 'table', field: `[Col${idx}]`},
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
    ...[0, 1, 2, 3, 4, 5].map(idx => {
      return {
        $cond: {
          query: `parameters.Col${idx}`,
          true: {
            orient: 'left',
            zindex: 1,
            scale: `[Col${idx}]`,
            title: `[Col${idx}]`,
            offset: {scale: 'ord', value: `[Col${idx}]`, mult: -1},
          },
        },
      };
    }),
  ],
  legends: [
    {
      $cond: {
        query: 'parameters.ColorBy',
        true: {
          stroke: 'color',
          title: '[ColorBy]',
        },
      },
    },
  ],
  marks: [
    {
      type: 'group',
      from: {data: 'table'},
      marks: [
        {
          type: 'line',
          from: {data: 'fields'},
          encode: {
            enter: {
              x: {scale: 'ord', field: 'data'},
              y: {scale: {datum: 'data'}, field: {parent: {datum: 'data'}}},
              //   stroke: {value: 'steelblue'},
              strokeWidth: {value: 1.01},
              strokeOpacity: {value: 0.3},
              stroke: {
                $cond: {
                  query: 'parameters.ColorBy',
                  true: {field: {parent: '[ColorBy]'}, scale: 'color'},
                  false: {value: '[Single Color]'},
                },
              },
            },
          },
        },
      ],
    },
  ],
};

const namedColors = [
  'AliceBlue',
  'AntiqueWhite',
  'Aqua',
  'Aquamarine',
  'Azure',
  'Beige',
  'Bisque',
  'Black',
  'BlanchedAlmond',
  'Blue',
  'BlueViolet',
  'Brown',
  'BurlyWood',
  'CadetBlue',
  'Chartreuse',
  'Chocolate',
  'Coral',
  'CornflowerBlue',
  'Cornsilk',
  'Crimson',
  'Cyan',
  'DarkBlue',
  'DarkCyan',
  'DarkGoldenRod',
  'DarkGray',
  'DarkGrey',
  'DarkGreen',
  'DarkKhaki',
  'DarkMagenta',
  'DarkOliveGreen',
  'DarkOrange',
  'DarkOrchid',
  'DarkRed',
  'DarkSalmon',
  'DarkSeaGreen',
  'DarkSlateBlue',
  'DarkSlateGray',
  'DarkSlateGrey',
  'DarkTurquoise',
  'DarkViolet',
  'DeepPink',
  'DeepSkyBlue',
  'DimGray',
  'DimGrey',
  'DodgerBlue',
  'FireBrick',
  'FloralWhite',
  'ForestGreen',
  'Fuchsia',
  'Gainsboro',
  'GhostWhite',
  'Gold',
  'GoldenRod',
  'Gray',
  'Grey',
  'Green',
  'GreenYellow',
  'HoneyDew',
  'HotPink',
  'IndianRed',
  'Indigo',
  'Ivory',
  'Khaki',
  'Lavender',
  'LavenderBlush',
  'LawnGreen',
  'LemonChiffon',
  'LightBlue',
  'LightCoral',
  'LightCyan',
  'LightGoldenRodYellow',
  'LightGray',
  'LightGrey',
  'LightGreen',
  'LightPink',
  'LightSalmon',
  'LightSeaGreen',
  'LightSkyBlue',
  'LightSlateGray',
  'LightSlateGrey',
  'LightSteelBlue',
  'LightYellow',
  'Lime',
  'LimeGreen',
  'Linen',
  'Magenta',
  'Maroon',
  'MediumAquaMarine',
  'MediumBlue',
  'MediumOrchid',
  'MediumPurple',
  'MediumSeaGreen',
  'MediumSlateBlue',
  'MediumSpringGreen',
  'MediumTurquoise',
  'MediumVioletRed',
  'MidnightBlue',
  'MintCream',
  'MistyRose',
  'Moccasin',
  'NavajoWhite',
  'Navy',
  'OldLace',
  'Olive',
  'OliveDrab',
  'Orange',
  'OrangeRed',
  'Orchid',
  'PaleGoldenRod',
  'PaleGreen',
  'PaleTurquoise',
  'PaleVioletRed',
  'PapayaWhip',
  'PeachPuff',
  'Peru',
  'Pink',
  'Plum',
  'PowderBlue',
  'Purple',
  'RebeccaPurple',
  'Red',
  'RosyBrown',
  'RoyalBlue',
  'SaddleBrown',
  'Salmon',
  'SandyBrown',
  'SeaGreen',
  'SeaShell',
  'Sienna',
  'Silver',
  'SkyBlue',
  'SlateBlue',
  'SlateGray',
  'SlateGrey',
  'Snow',
  'SpringGreen',
  'SteelBlue',
  'Tan',
  'Teal',
  'Thistle',
  'Tomato',
  'Turquoise',
  'Violet',
  'Wheat',
  'White',
  'WhiteSmoke',
  'Yellow',
  'YellowGreen',
];
const cols = [0, 1, 2, 3, 4, 5];
const ParallelCoordinates: Template = {
  templateName: 'parallel coordinates',
  templateDescription: 'A way to visualize the relationships between a variety of measure varables',
  templateAuthor: 'HYDRA-AUTHORS',
  templateLanguage: 'vega',
  disallowFanOut: true,
  widgets: [
    {type: 'Section', name: 'warning header'},
    {
      type: 'Text',
      name: 'repeat warning',
      config: {text: 'This template requires each column be unique'},
      validations: [
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
    ...cols.reduce((acc, idx) => {
      acc.push({
        name: `Col${idx}`,
        type: 'DataTarget',
        config: {allowedTypes: ['MEASURE'], required: !idx},
      });
      acc.push({
        name: `Col${idx}Zero`,
        type: 'Switch',
        config: {activeValue: 'true', inactiveValue: 'false', defaultsToActive: true},
      });
      return acc;
    }, []),
    {
      name: `ColorBy`,
      type: 'DataTarget',
      config: {allowedTypes: ['MEASURE'], required: false},
    },
    {
      name: `Single Color`,
      type: 'List',
      config: {allowedValues: toList(namedColors), defaultValue: `"CadetBlue"`},
      validations: [{query: 'parameters.ColorBy', queryResult: 'hide'}],
    },
  ],
  code: stringify(PARALLEL_COORS),
};
export default ParallelCoordinates;
