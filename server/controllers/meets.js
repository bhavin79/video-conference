import { v4 as uuidV4 } from "uuid"
import {storeMeetId, getStoredMeetId, updateStoredMeetInfo} from "../data/meets.js"
import { validString, validUUID } from "../utils/validatiton.js";
import hash from "../utils/encryption.js"

export const createMeet = async(req, res)=>{
    console.log(req.session.user); 
    //  check if the user is logged in;
    if(typeof req.session.user.emailId == undefined){
        return res.status(403).json({msg: "Please log in"});
    }
    
    //validating input
    let {password} = req.body;
    try {
        password = validString(password, "password", 6);
    } catch (error) {
        return res.status(400).json({msg:error});
    }
    console.log("inside controller", password);
    //creating meetId
    const meetId = uuidV4();

    //adding it to the database; 
    try {
        await storeMeetId(meetId,req.session.user.emailId, password);
    } catch (error) {
       return res.status(400).json({msg: error});
    }
    req.session.user.meetId = meetId;
   return res.status(200).json({meetId: meetId}); //send the meet id;
} 

export const joinMeet = async(req, res)=>{ 
    //  check if the user is logged in;
    if(typeof req.session.user == undefined){
        return res.status(403).json({msg: "Please log in"});
    }

    let meetId = req.body.meetId;
    let password = req.body.password;
    //validating input
    try { 
        meetId = validUUID(meetId);
        password = validString(password, "password",6 ); 
    } catch (error) {
        return res.status(400).json({msg:error}); 
    } 
    //cchecking if the meeting exist and if does then checking if the password is correct;
    try {
        const result = await getStoredMeetId(meetId); //check if the id exist.
        req.session.user.meetId = meetId;
        
        if(result.user.emailId == req.session.user.emailId){ // if the user was already in the meet and wants to connect again;
            return res.status(200).json({msg:"succeed"})
        }
    
        //if the participant already added to the call database.
        //basically, if the a participant is already in the meeting then dont update the email id. 
         
        if(result.user.emailId.length != 0 ){
            return res.status(403).json({msg:"meeting is full"}); 
        }
        password = await hash.compareHash(password, result["password"]);
        if(result.owner.emailId === req.session.user.emailId){
           return res.status(200).json({msg: "succeed"});
        }
    } catch (error) {
        //TODO: rewrite this error messaage; 
       return res.status(400).json({msg:"Incorrect meetId or password"});
    }

    //if everything matches up. 
    //Updating the database and adding the user to the meet;
    try {
        const updateMeet = await updateStoredMeetInfo(meetId, req.session.user.emailId);
    } catch (error) {
        console.log(error);
        return res.status(500).json({msg:"something went wrong"}); 
    
    }
   return res.status(200).json({msg:"succeed"})
}
 