import React, {useRef, useState, useEffect} from 'react';
import DomToImage from 'dom-to-image-more';
// // @ts-ignore
// window.require = (name) => new URL(name, import.meta.url).href
// const DomToImage = require('dom-to-image');
import Tooltip from 'rc-tooltip';
import {TiUpload} from 'react-icons/ti';
import VegaDatasets from '../../constants/vega-datasets-counts.json';
import SmallExampleDatasets from '../../constants/small-example-datasets-counts.json';
import {POST_PARAMS} from '../../constants';
const knownDatasetName = new Set(Object.keys(VegaDatasets).concat(Object.keys(SmallExampleDatasets)));

import {TemplateMap} from '../../types';

interface Props {
  templateAuthor: string;
  templateName: string;
  templateMap: TemplateMap;
  dataset: string;
  userName: string;
}

export default function PublishInstanceTooltip(props: Props): JSX.Element {
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const {templateAuthor, templateName, templateMap, dataset, userName} = props;
  useEffect(() => {
    setError(false);
    setSaved(false);
  }, [JSON.stringify(templateMap)]);
  // TODO ADD status/validation stuff (publishing/failed/succeeded/invalid)
  const instanceNameInput = useRef(null);
  if (dataset && !knownDatasetName.has(dataset)) {
    return <div />;
  }
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
              // TODO: require templateMap must not be blank
              // TODO: require that fan out is not currently in use
              const node = document.querySelector('.chart-container div');
              DomToImage.toJpeg(node, {quality: 0.5}).then((templateImg) => {
                fetch(`.netlify/functions/publish-instance`, {
                  ...POST_PARAMS,
                  body: JSON.stringify({
                    templateAuthor,
                    templateName,
                    templateMap,
                    templateInstance,
                    dataset: dataset || 'null',
                    instanceCreator: userName,
                    thumbnail: templateImg,
                  }),
                } as any).then(() => {
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
