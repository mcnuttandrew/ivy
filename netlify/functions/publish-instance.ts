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

// export const handler: Handler = (event, context, callback) => {
//   let inputs: Record<string, any>;
//   try {
//     inputs = parseInputs(event.body);
//   } catch (e) {
//     errorResponse(callback, 'Bad submit');
//     return;
//   }

//   const query = {
//     template_creator: inputs.templateAuthor,
//     template_name: inputs.templateName,
//     name: inputs.templateInstance,
//     template_instance: inputs.templateMap,
//     instance_creator: inputs.instanceCreator,
//     dataset: inputs.dataset,
//     thumbnail: inputs.thumbnail,
//   };

//   MongoClient.connect(`${DB_URL}/${DB_NAME}`)
//     .then((connection) => {
//       const db = connection.db(DB_NAME);
//       const collection = db.collection('template-instances');
//       return collection.insertOne(query).then((result) => {
//         console.log(result);
//         callback!(null, {statusCode: 200});
//         connection.close();
//       });
//     })
//     .catch((err) => {
//       return errorResponse(callback, err);
//     });
// };
