import React from 'react';
import {VegaLite} from 'react-vega';

interface ChartAreaProps {
  spec: any;
  data: any;
}
export default class ChartArea extends React.Component<ChartAreaProps> {
  render() {
    const {spec, data} = this.props;
    // todo listeners
    // todo automatical height inference
    return (
      <div className="flex-down center full-width full-height">
        <div className="chart-controls full-width">CHART CONTROLS</div>
        <div className="chart-container full-width full-height">
          <VegaLite
            spec={spec}
            data={{myData: data}}
            height={500}
            width={500}
          />
        </div>
      </div>
    );
  }
}
