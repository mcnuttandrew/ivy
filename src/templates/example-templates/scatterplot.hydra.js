<script>
  // raw normal javascript, allows
  const scaleSuffix = {scale: {zero: parameters.Zeroes}};
  const color = parameters.Color ? null : parameters['Single Color'];
  const encodings = ['x', 'y'].reduce((acc, key) => {
    acc[key] = {field: parameters[`${key}Dim`], type: parameters[`${key}Type`], ...scaleSuffix};
    return acc;
  }, {})
</script>

// output would be evaluated javascript object
<output>
{
  $schema: 'https://vega.github.io/schema/vega-lite/v4.json',
  mark: {
    type: 'point',
    tooltip: true,
    size: parameters.Radius,
    color: color,
  },
  encoding: {
    ...encodings,
    ...(parameters.Color ? {color: {field: parameters.Color, type: parameters.colorType}} : {}),
  },
}
</output>