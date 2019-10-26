import React from 'react';
import {VegaLite} from 'react-vega';

import {GenericAction} from '../actions/index';

interface ChartAreaProps {
  spec: any;
  data: any;
  setNewSpec: GenericAction;
  height: number;
  width: number;
}
export default class ChartArea extends React.Component<ChartAreaProps> {
  render() {
    const {spec, data, setNewSpec} = this.props;
    // todo listeners
    // todo automatical height inference
    return (
      <div className="flex-down center full-width full-height">
        <div className="chart-controls full-width">
          <button
            onClick={() => {
              const {x, y} = spec.encoding;
              setNewSpec({
                ...spec,
                encoding: {...spec.encoding, x: y, y: x},
              });
            }}
          >
            Swap X/Y
          </button>
        </div>
        <div className="chart-container full-width full-height">
          <VegaLite
            spec={{...spec, height: 500, width: 500, padding: 50}}
            data={{myData: data}}
          />
        </div>
      </div>
    );
  }
}
