// /* eslint-disable react/prop-types */
// /* eslint-disable react/display-name */
// import React from 'react';
// import {GenericAction} from '../actions/index';
// import {Template, LanguageExtension, TemplateMap} from '../types';
// import {getTemplateName} from '../utils';
// import GALLERY from '../templates/gallery';
// import PublishInstanceTooltip from './tooltips/publish-instance-tooltip';
// import PublishTemplateTooltip from './tooltips/publish-template-tooltip';
// import UnpublishTemplateTooltip from './tooltips/unpublish-template-tooltip';
// import ForkStateTooltip from './tooltips/fork-state-tooltip';
// import NewTemplateTooltip from './tooltips/new-template-tooltip';
// import ResetTemplateMapTooltip from './tooltips/reset-template-map-tooltip';

// interface Props {
//   currentlySelectedFile: string;
//   fillTemplateMapWithDefaults: GenericAction<void>;
//   deleteTemplate: GenericAction<{templateAuthor: string; templateName: string}>;
//   editMode: boolean;
//   languages: {[x: string]: LanguageExtension};
//   saveCurrentTemplate: GenericAction<void>;
//   setBlankTemplate: GenericAction<{fork: string | null; language: string}>;
//   setCodeMode: GenericAction<string>;
//   setEditMode: GenericAction<boolean>;
//   setProgrammaticView: GenericAction<boolean>;
//   template: Template;
//   templateSaveState: string;
//   templates: Template[];
//   templateMap: TemplateMap;
//   userName: string;
// }

// export default function EncodingControls(props: Props): JSX.Element {
//   const {
//     currentlySelectedFile,
//     fillTemplateMapWithDefaults,
//     deleteTemplate,
//     languages,
//     saveCurrentTemplate,
//     setBlankTemplate,
//     setCodeMode,
//     setEditMode,
//     setProgrammaticView,
//     template,
//     templateMap,
//     templateSaveState,
//     userName,
//   } = props;

//   const onGallery = template.templateName === GALLERY.templateName;

//   return (
//     <div className="template-logo">
//       <div className="flex-down full-width">
//         <h4>
//           <b>Template:</b> {getTemplateName(template)}
//         </h4>
//         <h5 className="flex">
//           <b>Description: </b>
//           {template.templateDescription}
//         </h5>
//         <h5 className="flex">
//           <b>Author: </b>
//           {template.templateAuthor}
//         </h5>
//         <div className="encoding-mode-selector flex-down">
//           <div className="flex full-width flex-wrap">
//             <h5>
//               <b>Actions: </b>
//             </h5>

//             <NewTemplateTooltip
//               setBlankTemplate={setBlankTemplate}
//               setEditMode={setEditMode}
//               languages={languages}
//               setCodeMode={setCodeMode}
//               setProgrammaticView={setProgrammaticView}
//             />
//             {!onGallery && (
//               <ForkStateTooltip
//                 setBlankTemplate={setBlankTemplate}
//                 setEditMode={setEditMode}
//                 template={template}
//               />
//             )}

//             <ResetTemplateMapTooltip fillTemplateMapWithDefaults={fillTemplateMapWithDefaults} />
//             <PublishInstanceTooltip
//               templateAuthor={template.templateAuthor}
//               templateName={template.templateName}
//               templateMap={templateMap}
//               dataset={currentlySelectedFile}
//               userName={userName}
//             />
//             {userName === template.templateAuthor && (
//               <UnpublishTemplateTooltip
//                 template={template}
//                 deleteTemplate={deleteTemplate}
//                 userName={userName}
//               />
//             )}
//           </div>
//         </div>
//         {templateSaveState !== 'EQUAL' && (
//           <h5>
//             <span>Unsaved changes: </span>
//             {userName === template.templateAuthor ? (
//               <PublishTemplateTooltip template={template} saveCurrentTemplate={saveCurrentTemplate} />
//             ) : (
//               <span>fork and save to publish</span>
//             )}
//           </h5>
//         )}
//       </div>
//     </div>
//   );
// }
