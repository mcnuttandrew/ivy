import React, {useRef, useState, useEffect} from 'react';
import DomToImage from 'dom-to-image';
import Tooltip from 'rc-tooltip';
import {TiUpload} from 'react-icons/ti';
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
  const [saved, setSaved] = useState(false);
  const {templateAuthor, templateName, templateMap, dataset} = props;
  useEffect(() => {
    setError(false);
    setSaved(false);
  }, [JSON.stringify(templateMap)]);
  // TODO ADD status/validation stuff (publishing/failed/succeeded/invalid)
  const instanceNameInput = useRef(null);
  return (
    <Tooltip
      placement="bottom"
      trigger="click"
      overlay={
        <div className="add-widget-tooltip">
          <h3>Save Instance To Server</h3>
          <p>
            Make this configuration of this template available for others to use and view. It needs a name and
            to be specified for one of the default datasets.
          </p>
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
              const node = document.querySelector('.chart-container div');
              DomToImage.toJpeg(node, {quality: 0.5}).then(templateImg => {
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
                    thumbnail: templateImg,
                  }),
                }).then(() => {
                  setSaved(true);
                });
              });
            }}
          >
            submit
          </button>
          {saved && <div>SAVED!</div>}
        </div>
      }
    >
      <div className="template-modification-control">
        <TiUpload />
        Publish Instance
      </div>
    </Tooltip>
  );
}
