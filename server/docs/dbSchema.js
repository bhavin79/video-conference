const User={
    _id: String,
    email: String,
    Password: String,
    PreviousCalls:[
        {
            calleeID: String, //User Id
            Accpeted: Boolean, 
            Timestamp: Date,
            emailID: String,
        }
    ],
    currentCalll: {
        CallTo: String, //Email Id
        meetId: String, //id
    } //empty if free or room id. for socket communication. 
}


// Database calls
const call =(emailId); //Create meetid => ping the calleeId using websocket with emailId; 
 
const acceptCall =(emailIdCallee); //Add currentCall->update call history also -> start webRTC from client;

const rejectCall =(emailIdCallee); // reject -> websocket to callee; callee makes websocket call to leave room -> then removeCurrentCallinfo() to mkae callee free. -> update call history also 

const cutCall = ({}); // cut-> webocket to callee; then cutCall() to remove currentCall;