import React from 'react';
import {VegaLite} from 'react-vega';
import {VegaTheme} from '../types';
import {GenericAction} from '../actions/index';
import LintDisplay from './lint-display';

const DEFAULT_CONFIG = {
  facet: {width: 150, height: 150},
  overlay: {line: true},
  scale: {useRawDomain: false},
};

interface ChartAreaProps {
  spec: any;
  data: any;
  lints: any;
  setNewSpec: GenericAction;
  height: number;
  width: number;
  currentTheme: VegaTheme;
}

function compareObjects(a: any, b: any) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function cleanSpec(spec: any) {
  return {
    config: DEFAULT_CONFIG,
    padding: 50,
    ...spec,
    encoding: {
      ...Object.entries(spec.encoding).reduce((acc: any, [key, val]) => {
        if (!compareObjects(val, {})) {
          acc[key] = val;
        }
        return acc;
      }, {}),
    },
  };
}
export default class ChartArea extends React.Component<ChartAreaProps> {
  render() {
    const {spec, data, setNewSpec, currentTheme, lints} = this.props;
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
            spec={cleanSpec(spec)}
            data={{myData: data}}
            theme={currentTheme}
            actions={false}
          />
        </div>
        <LintDisplay lints={lints} />
      </div>
    );
  }
}
