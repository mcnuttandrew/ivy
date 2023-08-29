import {MongoClient} from 'mongodb';
import type {Handler, HandlerEvent, HandlerContext} from '@netlify/functions';
import {errorResponse, getParametersFromPath} from '../utils';

const DB_URL = process.env.DB_URL || 'mongodb://localhost:27017';
const DB_NAME = 'ivy-be';

export const handler: Handler = (event, context, callback) => {
  // errorResponse(callback, 'Not implemented');
  // return;
  let params;
  try {
    params = getParametersFromPath(event.path);
  } catch (e) {
    errorResponse(callback, 'Bad submit');
    return;
  }
  const query = {
    template_name: params.name,
    template_creator: params.author,
  };

  MongoClient.connect(`${DB_URL}/${DB_NAME}`)
    .then((connection) => {
      const db = connection.db(DB_NAME);
      const collection = db.collection('template-instances');

      collection.find(query).sort({id: -1}).limit(1).toArray().then((results) => {
        const result = results[0];
        if (!result || !result.thumbnail) {
          errorResponse(callback, 'No thumbnail found');
          connection.close();
          return;
        }
        const img = result.thumbnail;
        // const base64Image = img.split(';base64,').pop();
        callback!(null, {
          statusCode: 200,
          body: img,
          // headers: {'Content-Type': 'image/png'},
          // body: base64Image,
          // isBase64Encoded: true,
        });
        connection.close();
      });
    })
    .catch((err) => {
      return errorResponse(callback, err);
    });
};
