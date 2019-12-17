import React from 'react';
import {SliderWidget} from '../../templates/types';
import {GeneralWidget} from './general-widget';

export default function SliderWidget(props: GeneralWidget<SliderWidget>) {
  const {
    widget,
    idx,
    setWidgetValue,
    editMode,
    templateMap,
    setTemplateValue,
  } = props;
  const clamp = (v: any) =>
    Math.max(widget.minVal, Math.min(widget.maxVal, Number(v)));
  const setVal = (text: any) =>
    setTemplateValue({field: widget.widgetName, text: clamp(text)});
  return (
    <div className="slide-widget">
      {!editMode && <div>{widget.widgetName}</div>}
      {editMode && (
        <input
          value={widget.widgetName}
          onChange={event =>
            setWidgetValue('widgetName', event.target.value, idx)
          }
        />
      )}
      <div className="flex">
        <input
          type="number"
          value={templateMap[widget.widgetName]}
          onChange={({target: {value}}) => setVal(value)}
        />
        <div className="flex-down">
          <input
            type="range"
            min={widget.minVal}
            max={widget.maxVal}
            value={templateMap[widget.widgetName]}
            onChange={event => setVal(event.target.value)}
            step={widget.step}
            className="slider"
          />
          <div className="flex space-between">
            {!editMode && <span>{widget.minVal}</span>}
            {!editMode && <span>{widget.maxVal}</span>}
            {!editMode && <span>{widget.minVal}</span>}
            {editMode && (
              <input
                value={widget.minVal}
                onChange={event =>
                  setWidgetValue('minVal', event.target.value, idx)
                }
              />
            )}
            {editMode && (
              <input
                value={widget.maxVal}
                onChange={event =>
                  setWidgetValue('maxVal', event.target.value, idx)
                }
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
  // return (
  //   <div className="flex">
  //     <div className="flex-down">
  //       <input
  //         value={widget.widgetName}
  //         onChange={event =>
  //           setWidgetValue('widgetName', event.target.value, idx)
  //         }
  //       />
  //     </div>
  //     <div className="flex-down">
  //       <div className="flex">
  //         <div className="flex-down">
  //           <span className="tool-description">Min </span>
  //           <input
  //             value={widget.minVal}
  //             onChange={event =>
  //               setWidgetValue('minVal', event.target.value, idx)
  //             }
  //           />
  //         </div>
  //         <div className="flex-down">
  //           <span className="tool-description">Max</span>
  //           <input
  //             value={widget.maxVal}
  //             onChange={event =>
  //               setWidgetValue('maxVal', event.target.value, idx)
  //             }
  //           />
  //         </div>
  //       </div>
  //       <div className="flex">
  //         <div className="flex-down">
  //           <span className="tool-description">Step Size</span>
  //           <input
  //             value={widget.step}
  //             onChange={event =>
  //               setWidgetValue('step', event.target.value, idx)
  //             }
  //           />
  //         </div>
  //         <div className="flex-down">
  //           <span className="tool-description">Default Value</span>
  //           <input
  //             value={widget.defaultValue}
  //             onChange={event =>
  //               setWidgetValue('defaultValue', event.target.value, idx)
  //             }
  //           />
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );
}
