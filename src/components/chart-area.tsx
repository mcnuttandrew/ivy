import React from 'react';
import VegaWrapper from './vega-wrap';
import {VegaTheme} from '../types';
import {GenericAction} from '../actions/index';
import {cleanSpec} from '../utils';

interface ChartAreaProps {
  spec: any;
  data: any;
  setNewSpec: GenericAction;
  currentTheme: VegaTheme;
  iMspec: any;
}

export default class ChartArea extends React.Component<ChartAreaProps> {
  render() {
    const {spec, data, setNewSpec, currentTheme, iMspec} = this.props;
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
          <VegaWrapper
            iMspec={iMspec}
            spec={cleanSpec(spec)}
            data={data}
            theme={currentTheme}
          />
        </div>
      </div>
    );
  }
}
