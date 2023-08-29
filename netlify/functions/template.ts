import {MongoClient} from 'mongodb';
import type {Handler, HandlerEvent, HandlerContext} from '@netlify/functions';
import {errorResponse, getOne} from '../utils';

function getParametersFromPath(path) {
  const [_, __, ...parameters] = path.split('/').map((x) => x.replace(/%20/g, ' '));
  const [_0, _1, author, ...rest] = parameters; 
  return {author, name: rest.join('/')};
}

function pathToQuery(path: string) {
  const params = getParametersFromPath(path);
  const query = {name: params.name, creator: params.author};
  return query;
}

export const handler = getOne('templates', pathToQuery, (x) => {
  try {
    return {body: x.template, statusCode: 200};
  } catch (e) {
    console.log('parse error', e);
    return false;
  }
});
