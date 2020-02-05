import React from 'react';
import {TiSortNumerically, TiSortAlphabetically, TiCalendar} from 'react-icons/ti';
interface Props {
  type: string;
}
export default function DataSymbol(props: Props): JSX.Element {
  const {type} = props;
  switch (type) {
    case 'MEASURE':
      return <TiSortNumerically />;
    case 'TIME':
      return <TiCalendar />;
    case 'METACOLUMN':
      return <span>?</span>;
    case 'SUM':
      return <span>Σ</span>;
    default:
    case 'DIMENSION':
      return <TiSortAlphabetically />;
  }
}
