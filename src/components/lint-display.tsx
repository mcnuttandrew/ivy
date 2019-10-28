import React from 'react';
import {classnames} from '../utils';

interface LintProps {
  lints: any;
}

export default class LintDisplay extends React.Component<LintProps> {
  render() {
    const {lints} = this.props;
    // todo listeners
    // todo automatical height inference
    const {warns, errors} = lints.reduce(
      (acc: {warns: number, errors: number}, lint: any) => {
        if (lint.severity === 'warn') {
          acc.warns += 1;
        }
        if (lint.severity === 'error') {
          acc.errors += 1;
        }
        return acc;
      },
      {warns: 0, errors: 0},
    );
    return (
      <div className="lint-container">
        <div className="lint-header">
          <h5>{`Lint Panel: ${warns} warnings and ${errors} errors`}</h5>
        </div>
        {lints.map((lint: any) => {
          return (
            <div
              key={lint.name}
              className={classnames({
                'lint-rule': true,
                'lint-rule--severity-warn': lint.severity === 'warn',
                'lint-rule--severity-error': lint.severity === 'error',
              })}
            >
              {lint.name}
            </div>
          );
        })}
      </div>
    );
  }
}
