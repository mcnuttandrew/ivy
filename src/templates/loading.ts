import {Template} from '../types';
import {AUTHORS} from '../constants/index';

const LOADING: Template = {
  templateName: '____loading____',
  templateDescription: 'LOADING',
  templateAuthor: AUTHORS,
  templateLanguage: 'Loading',
  disallowFanOut: true,
  widgets: [],
  code: '["LOADING"]',
};
export default LOADING;
