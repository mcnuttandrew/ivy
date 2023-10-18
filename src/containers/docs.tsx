import React, {useEffect} from 'react';
import {connect} from 'react-redux';

import ReactMarkdown from 'react-markdown';

import * as actionCreators from '../actions/index';
import remarkGfm from 'remark-gfm';
import Header from '../components/header';

// mock necessary for react markdown for some reason
// @ts-ignore
window.process = {cwd: () => ''};

export function DocsContainer(): JSX.Element {
  const [docsText, setDocsText] = React.useState('');
  useEffect(() => {
    const url =
      location.hostname === 'localhost'
        ? './docs/language-docs.md'
        : 'https://raw.githubusercontent.com/mcnuttandrew/ivy/master/docs/language-docs.md';
    fetch(url)
      .then((x) => x.text())
      .then((x) => setDocsText(x))
      .catch((e) => console.error(e));
  }, []);
  return (
    <div className="home-container">
      <Header />
      <div className="markdown-body home-container-contents-width-set">
        {<ReactMarkdown remarkPlugins={[remarkGfm]}>{docsText}</ReactMarkdown>}
      </div>
    </div>
  );
}

export function mapStateToProps(): any {
  return {};
}

export default connect(mapStateToProps, actionCreators)(DocsContainer);
