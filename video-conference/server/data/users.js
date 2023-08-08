// import {users} from "../config/mongoCollections.js";
import { getClient } from "../config/mongoConnection.js";
import { validEmail, validPassword, validUUID } from "../utils/validatiton.js";
import hash from "../utils/encryption.js";
export const getUser = async (email) => {
    //validation
    email = validEmail(email);

    //databse reference
    const usersCollection = await getClient().collection("users");

    //databse query
    let user = await usersCollection.findOne({emailId: email});
    if(user == null){
        throw `User not found`
    }
    //send result back to user
    user._id = user._id.toString();
    return user;
  };

export const addUser = async(email, password)=>{

    //validation
    email = validEmail(email);
    password = validPassword(password);

    //hash password
    password = await hash.generateHash(password);

    //db reference
    const usersCollection = await getClient().collection("users");
    
    
    //query the database
    let user = await usersCollection.insertOne({
        "emailId": email,
        "password":password,
        "meetId": ""
    });
    
    if (!user.acknowledged || !user.insertedId) throw 'Could not add user';
    const newId = user.insertedId.toString();
    return newId;
}

export const updateUserMeetId  = async(meetId, email)=>{
    //validation
    email = validEmail(email);
    meetId = validUUID(meetId);

    //database reference 
    const usersCollection = await getClient().collection("users");
    
    //update the meetid
    let user = usersCollection.findOneAndUpdate(
        {
            "emailId": email
        },
        {$set :{
            meetId: meetId
            }
        },
        {
          returnDocument:"after"  
        }
     );

    //if query fails
    if(result.lastErrorObject.n === 0){
        throw `could not add meetId`;
    }

    return;

}