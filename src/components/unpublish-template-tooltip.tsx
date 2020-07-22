import React, {useState, useEffect} from 'react';
import Tooltip from 'rc-tooltip';
import {TiTrash} from 'react-icons/ti';
import {POST_PARAMS} from '../constants';
import {Link} from 'react-router-dom';

import {Template} from '../types';
import {GenericAction} from '../actions/index';
import {serverPrefix} from '../utils';

interface Props {
  template: Template;
  deleteTemplate: GenericAction<{templateAuthor: string; templateName: string}>;
  userName: string;
}

export default function UnpublishInstanceTooltip(props: Props): JSX.Element {
  const {template, deleteTemplate, userName} = props;
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  const output = JSON.stringify({template});

  useEffect(() => {
    setError(false);
    setSaved(false);
  }, [output]);

  return (
    <Tooltip
      placement="bottom"
      trigger="click"
      overlay={
        <div className="add-widget-tooltip">
          <h3>Unpublish template</h3>
          <p>
            Remove this template from the server, saved instances will be deleted. Be careful this action can
            not be undone.
          </p>
          {error && <h5 style={{color: 'red'}}>{error}</h5>}
          <Link
            to="/editor/unpublished"
            onClick={(): void => {
              fetch(`${serverPrefix()}/remove`, {
                ...POST_PARAMS,
                body: JSON.stringify({
                  templateName: template.templateName,
                  templateAuthor: template.templateAuthor,
                  userName,
                }),
              } as any).then(() => {
                setSaved(true);
                deleteTemplate({
                  templateName: template.templateName,
                  templateAuthor: template.templateAuthor,
                });
              });
            }}
          >
            <button type="button">submit</button>
          </Link>
          {saved && <div>Removed!</div>}
        </div>
      }
    >
      <div className="template-modification-control">
        <TiTrash />
        Unpublish Template
      </div>
    </Tooltip>
  );
}
