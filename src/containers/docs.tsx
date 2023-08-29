import React from 'react';
import {connect} from 'react-redux';

import ReactMarkdown from 'react-markdown';
// import docsText from '../../docs/language-docs.md';
// eslint-disable-next-line @typescript-eslint/no-var-requires
// eslint-disable-next-line no-undef
// const docsText = process.env.NODE_ENV === 'test' ? '' : require('../../docs/language-docs.md').default;
import * as actionCreators from '../actions/index';
// import {ActionUser} from '../actions';
import Header from '../components/header';
// type Props = ActionUser;

export function DocsContainer(): JSX.Element {
  const [docsText, setDocsText] = React.useState('');
  React.useEffect(() => {
    import('../../docs/language-docs.md').then((res) => {
      fetch(res.default)
        .then((response) => response.text())
        .then((text) => setDocsText(text));
    });
  }, []);
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
