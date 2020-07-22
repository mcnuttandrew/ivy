import React from 'react';
import SplitPane from 'react-split-pane';

import {getHeight, writeHeight} from '../utils/local-storage';

// wrap the split pane functionality into a HOC
export default function SplitPaneWrapper(props: any): JSX.Element {
  if (props.showProgrammaticMode && props.showGUIView) {
    return (
      <SplitPane
        split="horizontal"
        minSize={60}
        style={{overflow: 'unset', position: 'relative'}}
        defaultSize={getHeight() || 400}
        onChange={writeHeight}
      >
        {props.children}
      </SplitPane>
    );
  }

  return <div className="flex-down full-height">{props.children}</div>;
}
