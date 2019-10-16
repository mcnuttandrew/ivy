import React from 'react';
import {connect} from 'react-redux';
import * as actionCreators from '../actions';

class RootComponent extends React.Component {
  render() {
    return (
      <div>
        <h1>hi!</h1>
      </div>
    );
  }
}

function mapStateToProps({base}) {
  return {};
}

export default connect(
  mapStateToProps,
  actionCreators,
)(RootComponent);
