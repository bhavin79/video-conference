import {meets} from "../config/mongoCollections.js";
import { validEmail, validPermision, validString, validUUID } from "../utils/validatiton.js";
import hash from "../utils/encryption.js"
// import { getClient } from "../config/mongoConnection.js";


export const storeMeetId =async(meetId, emailId, password)=>{
   //validation
    emailId = validEmail(emailId);

    meetId =validUUID(meetId);

    password = validString(password, "password", 6);
    password = await hash.generateHash(password);

    console.log(`in data function: ${meetId} ${emailId} ${password}`)
 
    //databse reference
    const meetsCollection = await meets();

    //check if the meetId exist for corresponding email;
    const checkEmail = await meetsCollection.findOne({"owner.emailId": emailId});
    
    //if ti doesn't exist
    if(checkEmail == null){
        //create one
        const result = await meetsCollection.insertOne(
            {meetId: meetId, 
             password:password,
                owner:{
                    emailId: emailId, 
                    permision:"allow"
                }, 
                user:{
                    emailId: "", 
                    permision:"", 
                }
            });

        //if query didnt execute
        if (!result.acknowledged || !result.insertedId) throw 'Could not create meet';
    }
    else{
        //if the meet information exist then update the meet id and password
        let result = await meetsCollection.findOneAndUpdate({"owner.emailId": emailId},{$set: {meetId: meetId, password: password}}, {returnDocument: 'after'});

        //if the query fails
        if(result.lastErrorObject.n === 0){
            throw `could not create meet`;
        }
    }

    //add meetid to the user;          
    // await updateStoredMeetInfo(meetId, emailId);

    return meetId;
}

export const getStoredMeetId = async(meetId)=>{

    //validation
    meetId = validUUID(meetId);

    //databse reference
    const meetsCollection = await meets();
    let meet;
    
    //query the database;
    meet = await meetsCollection.findOne({"meetId": meetId});
    
    //check if the meet inforomation is null;
    if(meet==null){
        throw `MeetId Doesn't exist`;
    }

    //return if it exist
    return meet;
}

//update participants data. "user"
export const updateStoredMeetInfo =async(meetId, emailId)=>{

    //validation
    meetId = validUUID(meetId);
    emailId = validEmail(emailId);
   
    //databse reference
    const meetsCollection = await meets();
    let result;

    //Query the databse
    result = await meetsCollection.findOneAndUpdate({meetId:meetId},{$set: {"user.emailId":emailId}},{returnDocument: 'after'});
    
    //if query failed
    if(result.lastErrorObject.n === 0){
        throw `could not Join`;
    }
    return result;
}

export const updateUserPermision =async(emailId)=>{
     //validation
     meetId = validUUID(meetId);
     emailId = validEmail(emailId);
 
 
     //databse reference
     const meetsCollection = await meets();
 
     //Query the databse
     
     let result = await meetsCollection.findOneAndUpdate({meetId:meetId},{$set: {
         "user.emailId":emailId
     }},{returnDocument: 'after'});
 
     //if query failed
     if(result.lastErrorObject.n === 0){
         throw `could not Join`;
     }
}