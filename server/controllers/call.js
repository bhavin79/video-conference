import { v4 as uuidV4 } from "uuid"
import { addCallHistory, addCurrentCallInfo } from "../data/call.js";
import { validEmail } from "../utils/validatiton.js";
import { getUser } from "../data/users.js";

export const call = async (req, res)=>{
    console.log(req.session.user, "-- session"); 
    //  check if the user is logged in;
    if(typeof req.session.user.emailId == undefined){
        return res.status(403).json({msg: "Please log in"});
    };

    const {emailId} = req.body;
    // try {
    //     emailId = validEmail(emailId);
    // } catch (error) {
    //     return res.status(400).json(error);
    // }


    const meetId = uuidV4();
    let callAdd;
    try {
        callAdd =  await addCurrentCallInfo(req.session.user.id, emailId, meetId); //add calling information;
        if(callAdd){
            console.log(callAdd);
            req.io.to(emailId).emit("call", {emailId: callAdd.value.emailId}); //make a websokcet call;
        }
    } catch (error) {
        return res.status(400).json(error);
    }
    return res.status(200).json({meetId}); //send meetId to join socket room on connect;
}

export const callAccept = async(req, res)=>{
    console.log(req.session.user); 
    //  check if the user is logged in; 
    if(typeof req.session.user.emailId == undefined){
        return res.status(403).json({msg: "Please log in"});
    };

    const {emailId} = req.body;
    console.log(emailId);
    // try {
    //     emailId = validEmail(emailId);
    // } catch (error) {
    //     return res.status(403).json(error);
    // }

    //1. meetId;
    let callee;
    try {
        callee = await getUser(emailId);
    } catch (error) {
        return res.status(404).json(error);
    }

    //2. update user; 
    let callAdd;
    try {
        // console.log(req.session.user.id, emailId, callee.currentCalll.meetId);
        callAdd =  await addCurrentCallInfo(req.session.user.id, emailId, callee.currentCalll.meetId); //add calling information;
    } catch (error) {
        console.log(error);
        return res.status(400).json(error);
    }
    
    //3. add to calling history;
    // try {
    //     let addMyHistory = await addCallHistory(req.session.user.id, emailId, true);
    //     let calleeHistory = await addCallHistory(callee._id, callAdd.email, true);
    // } catch (error) {
    //     return res.status(400).json(error);
    // }
    return res.status(200).json({meetId: callee.currentCalll.meetId}); //send meetId to join socket room on connect;
};