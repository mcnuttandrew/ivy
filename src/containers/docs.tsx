import React from 'react';
import {connect} from 'react-redux';

import * as actionCreators from '../actions/index';
import {ActionUser} from '../actions';
import Header from '../components/header';
type Props = ActionUser;

export function DocsContainer(): JSX.Element {
  return (
    <div className="home-container home-container-contents-width-set full-width">
      <Header />
      <h1>Docs</h1>
      <p>
        Ivy is an integrated visualization editor which aims to support a variety of ways to create
        visualizations.
      </p>
    </div>
  );
}

export function mapStateToProps(): any {
  return {};
}

export default connect(mapStateToProps, actionCreators)(DocsContainer);
