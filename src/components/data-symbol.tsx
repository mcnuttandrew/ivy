import React from 'react';
import {
  TiSortNumerically,
  TiSortAlphabetically,
  TiCalendar,
} from 'react-icons/ti';
import {DataType} from '../types';
export default function DataSymbol(type: DataType): JSX.Element {
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
