import React from 'react';
import {Vega} from 'react-vega';
import {VegaTheme} from '../types';
import {Handler} from 'vega-tooltip';

interface VegaWrapperProps {
  spec: any;
  data: any;
  theme: VegaTheme;
  iMspec: any;
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
    const {spec, data, theme} = this.props;

    return (
      <Vega
        mode="vega-lite"
        spec={spec}
        data={{myData: data}}
        theme={theme}
        actions={false}
        tooltip={new Handler({}).call}
      />
    );
  }
}
