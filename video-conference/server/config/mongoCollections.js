// import { dbConnection } from './mongoConnection.js';
import { getClient } from './mongoConnection.js';
// const getCollectionFn = (collection) => {
//   let _col = undefined;
 
//   return async () => {
//     if (!_col) {
//       const db = await dbConnection();
//       _col = await db.collection(collection);
//     }

//     return _col;
//   };
// };


// export const users = getCollectionFn('users');
// export const meets = getCollectionFn('meetings');
// let client = getClient();
// export const users =   client.collection("users");
// export const meets =   client.collection("meeting");
export const users = ()=>{

}; 
export const meets = ()=>{
  
}; 
