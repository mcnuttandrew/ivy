import React from 'react';
import {Template} from '../templates/types';
import {classnames} from '../utils';
import {GenericAction} from '../actions/index';

interface Props {
  templates: Template[];
  setEncodingMode: GenericAction;
  encodingMode: string;
}

function renderEncodingModeOption(
  templateName: string,
  templateDescription: string,
  idx: number,
  setEncodingMode: GenericAction,
  encodingMode: string,
): JSX.Element {
  return (
    <div
      className={classnames({
        'encoding-selection-option': true,
        flex: true,
        'selected-encoding-option': encodingMode === templateName,
      })}
      key={`${templateName}-${idx}`}
      onClick={(): any => setEncodingMode(templateName)}
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
    const {templates, setEncodingMode, encodingMode} = this.props;

    return (
      <div className="full-height background-2">
        <div
          className={classnames({
            column: true,
            'template-preview-column': true,
          })}
        >
          <div>Available Charts</div>
          {renderEncodingModeOption(
            'grammer',
            'Tableau-style grammar of graphics',
            -1,
            setEncodingMode,
            encodingMode,
          )}
          {templates
            .filter(template => template.templateName !== '_____none_____')
            .map((template, idx) =>
              renderEncodingModeOption(
                template.templateName,
                template.templateDescription,
                idx,
                setEncodingMode,
                encodingMode,
              ),
            )}
        </div>
      </div>
    );
  }
}
