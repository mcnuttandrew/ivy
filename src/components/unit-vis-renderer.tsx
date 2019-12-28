import React, {useEffect} from 'react';

import UnitVis from 'unit-vis';
interface Props {
  spec: any;
  data: any;
}

export default function Chart(props: Props) {
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
      // @ts-ignore
      UnitVis('special-hydra-target', specCopy);
    }
  }, [specString]);

  return (
    <div>
      <div id="special-hydra-target" />
    </div>
  );
}
