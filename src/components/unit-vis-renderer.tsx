import React, {useEffect} from 'react';
import {Json} from '../types';

import UnitVis from 'unit-vis';
interface Props {
  spec: Json;
  data: any;
}

export default function Chart(props: Props): JSX.Element {
  const {spec, data} = props;
  const specString = JSON.stringify(spec);
  useEffect(() => {
    let specCopy = null;
    try {
      specCopy = JSON.parse(specString);
    } catch (error) {
      console.log(error);
      return;
    }
    if (specString === '{}') {
      return;
    }
    specCopy.data = {values: data};
    const oldSvg = document.querySelector('#special-hydra-target svg');
    if (oldSvg) {
      oldSvg.remove();
    }
    if (spec) {
      // D O N T  T E L L  M E  W H A T  T O  D O
      // Y O U   A R E  N O T  M Y  D A D
      try {
        /* eslint-disable @typescript-eslint/ban-ts-ignore*/
        // @ts-ignore
        UnitVis('special-hydra-target', specCopy);
        /* eslint-enable @typescript-eslint/ban-ts-ignore*/
      } catch (e) {
        console.log('UnitVis Crash', e);
      }
    }
  }, [specString]);

  return (
    <div>
      <div id="special-hydra-target" />
    </div>
  );
}
