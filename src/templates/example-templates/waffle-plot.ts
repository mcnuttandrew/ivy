// {
//   "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
//   "description": "A Rectangular Unit-Chart",
//   "width": 600,
//   "height": 400,
//   "mark": {"type": "rect"},
//   "transform": [
//     {"sort": [{"field": "[Dim1]"}], "window": [{"field": "[Dim1]", "op": "count", "as": "countX"}]},
//     {"window": [{"field": "[Dim1]", "op": "count", "as": "count"}]},
//     {"calculate": "ceil(datum.count/ 10)", "as": "X"},
//     {"calculate": "datum.count - (datum.X - 1) *10", "as": "Y"}
//   ],
//   "encoding": {
//     "x": {"field": "X", "type": "ordinal", "axis": null},
//     "y": {"field": "Y", "type": "ordinal", "axis": null},
//     "color": {"field": "[Dim1]", "type": "nominal"},
//     "tooltip": {"field": "[Dim1]", "type": "nominal"}
//   }
// }
