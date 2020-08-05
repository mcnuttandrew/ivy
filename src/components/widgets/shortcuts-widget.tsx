// import React from 'react';
// import {ShortcutsWidget, Widget, Shortcut} from '../../types';
// import {GeneralWidget, WidgetBuilder} from './general-widget';
// import {IgnoreKeys} from 'react-hotkeys';
// import {AddLabelToWidget} from './widget-common';
// import {evaluateShortcut} from '../../ivy-lang';

// function ShortcutsWidgetConfiguration(props: GeneralWidget<ShortcutsWidget>): JSX.Element {
//   const {widget, idx, setWidgetValue} = props;
//   const shortcuts = widget.config.shortcuts;

//   return (
//     <div className="flex-down shortcuts-widget">
//       <div>Shortcuts</div>
//       <div className="flex-down">
//         {shortcuts.map((shortcut, jdx) => {
//           const setValue = (key: string) => (event: any): void => {
//             setWidgetValue({
//               key: 'shortcuts',
//               value: shortcuts.map((x, kdx) => (kdx === jdx ? {...x, [key]: event.target.value} : x)),
//               idx,
//             });
//           };
//           return (
//             <div key={`${idx}-shortcut`} className="flex">
//               <AddLabelToWidget label={'Shortcut name'}>
//                 <IgnoreKeys style={{height: '100%'}}>
//                   <input
//                     aria-label={`Shortcut name`}
//                     value={shortcut.label || ''}
//                     type="text"
//                     onChange={setValue('label')}
//                   />
//                 </IgnoreKeys>
//               </AddLabelToWidget>
//               <AddLabelToWidget label={'Shortcut function'}>
//                 <IgnoreKeys style={{height: '100%'}}>
//                   <input
//                     aria-label={`Shortcut function`}
//                     value={shortcut.shortcutFunction || ''}
//                     type="text"
//                     onChange={setValue('shortcutFunction')}
//                   />
//                 </IgnoreKeys>
//               </AddLabelToWidget>
//             </div>
//           );
//         })}
//       </div>
//       <button
//         onClick={(): void => {
//           setWidgetValue({
//             key: 'shortcuts',
//             value: shortcuts.concat({
//               label: 'BLANK_SHORTCUT',
//               shortcutFunction: 'return parameters',
//             }),
//             idx,
//           });
//         }}
//       >
//         Add another shortcut
//       </button>
//     </div>
//   );
// }

// function ShortcutsWidgetComponent(props: GeneralWidget<ShortcutsWidget>): JSX.Element {
//   const {widget, templateMap, setAllTemplateValues} = props;
//   return (
//     <div className="flex shortcuts-widget">
//       {widget.config.shortcuts.map(
//         (shortcut: Shortcut): JSX.Element => (
//           <button
//             type="button"
//             onClick={(): void => {
//               setAllTemplateValues(evaluateShortcut(shortcut, templateMap));
//             }}
//             key={shortcut.label}
//           >
//             {shortcut.label}
//           </button>
//         ),
//       )}
//     </div>
//   );
// }

// const ShortcutBuilder: WidgetBuilder = (widget, common) => {
//   return {
//     controls: <ShortcutsWidgetConfiguration {...common} widget={widget as Widget<ShortcutsWidget>} />,
//     uiElement: <ShortcutsWidgetComponent {...common} widget={widget as Widget<ShortcutsWidget>} />,
//     materializationOptions: (): {name: string; group?: string}[] => [],
//   };
// };
// export default ShortcutBuilder;
