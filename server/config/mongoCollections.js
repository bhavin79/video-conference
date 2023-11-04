import { dbConnection } from './mongoConnection.js';
import { getClient } from './mongoConnection.js';

const getCollectionFn = (collection) => {
  let _col = undefined;
 
  return async () => {
    if (!_col) {
      // const db = await dbConnection(); //This is for offline database
      const db = await getClient() //This is for online database.
      _col = await db.collection(collection);
    }
    return _col;
  };
};

export const users = getCollectionFn('users');
export const meets = getCollectionFn('meetings');
