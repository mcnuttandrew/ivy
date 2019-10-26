import React from 'react';
import {VegaLite} from 'react-vega';
import {VegaTheme} from '../types';
import {GenericAction} from '../actions/index';

const DEFAULT_CONFIG = {
  facet: {width: 150, height: 150},
  overlay: {line: true},
  scale: {useRawDomain: true},
};

interface ChartAreaProps {
  spec: any;
  data: any;
  setNewSpec: GenericAction;
  height: number;
  width: number;
  currentTheme: VegaTheme;
}
export default class ChartArea extends React.Component<ChartAreaProps> {
  render() {
    const {spec, data, setNewSpec, currentTheme} = this.props;
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
            spec={{...spec, config: DEFAULT_CONFIG, padding: 50}}
            data={{myData: data}}
            theme={currentTheme}
            actions={false}
          />
        </div>
      </div>
    );
  }
}
