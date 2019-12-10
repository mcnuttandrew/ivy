import React from 'react';
import {Vega} from 'react-vega';
import {VegaTheme} from '../types';
import {Handler} from 'vega-tooltip';
import {get} from '../utils';
import Table from './data-table';

interface VegaWrapperProps {
  spec: any;
  data: any;
  theme: VegaTheme;
  iMspec: any;
  language?: any;
}

// This componenent has the simple task of disallowing renders other than when the spec has changed
// in effect it is a modest caching layer. It also allows us to obscure some of the odities of the vega interface
export default class VegaWrapper extends React.Component<VegaWrapperProps> {
  shouldComponentUpdate(nextProps: VegaWrapperProps) {
    const diffSpec = !this.props.iMspec.equals(nextProps.iMspec);
    const diffTheme = this.props.theme !== nextProps.theme;
    return diffSpec || diffTheme;
  }

  render() {
    const {spec, data, theme, language = 'vega-lite'} = this.props;
    // HACK to prevent changes to the data
    const finalSpec = JSON.parse(JSON.stringify(spec));
    if (language === 'hydra-data-table') {
      return <Table data={data} spec={spec} />;
    }
    // this stratagey only supports one data set
    if (language === 'vega') {
      (finalSpec.data || []).forEach((row: any, idx: number) => {
        if (row.values === 'myData') {
          finalSpec.data[idx].values = data;
        }
      });
    }
    if (language === 'vega-lite' || !language) {
      if (!get(finalSpec, ['data', 'values'])) {
        finalSpec.data = {
          values: data,
        };
      }
    }

    return (
      <Vega
        actions={false}
        spec={finalSpec}
        mode={language}
        theme={theme}
        tooltip={new Handler({}).call}
      />
    );
  }
}
