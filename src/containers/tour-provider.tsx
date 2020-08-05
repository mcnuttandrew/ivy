import React from 'react';
import {connect} from 'react-redux';
import Tour, {ReactourStep} from 'reactour';

import * as actionCreators from '../actions/index';

import {ActionUser} from '../actions/index';

import {AppState} from '../types';
import {TEMPLATE_BODY, WIDGET_CONFIGURATION, WIDGET_VALUES} from '../constants';

interface TourProps extends ActionUser {
  showTour: boolean;
}

const tourContent = {
  dataColumn: `This is the data column, it shows each of the fields in the dataset organized by data type. Blue for dimensions, which are categorical data, green for measures, which are continuous data, and pink for time. `,
  dataColumnPill: `This is a data field. You can click and drag it around.`,
  dataColumnPillSettings: `If the data field is mis-categorized then you can change it here. `,
  dataColumnPillFilter: `This creates a filter for this field, you can also create filters by clicking and dragging.  `,
  dataColumnPillAutoAdd: `Clicking on this button automatically add this field to the next open data target.`,

  encodingColumn: `This is the encoding column. It contains all of the controls for specifying your chart.`,
  dataTarget: `This is a data target. Drag and drop columns from the data column or use the dropdown to select one.`,
  dataTargetDataTypes: `These are the types of data fields that this target wants to accept. You are welcome to override if you know your data better.`,
  editView: `All templates can be used either in view mode (which we are looking at now) or edit mode, which allows you to pull back the covers and manipulate the template.`,
  editView2: `Let's switch over to edit mode now.`,
  editMode: `Here we have the edit mode. These widgets, which represent variables in the template, can be dragged or modified.`,
  editView3: `Feel free to come back and play around here later, there's a lot to explore. For now let's switch back to view mode.`,
  actions: `These controls enable you to create a new template, fork the current one in various ways, reset the template to it's default state, or publish an instance.`,
  fanout: `This is the fanout button. It allows you to try out a number of different options for a particular GUI widget simultaneously. `,
  preIntroToCodeSection: `Next let's turn to the code section.`,
  introToCodeSection: `This is the code container. It shows the code that is produced from using the GUI, and can also be edited textually. `,
  CodeBodySection: ` The code in the Body is written in the Ivy Template Language (see docs for more info) it is a superset of the syntax of whichever charting DSL you are using (vega-lite or vega most likely). `,
  CodeParamsSection: ` This is the params or parameters. It is a textual representation of the GUI. Any edits you make here will change the GUI, and any edits made in the GUI during edit mode will be reflected here.`,
  CodeSettingsSection: `These are the settings. They represent the current values in the GUI and the values that are substituted into the body to create the output. You can edit these if you life. Typically you should only edit the paramValues part of this object.`,
  ChartArea: `This is the chart area, it contains the visual representation of the the output tab of the code container.`,
  ChartControlsIntro: `These are the chart controls.   `,
  ChartControlsRelated: `The related templates recommends templates that are related to your current selection of data fields.  `,
  ChartControlsDebug: `Toggle show is a debugging view for if your chart is doing something unexpected.   `,
  ChartControlsView: ` To the right of that are the views, you can think of these like browser tabs but for charts. You can clone these tabs if you want to temporarily save your work.    `,
  end: `Here we have the undo/redo buttons, along side links to various other parts of the app. That's it for the tour! You should now be ready to use ivy.`,
};

type Condition = (lifecycle: string, action: string) => void;
function TourProvider(props: TourProps): JSX.Element {
  const {setShowTour, showTour, setProgrammaticView, setCodeMode, setEditMode} = props;
  if (!showTour) {
    return <div />;
  }
  const withVoid = (action: any) => (): void => {
    action();
  };
  const TOUR_STEPS: ReactourStep[] = [
    {selector: '#data-column-container', content: tourContent.dataColumn},
    {selector: '#data-column-container .pill', content: tourContent.dataColumnPill},
    {selector: '#data-column-container .pill-settings', content: tourContent.dataColumnPillSettings},
    {selector: '#data-column-container .add-filter-from-pill', content: tourContent.dataColumnPillFilter},
    {selector: '#data-column-container .auto-add-pill', content: tourContent.dataColumnPillAutoAdd},
    {selector: '#encoding-column-container', content: tourContent.encodingColumn},
    {selector: '.DataTarget-widget-type', content: tourContent.dataTarget},
    {selector: '.data-type-container', content: tourContent.dataTargetDataTypes},
    {selector: '.materialize-button', content: tourContent.fanout},
    {selector: '.edit-view-toggle', content: tourContent.editView},
    {
      selector: '.edit-view-toggle',
      content: tourContent.editView2,
      action: withVoid((): any => setEditMode(true)),
    },
    {selector: '#encoding-column-container', content: tourContent.editMode},
    {
      selector: '.edit-view-toggle',
      content: tourContent.editView3,
      action: withVoid((): any => setEditMode(false)),
    },
    {selector: '.template-actions', content: tourContent.actions},
    {
      selector: '.code-container',
      content: tourContent.preIntroToCodeSection,
      action: withVoid((): any => setProgrammaticView(true)),
    },
    {selector: '.code-container', content: tourContent.introToCodeSection},
    {
      selector: '.code-container',
      content: tourContent.CodeBodySection,
      action: withVoid((): any => setCodeMode(TEMPLATE_BODY)),
    },
    {
      selector: '.code-container',
      content: tourContent.CodeParamsSection,
      action: withVoid((): any => setCodeMode(WIDGET_CONFIGURATION)),
    },
    {
      selector: '.code-container',
      content: tourContent.CodeSettingsSection,
      action: withVoid((): any => setCodeMode(WIDGET_VALUES)),
    },
    {
      selector: '.chart-container',
      content: tourContent.ChartArea,
      action: withVoid((): any => setProgrammaticView(false)),
    },
    {selector: '.chart-controls', content: tourContent.ChartControlsIntro},
    {selector: '.related-templates', content: tourContent.ChartControlsRelated},
    {selector: '.show-data-toggle', content: tourContent.ChartControlsDebug},
    {selector: '.view-container', content: tourContent.ChartControlsView},
    {selector: '.view-container', content: tourContent.ChartControlsView},
    {selector: '.header', content: tourContent.end},
  ];

  return (
    <Tour
      steps={TOUR_STEPS}
      isOpen={true}
      onRequestClose={(): any => setShowTour(false)}
      updateDelay={1000}
    />
  );
}

export function mapStateToProps({base}: {base: AppState}): any {
  return {
    showTour: base.showTour,
  };
}

export default connect(mapStateToProps, actionCreators)(TourProvider);
