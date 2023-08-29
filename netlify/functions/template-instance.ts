import {getOne, getParametersFromPath} from '../utils';

function pathToQuery(path: string) {
  const params = getParametersFromPath(path);
  const query = {
    template_name: params.name,
    template_creator: params.author,
    name: params.instance,
  };
  return query;
}

export const handler = getOne('template-instances', pathToQuery, (x) => {
  try {
    const output = Object.fromEntries(
      [
        'id',
        'template_name',
        'template_creator',
        'name',
        'instance_creator',
        'template_instance',
        'dataset',
      ].map((key) => [key, x[key]]),
    );
    return {body: JSON.stringify(output), statusCode: 200};
  } catch (e) {
    console.log('parse error', e);
    return false;
  }
});
