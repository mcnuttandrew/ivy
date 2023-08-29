import {errorResponse} from '../utils';
import {Handler} from '@netlify/functions';
import {MongoClient} from 'mongodb';

const DB_URL = process.env.DB_URL || 'mongodb://localhost:27017';
const DB_NAME = 'ivy-be';

function getParametersFromPath(path) {
  const [_, __, ...parameters] = path.split('/').map((x) => x.replace(/%20/g, ' '));
  const [_0, _1, userName] = parameters; 
  return userName;
}

export const handler: Handler = (event, context, callback) => {
  let userName: string;
  try {
    userName = getParametersFromPath(event.path);
  } catch (e) {
    errorResponse(callback, 'Bad submit');
    return;
  }


  MongoClient.connect(`${DB_URL}/${DB_NAME}`)
    .then(async (connection) => {
      const db = connection.db(DB_NAME);

      const result = await db.collection('user-log').updateOne(
        {name: userName}, 
        {$inc: {count: 1}}, 
        {upsert: true});
      callback!(null, {statusCode: 200});
      connection.close();
    })
    .catch((err) => errorResponse(callback, err));
};
