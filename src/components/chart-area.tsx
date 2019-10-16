import React from 'react';
import {Vega} from 'react-vega';

// const spec = {
//   "width": 400,
//   "height": 200,
//   "data": [{ "name": "table" }],
//   "signals": [
//     {
//       "name": "tooltip",
//       "value": {},
//       "on": [
//         {"events": "rect:mouseover", "update": "datum"},
//         {"events": "rect:mouseout",  "update": "{}"}
//       ]
//     }
//   ],
//   ... // See the rest in packages/react-vega-demo/stories/vega/spec1.js
// }
//
// const barData = {
//   table: [...]
// };
//
// function handleHover(...args){
//   console.log(args);
// }
//
// const signalListeners = { hover: handleHover };

// ReactDOM.render(
//   <Vega spec={spec} data={barData} signalListeners={signalListeners} />,
//   document.getElementById('bar-container')
// );
//

interface ChartAreaProps {
  spec: any;
  data: any;
}
export default class ChartArea extends React.Component<ChartAreaProps> {
  render() {
    const {spec, data} = this.props;
    // todo listeners
    return (
      <div className="flex-down first-column full-width full-height">
        <Vega spec={spec} data={data} />
      </div>
    );
  }
}
