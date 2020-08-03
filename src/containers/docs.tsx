import React from 'react';
import {connect} from 'react-redux';

import * as actionCreators from '../actions/index';
import {ActionUser} from '../actions';
import Header from '../components/header';
type Props = ActionUser;

export function DocsContainer(): JSX.Element {
  return (
    <div className="home-container">
      <Header />
      <h1>Docs</h1>
      <p>
        Ivy is an integrated visualization editor which aims to support a variety of ways to create
        visualizations. In this page we provide documentation of the template language used to power our
        system. The basic idea of the language is that it combines JSON with a series of simple abstraction
        operations that enable simpler re-usability. There are two key concepts in this language,
        substitutions and control flow.
      </p>
      <h3>Substitutions</h3>
      <p>DESCRIBE THE Substitutions LANGUAGE</p>
      <h3>Control Flow</h3>
      <p>DESCRIBE THE control flow LANGUAGE</p>
    </div>
  );
}

export function mapStateToProps(): any {
  return {};
}

export default connect(mapStateToProps, actionCreators)(DocsContainer);
