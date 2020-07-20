import React, {useRef, useState} from 'react';
import Tooltip from 'rc-tooltip';
import {TiPlus} from 'react-icons/ti';
import VegaDatasets from '../constants/vega-datasets-counts.json';
const vegaDataSetName = new Set(Object.keys(VegaDatasets));

import {TemplateMap} from '../types';

import {serverPrefix} from '../utils';

interface Props {
  templateAuthor: string;
  templateName: string;
  templateMap: TemplateMap;
  dataset: string;
}

export default function PublishInstanceTooltip(props: Props): JSX.Element {
  const [error, setError] = useState(null);
  const {templateAuthor, templateName, templateMap, dataset} = props;
  // TODO ADD status/validation stuff (publishing/failed/succeeded/invalid)
  const instanceNameInput = useRef(null);
  return (
    <Tooltip
      placement="bottom"
      trigger="click"
      overlay={
        <div className="add-widget-tooltip">
          <h3>Lets publish!</h3>
          {error && <h5 style={{color: 'red'}}>{error}</h5>}
          {/* tODO integrity checks (using one of the canned datasets)*/}
          <div>
            instance name <input ref={instanceNameInput} />
          </div>
          <button
            onClick={(): void => {
              const templateInstance = instanceNameInput.current.value;
              if (!templateInstance.length) {
                setError('Template instance must have a name');
                return;
              }
              if (!vegaDataSetName.has(dataset)) {
                setError('Instance must use a predefined dataset');
                return;
              }
              // TODO: require templateMap must not be blank
              // TODO: require that fan out is not currently in use
              fetch(`${serverPrefix()}/publish-instance`, {
                method: 'POST',
                mode: 'cors',
                cache: 'no-cache',
                credentials: 'same-origin',
                headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                redirect: 'follow',
                referrerPolicy: 'no-referrer',
                body: JSON.stringify({
                  templateAuthor,
                  templateName,
                  templateMap: templateMap.paramValues,
                  templateInstance,
                  dataset,
                }),
              });
            }}
          >
            submit
          </button>
        </div>
      }
    >
      <button type="button">
        save state as public <TiPlus />
      </button>
    </Tooltip>
  );
}
