import {errorResponse} from '../utils';
import {Handler} from '@netlify/functions';
import {MongoClient} from 'mongodb';

const DB_URL = process.env.DB_URL || 'mongodb://localhost:27017';
const DB_NAME = 'ivy-be';

export const handler: Handler = (event, context, callback) => {
  let parsedArgs: Record<string, any>;
  try {
    parsedArgs = JSON.parse(event.body!);
  } catch (e) {
    errorResponse(callback, 'Bad submit');
    return;
  }

  MongoClient.connect(`${DB_URL}/${DB_NAME}`)
    .then(async (connection) => {
      const db = connection.db(DB_NAME);

      await db.collection('templates').deleteMany({
        name: parsedArgs.templateName,
        creator: parsedArgs.templateAuthor,
      });

      await db.collection('template-instances').deleteMany({
        template_name: parsedArgs.templateName,
        template_creator: parsedArgs.templateAuthor,
      });

      callback!(null, {statusCode: 200});
      connection.close();
    })
    .catch((err) => errorResponse(callback, err));
};
