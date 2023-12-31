import { MongoClient } from 'mongodb';
import { mongoConfig } from './settings.js';

let _connection = undefined;
let _db = undefined;

const dbConnection = async () => {
  if (!_connection) {
    _connection = await MongoClient.connect(mongoConfig.serverUrl);
    _db = _connection.db(mongoConfig.database);
  }

  return _db;
};

const closeConnection = async () => {
  await _connection.close();
};

export { dbConnection, closeConnection };


let client = undefined;
export const connectDB = async (URI)=>{
    client = new MongoClient(URI);
    await client.connect();
}
export const getClient =()=>{
    if(typeof client == "undefined"){
        throw "Error: Client is not connected to database.";
    }
    return client.db();
}

// export const connectionClose = async ()=>{
//     if(typeof client == "undefined"){
//         throw "Error: No connection to close. Client is not connected to database.";
//     }
//     await client.close();
//     client = undefined;
//     return;
// }