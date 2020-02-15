import React from 'react';
import {TiSortNumerically, TiSortAlphabetically, TiTime} from 'react-icons/ti';
interface Props {
  type: string;
}
export default function DataSymbol(props: Props): JSX.Element {
  const {type} = props;
  switch (type) {
    case 'MEASURE':
      return <TiSortNumerically />;
    case 'TIME':
      return <TiTime />;
    case 'CUSTOM':
    case 'METACOLUMN':
      return <span>?</span>;
    case 'SUM':
      return <span style={{fontSize: '15px'}}>Σ</span>;
    default:
    case 'DIMENSION':
      return <TiSortAlphabetically />;
  }
}
