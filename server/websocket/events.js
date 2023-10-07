import { getStoredMeetId, updateStoredMeetInfo } from "../data/meets.js";
import { validUUID } from "../utils/validatiton.js";
import { getUser } from "../data/users.js";
const meetingSetUp = async(emailId, meetId)=>{
    meetId = validUUID(meetId);
   //fetch the meet info;
   let meetInfo;
   try {
     meetInfo = await getStoredMeetId(meetId);
   } catch (error) {
        throw error;
    }
    //if email belongs to owner
    if(meetInfo.owner.emailId === emailId){
        //if participant is not connected yet
        if(users.permission==""){
            return "Participant yet to join";
        }
        //else 
        return;
    }
    //if email belongs to participant
    if(meetInfo.user.emailId == emailId){
        //update meetinfo permission;
        if(meetInfo.user.permission == ""){
            try {
               const updatedPermisionObject =  await updateStoredMeetInfo(meetId, emailId, "unresolved");
               return "setPermission"; 
            } catch (error) {
                return error;
            }
        }
    }
}


const websocketEvenets = async (socket)=>{

}

export default websocketEvenets;