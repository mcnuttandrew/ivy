import {insertOne} from '../utils';

function prepareQuery(body: any) {
  const parsed = JSON.parse(body);
  const {template} = parsed;
  if (!template || typeof template !== 'object') {
    throw new Error('bad inputs');
  }
  const {templateAuthor, templateName} = template;
  if (!templateAuthor || !templateName) {
    throw new Error('bad inputs');
  }

  return {
    template: JSON.stringify(template),
    creator: templateAuthor,
    name: templateName,
  };
}

export const handler = insertOne('templates', prepareQuery);
