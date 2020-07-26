import React, {useEffect, useState} from 'react';
import {connect} from 'react-redux';

import * as actionCreators from '../actions/index';
import {AppState, DataReducerState} from '../types';
import {ActionUser} from '../actions';
import Header from '../components/header';
type Props = ActionUser;

export function DocsContainer(props: Props): JSX.Element {
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

export function mapStateToProps({base}: {base: AppState; data: DataReducerState}): any {
  return {};
}

export default connect(mapStateToProps, actionCreators)(DocsContainer);
