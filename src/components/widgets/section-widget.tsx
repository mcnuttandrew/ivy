import React from 'react';
import {SectionWidget, TemplateWidget} from '../../templates/types';
import {GeneralWidget} from './general-widget';

export default function SectionWidgetComponent(
  props: GeneralWidget<TemplateWidget<SectionWidget>>,
): JSX.Element {
  const {editMode} = props;
  return <div className="section-widget">{editMode && <div>SECTION</div>}</div>;
}
