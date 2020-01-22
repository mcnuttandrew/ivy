<script></script>
<output>
{
  $schema: 'https://vega.github.io/schema/vega/v5.json',
  width: 200,
  height: 200,
  padding: 50,
  autosize: 'fit',

  data: [
    {
      name: 'table',
      values: 'myData',
      transform: [
        {
          type: 'aggregate',
          groupby: [parameters.category],
          fields: [parameters.value],
          ops: [parameters.aggregate],
          as: ['pieAg'],
        },

        {
          type: 'pie',
          field: 'pieAg',
          startAngle: 0,
          endAngle: 6.29,
          sort: parameters.Sort,
        },
        {
          type: 'formula',
          expr: `datum.${parameters.category} + ': ' + datum.pieAg`,
          as: 'tooltip',
        },
      ],
    },
  ],

  scales: [
    {
      name: 'color',
      type: 'ordinal',
      domain: {data: 'table', field: parameters.category},
      range: {scheme: parameters.colorScheme},
    },
    {
      name: 'r',
      type: 'sqrt',
      domain: [0, 1],
      zero: false,
      range: [90, 100],
    },
  ],

  marks: [
    {
      type: 'arc',
      from: {data: 'table'},
      encode: {
        enter: {
          fill: {scale: 'color', field: parameters.category},
          x: {signal: 'width / 2'},
          y: {signal: 'height / 2'},
          startAngle: {field: 'startAngle'},
          endAngle: {field: 'endAngle'},
          innerRadius: {value: parameters.DonutChart},
          outerRadius: {signal: 'width / 2'},
          cornerRadius: {value: 0},
          tooltip: {field: 'tooltip'},
        },
      },
    },
    {
      type: 'text',
      from: {data: 'table'},
      encode: {
        enter: {
          x: {field: {group: 'width'}, mult: 0.5},
          y: {field: {group: 'height'}, mult: 0.5},
          radius: {scale: 'r', value: 1.3},
          theta: {signal: '(datum.startAngle + datum.endAngle)/2'},
          fill: {value: '#000'},
          align: {value: 'center'},
          baseline: {value: 'middle'},
          text: {field: parameters.category},
        },
      },
    },
  ],
}
</output>