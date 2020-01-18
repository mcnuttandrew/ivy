import React, {useState} from 'react';
import {GenericAction} from '../../actions/index';
import {Template} from '../../templates/types';
import {thumbnailLocation} from '../../thumbnail';
import ProgramPreview from './program-preview';

interface Props {
  chainActions: GenericAction;
  deleteTemplate: GenericAction;
  setEncodingMode: GenericAction;
  templates: Template[];
  toggleProgramModal: GenericAction;
}

type buttonFactory = {[action: string]: () => void};
function generateButtonActions(props: any): (x: string) => buttonFactory {
  const {setEncodingMode, toggle, deleteTemplate, chainActions} = props;
  return (templateName: string): buttonFactory => ({
    use: (): any => chainActions([(): void => setEncodingMode(templateName), toggle]),
    delete: (): any => deleteTemplate(templateName),
  });
}

export default function LocalPrograms(props: Props): JSX.Element {
  const {chainActions, deleteTemplate, setEncodingMode, templates, toggleProgramModal} = props;
  const [searchKey, setSearch] = useState('');
  const buttonActions = generateButtonActions({
    chainActions,
    deleteTemplate,
    setEncodingMode,
    toggle: toggleProgramModal,
  });
  return (
    <React.Fragment>
      <div>
        <input
          type="text"
          value={searchKey || ''}
          onChange={(event): any => setSearch(event.target.value)}
          placeholder="Search for Template"
        />
      </div>
      <div className="program-containers">
        <ProgramPreview
          templateName={'grammer'}
          templateDescription={'Tableau-style grammar of graphics'}
          buttons={['Use']}
          buttonActions={buttonActions}
        />
        {templates
          .filter(template => template.templateName !== '_____none_____')
          .filter((template: Template) => {
            const {templateName, templateDescription} = template;
            const matchDescription =
              templateDescription && templateDescription.toLowerCase().includes(searchKey || '');
            const matchName = templateName && templateName.toLowerCase().includes(searchKey || '');
            return matchDescription || matchName;
          })
          .map((template: Template, idx: number) => (
            <ProgramPreview
              templateName={template.templateName}
              templateDescription={template.templateDescription}
              buttons={['Publish', 'Use', 'Delete']}
              buttonActions={buttonActions}
              key={`${template.templateName}-${idx}`}
            />
          ))}
      </div>
    </React.Fragment>
  );
}
