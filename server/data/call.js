import { validEmail, validUUID } from "../utils/validatiton.js"
import {users} from "../config/mongoCollections.js";
import { findOneAndUpdate, getOne } from "./dbAbstraction.js";
import { ObjectId } from "mongodb";
import { getRedisClient } from "../config/redisConnect.js";

export const addCurrentCallInfo = async(userId, calleeEmailId, meetId)=>{
    calleeEmailId=  validEmail(calleeEmailId); 
    meetId= validUUID(meetId);
    let user = await getOne(users,{_id: new ObjectId(userId)});

    //check if user is alreading engaged in a call; 
    // console.log(user);
    // if(user.currentCalll.CallTo != "" || user.currentCalll.meetId != ""){
    //         return;
    // }  

    let addCall = await findOneAndUpdate(users, {_id: new ObjectId(userId)}, {$set: {"currentCalll.CallTo": calleeEmailId, "currentCalll.meetId": meetId }})
    let redisClient = await getRedisClient();
    await redisClient.set(user.emailId, meetId);

    return addCall;
}

export const removeCurrentCallInfo = async(userId)=>{
    console.log(userId);
    let user = await getOne(users,{_id: new ObjectId(userId)});
    if(!user){
        throw `User not found`;
    }
    let removeCall = await findOneAndUpdate(users, {_id: new ObjectId(userId)}, {$set: {"currentCalll.CallTo": "", "currentCalll.meetId": ""}});
    return removeCall;
}

export const addCallHistory = async(userId, calleeEmailId, Accpeted)=>{
    // calleeEmailId=  validEmail(calleeEmailId);
    console.log(userId, calleeEmailId, Accpeted);
    let currDate = new Date();
    console.log(currDate);
    let updateCallHistory = await findOneAndUpdate(users, {_id: new ObjectId(userId)}, {$push: {PreviousCalls: {
        "calleeEmailId": calleeEmailId,
        "Accpeted": Accpeted, 
        "Timestamp": currDate,
    }}});
    return updateCallHistory;
}

export const getHistoryByEmailId = async (emailId)=>{
    let user = await getOne(users,{emailId: emailId});
    let calls =[];
    let total = user.PreviousCalls.length-1;
    for(let i= total; i >total-10 && i>=0; i--){
        calls.push(user.PreviousCalls[i]);
    }
    
    return calls;
}