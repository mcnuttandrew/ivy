import React from 'react';
import {connect} from 'react-redux';

import ReactMarkdown from 'react-markdown';
// eslint-disable-next-line @typescript-eslint/no-var-requires
// eslint-disable-next-line no-undef
const docsText = process.env.NODE_ENV === 'test' ? '' : require('../../docs/language-docs.md').default;
// import docsText from '../../docs/language-docs.md';
import * as actionCreators from '../actions/index';
import {ActionUser} from '../actions';
import Header from '../components/header';
type Props = ActionUser;

export function DocsContainer(): JSX.Element {
  return (
    <div className="home-container">
      <Header />
      <div className="markdown-body home-container-contents-width-set">
        <ReactMarkdown source={docsText} />
      </div>
    </div>
  );
}

export function mapStateToProps(): any {
  return {};
}

export default connect(mapStateToProps, actionCreators)(DocsContainer);
