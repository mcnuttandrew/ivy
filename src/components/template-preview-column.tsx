import React from 'react';
import {Template} from '../templates/types';
import {classnames} from '../utils';
import {GenericAction} from '../actions/index';

interface Props {
  templates: Template[];
  setEncodingMode: GenericAction;
}

function encodingMode(
  templateName: string,
  templateDescription: string,
  idx: number,
  setEncodingMode: GenericAction,
): JSX.Element {
  return (
    <div
      className="encoding-selection-option flex"
      key={`${templateName}-${idx}`}
      onClick={(): void => {
        setEncodingMode(templateName);
        console.log('ugh');
      }}
    >
      <div>
        <img src="./assets/example-chart.png" />
      </div>
      <div className="flex-down">
        <h3>{templateName}</h3>
        {templateDescription && <h5>{`${templateDescription}`}</h5>}
      </div>
    </div>
  );
}

export default class TemplatePreviewColumn extends React.Component<Props> {
  render(): JSX.Element {
    const {templates, setEncodingMode} = this.props;

    return (
      <div className="full-height">
        <div
          className={classnames({
            column: true,
            'template-preview-column': true,
          })}
        >
          <div>Available Charts</div>
          {encodingMode(
            'grammer',
            'Tableau-style grammar of graphics',
            -1,
            setEncodingMode,
          )}
          {templates.map((template, idx) =>
            encodingMode(
              template.templateName,
              template.templateDescription,
              idx,
              setEncodingMode,
            ),
          )}
        </div>
      </div>
    );
  }
}
