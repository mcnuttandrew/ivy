import React, {useState, useEffect} from 'react';
import Tooltip from 'rc-tooltip';
import {TiTrash} from 'react-icons/ti';
import {POST_PARAMS} from '../../constants';

interface Props {
  templateAuthor: string;
  templateName: string;
  instanceName: string;
  userName: string;
  removeInstance: (templateAuthor: string, templateName: string, instanceName: string) => void;
}

export default function UnpublishInstanceTooltip(props: Props): JSX.Element {
  const {templateAuthor, templateName, instanceName, userName, removeInstance} = props;
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setError(false);
    setSaved(false);
  }, [templateAuthor, templateName, instanceName, userName]);

  return (
    <Tooltip
      placement="bottom"
      trigger="click"
      overlay={
        <div className="add-widget-tooltip">
          <h3>Unpublish template instance</h3>
          <p>Remove this template instance from the server. Be careful this action can not be undone.</p>
          {error && <h5 style={{color: 'red'}}>{error}</h5>}
          <button
            type="button"
            onClick={(): void => {
              fetch(`.netlify/functions/remove-instance`, {
                ...POST_PARAMS,
                body: JSON.stringify({templateAuthor, templateName, instanceName, userName}),
              } as any).then(() => {
                setSaved(true);
                removeInstance(templateAuthor, templateName, instanceName);
              });
            }}
          >
            submit
          </button>
          {saved && <div>Removed!</div>}
        </div>
      }
    >
      <div className="template-modification-control">
        <TiTrash />
      </div>
    </Tooltip>
  );
}
