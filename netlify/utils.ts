import {MongoClient} from 'mongodb';
import type {Handler} from '@netlify/functions';

const DB_URL = process.env.DB_URL || 'mongodb://localhost:27017';
const DB_NAME = 'ivy-be';

export function getParametersFromPath(path) {
  const [_, __, ...parameters] = path.split('/').map((x) => x.replace(/%20/g, ' '));
  return {
    author: parameters[2],
    name: parameters[3],
    instance: parameters[4],
  };
}

export function errorResponse(callback, err) {
  console.error(err);

  callback(null, {
    statusCode: 500,
    body: JSON.stringify({error: err}),
  });
}

export const simpleHandler: (colName: string) => Handler =
  (colName: string) => (event, context, callback) => {
    MongoClient.connect(`${DB_URL}/${DB_NAME}`)
      .then((connection) => {
        const db = connection.db(DB_NAME);
        const collection = db.collection(colName);

        collection
          .find({})
          .toArray()
          .then((results) => {
            callback!(null, {
              statusCode: 200,
              body: JSON.stringify(results),
            });
            connection.close();
          });
      })
      .catch((err) => errorResponse(callback, err));
  };

export const getOne: (
  colName: string,
  pathToQuery: (path: string) => Record<string, string>,
  resultToOutput: (x: any) => any,
) => Handler = (colName, pathToQuery, resultToOutput) => (event, context, callback) => {
  let query;
  try {
    query = pathToQuery(event.path);
  } catch (e) {
    errorResponse(callback, 'Bad submit');
    return;
  }

  MongoClient.connect(`${DB_URL}/${DB_NAME}`)
    .then((connection) => {
      const db = connection.db(DB_NAME);
      const collection = db.collection(colName);

      collection.findOne(query).then((result) => {
        const output = resultToOutput(result);
        if (output) {
          callback!(null, output);
        } else {
          errorResponse(callback, 'Not found');
        }
        connection.close();
      });
    })
    .catch((err) => errorResponse(callback, err));
};
