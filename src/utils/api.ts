import {Template} from '../types';
import {DEFAULT_TEMPLATES} from '../templates';
import {FETCH_PARMS} from '../constants/index';
import {serverPrefix} from './index';

function simpleGetJSON(url: string): Promise<any> {
  return fetch(url, FETCH_PARMS as any)
    .then(x => {
      console.log(x);
      return x;
    })
    .then(x => x.json());
}

export function getTemplate(templateAuthor: string, templateName: string): Promise<Template> {
  return new Promise((resolve, reject) => {
    const foundTemplate = DEFAULT_TEMPLATES.find(
      template => template.templateAuthor === templateAuthor && template.templateName === templateName,
    );
    if (foundTemplate) {
      resolve(foundTemplate);
      return;
    }
    return simpleGetJSON(`${serverPrefix()}/${templateAuthor}/${templateName}`).then(template => {
      return resolve(template.template);
    });
  });
}

interface TemplateInstance {
  created_at: string;
  dataset: string;
  id: number;
  instance_creator?: string;
  name: string;
  template_creator: string;
  template_instance: {[key: string]: string | string[]};
  template_name: string;
}

export function getTemplateInstance(
  templateAuthor: string,
  templateName: string,
  templateInstance: string,
): Promise<TemplateInstance> {
  return simpleGetJSON(`${serverPrefix()}/${templateAuthor}/${templateName}/${templateInstance}`);
}
