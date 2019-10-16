import React from 'react';
import {connect} from 'react-redux';
import * as actionCreators from '../actions/index.ts';

class RootComponent extends React.Component {
  render() {
    return (
      <div>
        <h1>bye!!</h1>
      </div>
    );
  }
}

function mapStateToProps() {
  return {};
}

export default connect(
  mapStateToProps,
  actionCreators,
)(RootComponent);
