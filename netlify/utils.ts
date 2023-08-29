import {MongoClient} from 'mongodb';
import type {Handler} from '@netlify/functions';

const DB_URL = process.env.DB_URL || 'mongodb://localhost:27017';
const DB_NAME = 'ivy-be';

export function getParametersFromPath(path) {
  console.log(path)
  const [_, __, ...parameters] = path.split('/').map((x) => x.replace(/%20/g, ' '));
  const [_0, _1, author, name, ...rest] = parameters;
  return {author, name, instance: rest.join('/')};
}

export function errorResponse(callback, err, statusCode = 500) {
  console.error(err);

  callback(null, {statusCode, body: JSON.stringify({error: err})});
}

export const getMany: (colName: string) => Handler = (colName: string) => (event, context, callback) => {
  MongoClient.connect(`${DB_URL}/${DB_NAME}`)
    .then((connection) =>
      connection
        .db(DB_NAME)
        .collection(colName)
        .find({})
        .toArray()
        .then((results) => {
          callback!(null, {
            statusCode: 200,
            body: JSON.stringify(results),
          });
          connection.close();
        }),
    )
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

      collection
        .find(query)
        .limit(1)
        .sort({$natural: -1})
        .toArray()
        .then((result) => {
          const output = resultToOutput(result[0]);
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

// should be formatted like 2020-09-09T04:35:08.804Z
const makeDateString = () => new Date().toISOString();

export const insertOne: (colName: string, bodyToQuery: (body: string) => Record<string, any>) => Handler =
  (colName, bodyToQuery) => (event, context, callback) => {
    let query: Record<string, any>;
    try {
      query = bodyToQuery(event.body || '');
    } catch (e) {
      errorResponse(callback, 'Bad submit');
      return;
    }

    MongoClient.connect(`${DB_URL}/${DB_NAME}`)
      .then(async (connection) => {
        const db = connection.db(DB_NAME);
        const collection = db.collection(colName);

        const latestInsert = await collection.find({}).sort({id: -1}).limit(1).toArray();
        const lastId = latestInsert[0]?.id || 0;

        return collection.insertOne({...query, id: lastId + 1, created_at: makeDateString()}).then(() => {
          callback!(null, {statusCode: 200});
          connection.close();
        });
      })
      .catch((err) => errorResponse(callback, err));
  };
