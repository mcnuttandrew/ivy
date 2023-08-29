import {insertOne} from '../utils';
function prepareQuery(string: any) {
  const parsed = JSON.parse(string);
  const expectedArgs = [
    'templateAuthor',
    'templateName',
    'templateMap',
    'templateInstance',
    'dataset',
    'instanceCreator',
    'thumbnail',
  ];
  if (typeof parsed !== 'object') {
    throw new Error('bad inputs');
  }
  const noUnexpectedKeys = Object.keys(parsed).every((key) => expectedArgs.includes(key));
  const allExpectedKeys = expectedArgs.every((key) => Object.keys(parsed).includes(key));
  if (!noUnexpectedKeys || !allExpectedKeys) {
    throw new Error('bad inputs');
  }
  const query = {
    template_creator: parsed.templateAuthor,
    template_name: parsed.templateName,
    name: parsed.templateInstance,
    template_instance: parsed.templateMap,
    instance_creator: parsed.instanceCreator,
    dataset: parsed.dataset,
    thumbnail: parsed.thumbnail,
  };
  return query;
}

export const handler = insertOne('template-instances', prepareQuery);
