import {GenWidget} from '../types';
import {get, set} from 'idb-keyval';

// eslint-disable-next-line no-undef
const isTest = process.env.NODE_ENV === 'test';
export const getWidgetTemplates = (): Promise<GenWidget[]> =>
  isTest ? Promise.resolve([]) : get('template-widgets');
export const setWidgetTemplates = (widgets: GenWidget[]): Promise<void> => set('template-widgets', widgets);

export const getHeight = (): number => Number(localStorage.getItem('splitPosHeight'));
export const writeHeight = (size: any): any => localStorage.setItem('splitPosHeight', size);

export const getWidth = (): number => Number(localStorage.getItem('splitPosWidth'));
export const writeWidth = (size: any): any => localStorage.setItem('splitPosWidth', size);

export const getEditorFontSize = (): number => Number(localStorage.getItem('editorFontSize')) || 15;
export const writeEditorFontSize = (size: any): any => localStorage.setItem('editorFontSize', size);

export const getEditorLineWrap = (): boolean => localStorage.getItem('editorLineWrap') === 'true';
export const writeEditorLineWrap = (wrap: any): any => localStorage.setItem('editorLineWrap', wrap);

export const getUserName = (): string => localStorage.getItem('UserName');
export const writeUserName = (name: any): any => localStorage.setItem('UserName', name);

export const getGallerySectionPref = (): string => localStorage.getItem('GallerySectionPref');
export const writeGallerySectionPref = (name: any): any => localStorage.setItem('GallerySectionPref', name);

const names = [
  'Andromeda',
  'Antlia',
  'Apus',
  'Aquarius',
  'Aquila',
  'Ara',
  'Aries',
  'Auriga',
  'Bootes',
  'Caelum',
  'Camelopardalis',
  'Cancer',
  'Venatici',
  'CanisMajor',
  'CanisMinor',
  'Capricornus',
  'Carina',
  'Cassiopeia',
  'Centaurus',
  'Cepheus',
  'Cetus',
  'Chamaeleon',
  'Circinus',
  'Columba',
  'Coma',
  'Berenices',
  'Berenice',
  'Hair',
  'Corona',
  'Australis',
  'Borealis',
  'Northern',
  'Corvus',
  'Crater',
  'Crux',
  'Cygnus',
  'Delphinus',
  'Dorado',
  'Draco',
  'Equuleus',
  'Eridanus',
  'Fornax',
  'Gemini',
  'Grus',
  'Hercules',
  'Horologium',
  'Clock',
  'Hydra',
  'Hydrus',
  'Indus',
  'Lacerta',
  'Leo',
  'Leo',
  'Lepus',
  'Libra',
  'Lupus',
  'Lynx',
  'Lyra',
  'Mensa',
  'Microscopus',
  'Monocerus',
  'Musca',
  'Norma',
  'Octans',
  'Ophiuchus',
  'Orion',
  'Pavo',
  'Pegasus',
  'Perseus',
  'Phoenix',
  'Pictor',
  'Pisces',
  'Austrinus',
  'Pisces',
  'Puppis',
  'Pyxis',
  'Reticulum',
  'Sagitta',
  'Sagittarius',
  'Scorpius',
  'Sculptor',
  'Scutum',
  'Serpens',
  'Sextans',
  'Taurus',
  'Telescopium',
  'Triangulum',
  'Tucana',
  'Ursa',
  'Vela',
  'Virgo',
  'Volans',
  'Vulpecula',
];

export const randomSetUserNameIfUnset = (): void => {
  if (!getUserName()) {
    const name1 = names[Math.floor(Math.random() * names.length)];
    const name2 = names[Math.floor(Math.random() * names.length)];
    writeUserName(`${name1}-${name2}-${Math.floor(Math.random() * 100)}`);
  }
};
