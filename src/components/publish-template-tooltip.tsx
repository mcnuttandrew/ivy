import React, {useState, useEffect} from 'react';
import Tooltip from 'rc-tooltip';
import {TiUpload} from 'react-icons/ti';
import {POST_PARAMS} from '../constants';

import {Template} from '../types';
import {GenericAction} from '../actions/index';
import {serverPrefix} from '../utils';

interface Props {
  template: Template;
  saveCurrentTemplate: GenericAction<void>;
}

export default function PublishTemplateTooltip(props: Props): JSX.Element {
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const {template, saveCurrentTemplate} = props;
  const output = JSON.stringify({template});
  useEffect(() => {
    setError(false);
    setSaved(false);
  }, [output]);
  // TODO ADD status/validation stuff (publishing/failed/succeeded/invalid)
  return (
    <Tooltip
      placement="bottom"
      trigger="click"
      overlay={
        <div className="add-widget-tooltip">
          <h3>Publish template to server</h3>
          <p>
            Make this template available for others to use and view. After publishing you are strongly
            encourage to upload an instance.
          </p>
          {error && <h5 style={{color: 'red'}}>{error}</h5>}
          <button
            onClick={(): void => {
              fetch(`${serverPrefix()}/publish`, {...POST_PARAMS, body: output} as any).then(() => {
                setSaved(true);
                saveCurrentTemplate();
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
        Save Template
      </div>
    </Tooltip>
  );
}
