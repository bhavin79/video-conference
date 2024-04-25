import axios from "axios";

const backend = axios.create({
    baseURL: "http://localhost:8000",   
    withCredentials:true
})

const loginApiCall= async(data)=>{
    let response = await backend.post("/user/login", data);
    return ;
}
const signUpApiCall = async(data)=>{
    let response = await backend.post("/user/signup", data);
    return;
}

const createMeetApiCall = async(data)=>{
    let response = await backend.post("meeting/createMeet", data);
    return response;
}

const joinMeetApiCall = async(data)=>{
    let response = await backend.post("meeting/join", data);
    return response;
}

const ping = async()=>{
    let response = await backend.get("meeting/ping");
    return response;
}

const logoutApiCall = async()=>{
    let response = await backend.get("logout");
    return response;
}

const callApiCall = async(data)=>{
    let response = await backend.post("call/call", data);
    return response;
}

const callAcceptApiCall = async(data)=>{
    let response = await backend.post("call/callAccept", data);
    return response;
}
export {loginApiCall, signUpApiCall, createMeetApiCall, joinMeetApiCall, ping, logoutApiCall, callApiCall, callAcceptApiCall};