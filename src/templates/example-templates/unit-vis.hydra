<script>
</script>
<output>
{
  layouts: [
    {
      subgroup: {
        type: 'groupby',
        key: parameters.Key1,
      },
      aspect_ratio: 'fillX',
    },
    {
      subgroup: {
        type: 'bin',
        key: parameters.Key2,
        numBin: 10,
      },
      aspect_ratio: 'fillY',
    },
    {
      subgroup: {
        type: 'flatten',
      },
      aspect_ratio: 'maxfill',
    },
  ],
  mark: {
    color: {
      key: parameters.category,
      type: 'categorical',
    },
  },
  $schema: 'https://unit-vis.netlify.com/assets/unit-vis-schema.json',
}
</output>