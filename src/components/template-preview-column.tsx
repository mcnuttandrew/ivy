import React from 'react';
import {Template} from '../templates/types';
import {classnames} from '../utils';
import {GenericAction} from '../actions/index';
import {thumbnailLocation} from '../thumbnail';

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
      <div className="encoding-selection-option-img-container">
        <img src={thumbnailLocation(templateName)} />
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
      <div
        className={classnames({
          'template-preview-column': true,
          'full-height': true,
        })}
      >
        <div>Available Charts</div>
        <div className="template-preview-column-charts">
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
