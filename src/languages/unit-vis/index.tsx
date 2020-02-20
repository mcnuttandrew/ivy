import React, {useEffect} from 'react';
import {HydraExtension, RendererProps} from '../../types';

import UnitVis from 'unit-vis';

function UnitVisRenderer(props: RendererProps): JSX.Element {
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

const UNIT_VIS_CONFIG: HydraExtension = {
  renderer: UnitVisRenderer,
  suggestion: () => [],
  language: 'unit-vis',
};

export default UNIT_VIS_CONFIG;
