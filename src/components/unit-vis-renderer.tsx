import React, {useEffect} from 'react';

import UnitVis from 'unit-vis';
interface Props {
  spec: any;
  data: any;
}

export default function Chart(props: Props): JSX.Element {
  const {spec, data} = props;
  const specString = JSON.stringify(spec);
  useEffect(() => {
    const specCopy = JSON.parse(specString);
    specCopy.data = {values: data};
    const oldSvg = document.querySelector('#special-hydra-target svg');
    if (oldSvg) {
      oldSvg.remove();
    }
    if (spec) {
      // D O N T  T E L L  M E  W H A T  T O  D O
      // Y O U   A R E  N O T  M Y  D A D
      /* eslint-disable @typescript-eslint/ban-ts-ignore*/
      // @ts-ignore
      UnitVis('special-hydra-target', specCopy);
      /* eslint-enable @typescript-eslint/ban-ts-ignore*/
    }
  }, [specString]);

  return (
    <div>
      <div id="special-hydra-target" />
    </div>
  );
}
