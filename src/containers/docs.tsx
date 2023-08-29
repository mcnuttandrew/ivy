import React, {useEffect} from 'react';
import {connect} from 'react-redux';

import ReactMarkdown from 'react-markdown';

import * as actionCreators from '../actions/index';
import Header from '../components/header';

// mock necessary for react markdown for some reason
// @ts-ignore
window.process = {cwd: () => ''};

export function DocsContainer(): JSX.Element {
  const [docsText, setDocsText] = React.useState('');
  useEffect(() => {
    fetch('./docs/language-docs.md')
      .then((x) => x.text())
      .then((x) => setDocsText(x))
      .catch((e) => console.error(e));
  }, []);
  return (
    <div className="home-container">
      <Header />
      <div className="markdown-body home-container-contents-width-set">
        {<ReactMarkdown>{docsText}</ReactMarkdown>}
      </div>
    </div>
  );
}

export function mapStateToProps(): any {
  return {};
}

export default connect(mapStateToProps, actionCreators)(DocsContainer);
