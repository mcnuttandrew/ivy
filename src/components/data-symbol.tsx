import React from 'react';
import {TiSortNumerically, TiSortAlphabetically, TiCalendar} from 'react-icons/ti';
import {DataType} from '../types';
interface Props {
  type: DataType;
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
    default:
    case 'DIMENSION':
      return <TiSortAlphabetically />;
  }
}
