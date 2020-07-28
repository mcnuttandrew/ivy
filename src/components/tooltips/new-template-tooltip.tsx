import React from 'react';
import Tooltip from 'rc-tooltip';
import {HoverTooltip} from '../tooltips';
import {Link} from 'react-router-dom';
import {TiPencil} from 'react-icons/ti';
import {LanguageExtension} from '../../types';
import {GenericAction} from '../../actions';
import {TEMPLATE_BODY} from '../../constants';

interface Props {
  setBlankTemplate: GenericAction<{fork: string | null; language: string}>;
  setEditMode: GenericAction<boolean>;
  languages: {[x: string]: LanguageExtension};
  setCodeMode: GenericAction<string>;
  setProgrammaticView: GenericAction<boolean>;
}

export default function NewTemplateTooltip(props: Props): JSX.Element {
  const {setBlankTemplate, setEditMode, languages, setCodeMode, setProgrammaticView} = props;

  return (
    <HoverTooltip
      message={'Create a new blank template, good if you are pasting in some code from somewhere else.'}
      delay={5}
    >
      <div className="template-modification-control">
        <Tooltip
          placement="bottom"
          trigger="click"
          overlay={
            <div className="flex-down">
              <h5>Create Blank Template</h5>
              {Object.keys(languages).map(language => {
                return (
                  <button
                    type="button"
                    key={language}
                    onClick={(): void => {
                      setBlankTemplate({fork: null, language});
                      setEditMode(true);
                      setCodeMode(TEMPLATE_BODY);
                      setProgrammaticView(true);
                    }}
                  >
                    <Link to="/editor">{`New ${language} template`}</Link>
                  </button>
                );
              })}
            </div>
          }
        >
          <span className="flex">
            <TiPencil />
            New
          </span>
        </Tooltip>
      </div>
    </HoverTooltip>
  );
}
