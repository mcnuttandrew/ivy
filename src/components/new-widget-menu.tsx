import React, {Fragment} from 'react';
import Popover from './popover';
import {AiOutlinePlusCircle} from 'react-icons/ai';
import {GenericAction} from '../actions';
import {widgetFactory, TemplateWidget} from '../templates/types';

interface Props {
  addWidget: GenericAction;
  widgets: TemplateWidget[];
}

export default function NewWidgetMenu(props: Props) {
  const {addWidget, widgets} = props;
  return (
    <Popover
      clickTarget={
        <Fragment>
          Add Widget <AiOutlinePlusCircle />
        </Fragment>
      }
      body={(toggle: any) => {
        return (
          <Fragment>
            <h1>Add New Widget</h1>
            {Object.entries(widgetFactory).map((row: any) => {
              const [key, widget] = row;
              return (
                <button
                  key={key}
                  onClick={() => {
                    addWidget(widget(widgets.length));
                    toggle();
                  }}
                >
                  {`Add ${key}`}
                </button>
              );
            })}
          </Fragment>
        );
      }}
    />
  );
}
