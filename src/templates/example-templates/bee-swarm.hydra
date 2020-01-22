<script>
</script>
<output>
{
  $schema: 'https://vega.github.io/schema/vega/v5.json',
  width: 800,
  height: 100,
  padding: {left: 5, right: 5, top: 0, bottom: 20},
  autosize: 'none',

  signals: [
    {name: 'cx', update: 'width / 2'},
    {name: 'cy', update: 'height / 2'},
    ...['radius', 'collide', 'gravityX', 'gravityY', 'static'].map(name => ({name, update: parameters[name]}))
  ],
  data: [{name: 'table', values: 'myData'}],

  scales: [
    {
      name: 'xscale',
      type: 'band',
      domain: {
        data: 'table',
        field: parameters.category,
        sort: true,
      },
      range: 'width',
    },
    {
      name: 'color',
      type: 'ordinal',
      domain: {data: 'table', field: parameters.category},
      range: {scheme: parameters.colorScheme},
    },
  ],

  axes: [{orient: 'bottom', scale: 'xscale'}],

  marks: [
    {
      name: 'nodes',
      type: 'symbol',
      from: {data: 'table'},
      encode: {
        enter: {
          fill: {scale: 'color', field: parameters.category},
          xfocus: {scale: 'xscale', field: parameters.category, band: 0.5},
          yfocus: {signal: 'cy'},
        },
        update: {
          size: {signal: 'pow(2 * radius, 2)'},
          stroke: {value: 'white'},
          strokeWidth: {value: 1},
          zindex: {value: 0},
        },
        hover: {
          stroke: {value: 'purple'},
          strokeWidth: {value: 3},
          zindex: {value: 1},
        },
      },
      transform: [
        {
          type: 'force',
          iterations: 300,
          static: {signal: 'static'},
          forces: [
            {
              force: 'collide',
              iterations: {signal: 'collide'},
              radius: {signal: 'radius'},
            },
            {force: 'x', x: 'xfocus', strength: {signal: 'gravityX'}},
            {force: 'y', y: 'yfocus', strength: {signal: 'gravityY'}},
          ],
        },
      ],
    },
  ],
}
</output>
