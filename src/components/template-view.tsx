import React from 'react';
import {GenericAction} from '../actions';
import {classnames} from '../utils';

import {Template} from '../constants/templates';

interface Props {
  templates: Template[];
}

function renderTemplate(template: Template) {
  return <div>{template.templateName}</div>;
}

export default class TemplateView extends React.Component<Props> {
  render() {
    const {templates} = this.props;
    return (
      <div className="full-height full-width flex-down">
        <div>
          <h3>Templates</h3>
          <div>{templates.map(renderTemplate)}</div>
        </div>
      </div>
    );
  }
}
