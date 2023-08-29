import {Template} from '../types';
import {DEFAULT_TEMPLATES} from '../templates';
import {FETCH_PARMS} from '../constants/index';

function simpleGetJSON(url: string): Promise<any> {
  return fetch(url, FETCH_PARMS as any)
    .then((x) => x.json())
    .catch((e) => console.error(e));
}

export function getTemplates(): Promise<Template[]> {
  return fetch(`.netlify/functions/templates`, FETCH_PARMS as any)
    .then((x) => x.json())
    .then((fetchedData) =>
      fetchedData.reduce((acc: any[], x: any) => {
        try {
          let result;
          if (typeof x.template === 'string') {
            result = JSON.parse(x.template);
          } else if (typeof x.template === 'object') {
            result = x.template;
          } else {
            throw new Error('bad template');
          }
          acc.push(result);
        } catch (e) {
          console.error('parse fail !', x);
        }
        return acc;
      }, []),
    );
}

export function getTemplate(templateAuthor: string, templateName: string): Promise<Template> {
  return new Promise((resolve, reject) => {
    const foundTemplate = DEFAULT_TEMPLATES.find(
      (template) => template.templateAuthor === templateAuthor && template.templateName === templateName,
    );
    if (foundTemplate) {
      resolve(foundTemplate);
      return;
    }
    return simpleGetJSON(`.netlify/functions/template/${templateAuthor}/${templateName}`)
      .then((template) => resolve(template))
      .catch((e) => reject(e));
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
  return simpleGetJSON(
    `.netlify/functions/template-instance/${templateAuthor}/${templateName}/${templateInstance}`,
  );
}
