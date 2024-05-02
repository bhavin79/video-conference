import { Button, Card, CardBody, Center, Grid, GridItem, Input, Text } from "@chakra-ui/react";
import { useRef } from "react";
import { useCallback } from "react";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import ReactPlayer from "react-player";
import { callAcceptApiCall, callApiCall, callEndApiCall, historyApiCall, ping } from "../../service/apiCalls";
import { useAuth } from "../conextAPI/authContext";
import { useNavigate } from "react-router-dom";
import HomeScreen from "../home/HomeScreen";

//TODO: Figure out how to stop stream. 
//TODO: start with CSS;


const Call = ()=>{
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [emailId, setEmailId] = useState("");
    const navigate = useNavigate();
    const {loggedIn} = useAuth();
    const socketRef = useRef(null);
    const [audio, setAudio] = useState(true);
    const [gotCall, setGotCall] = useState(false);
    const [inCommingEmailId, setInComingEmailId] = useState("");
    const [history, setHistory] = useState([]);
    const [mediaRestart, setMediaRestart] = useState(false);

    useEffect(()=>{
        if (!loggedIn){
          return navigate("/login");
        }
    },[loggedIn])

    const fectchHistory = async()=>{
        let emailId = localStorage.getItem("username");
        let response = await historyApiCall({emailId});
        setHistory(response.data);
    }
    useEffect(()=>{
        try {
            fectchHistory();
        } catch (error) { 
        }
    },[])

    socketRef.current = new io("localhost:8000", {
            autoConnect: false,
            withCredentials:true,
        });


    const {current:socket} = socketRef;

    useEffect(()=>{
        socket.connect();
        socket.on('connect', ()=>{})
    }, [socket]);

    const peerConnection = useRef(null);
    
    const connectPeerConnect = useCallback(async()=>{
        const configuration = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]}
        peerConnection.current = new RTCPeerConnection(configuration);
    },[peerConnection])

    useEffect(()=>{
        connectPeerConnect();
        // startVideoAudio();
    },[]);

    const startVideoAudio =  async()=>{
        let stream = await navigator.mediaDevices.getUserMedia({video:true, audio:false});
        // setLocalStream(stream); 
        stream.getTracks().forEach(track => {
            peerConnection.current.addTrack(track, stream);
        });
        return true;
    };

    const showMyStream =async()=>{
        let stream = await navigator.mediaDevices.getUserMedia({video:true, audio:false});
        setLocalStream(stream); 
    }


    const handleCall = useCallback(async()=>{
        let media = await startVideoAudio();
        if(media){
            try {
                const response = await callApiCall({emailId: emailId}); 
                if(response){
                    socket.emit("call-initiated-join-room", {meetId: response.data.meetId, tag:"caller"});
                }
            } catch (error) {
                console.log(error);
            }
        }
    },[socket])

    const handleSendOffer = useCallback(async()=>{
        try {
            setInComingEmailId("");
            console.log("peer connection in send offer",peerConnection);
                const offer = await peerConnection.current.createOffer();
                await peerConnection.current.setLocalDescription(offer);
                console.log("sent offer", {offer});
                const data = {offer: offer}
                socket.emit("offer", {data});            
        } catch (error) {
            console.log(error);
        }
    }, [socket, peerConnection]);
       
    const handleOffer = useCallback(async(data)=>{
        const {msg:offer} = data;
        console.log("handle offer",offer);
        peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);
        console.log(answer, "loacal answer");
        socket.emit("answer", {answer: answer});
        
    },[socket, peerConnection]);


    const handleAnswer = useCallback(async(data)=>{
        console.log("Got answer");
        console.log(data);
        const remoteDesc = new RTCSessionDescription(data.msg);
        console.log(data.msg, "ANswer");
        await peerConnection.current.setRemoteDescription(remoteDesc);
    },[peerConnection])

    const handleIceCandidate = useCallback((event)=>{
        if (event.candidate) {
            console.log("Ice generated"); 
            if (event.candidate) {
                const candiates = event.candidate
                socket.emit("icecandidate", {candiates, emailId});
            }
        }
    },[socket, peerConnection])

    const handleIncomingIceCandidate = useCallback( async(data)=>{
        console.log("Incomming ICe");
        console.log(peerConnection.current.remoteDescription, "REMOTE DESCRIPTION");
        if(peerConnection.current.remoteDescription){
            try {
                await peerConnection.current.addIceCandidate(data.msg);
            } catch (e) {
                console.error('Error adding received ice candidate', e);
            }
        }
    }, [peerConnection]);

 
    const handleIsConnected = useCallback(async (event)=>{
        if(peerConnection.current.connectionState === 'connected'){
            console.log("connection stable");
            setGotCall(false);
            await showMyStream();
        }
    },[peerConnection])

    const handleIncomingTracks = useCallback(async (event)=>{
            setRemoteStream(event.streams[0]);
        },[]);

    const handleAcceptCall = useCallback( async(remoteEmailId)=>{
        if (!remoteEmailId) {
            console.log("Remote EmailID missing");
            return;
          }
          let media = await startVideoAudio();
          if(media){
            try {
                let response = await callAcceptApiCall({emailId: remoteEmailId});
                if(response){
                    socket.emit("call-initiated-join-room", {meetId: response.data.meetId, tag:"callee"});
                    await handleSendOffer();
                }
            } catch (error) {
            }
          }
          
    },[socket]);
    


    const handleIncommingCall = async (data)=>{
        console.log(data.emailId,"is calling");
        setGotCall(true);
        setInComingEmailId(data.emailId);
    };


    const senderList = async()=>{
        if(peerConnection.current){
            const senders = peerConnection.current.getSenders();
            console.log(senders);
        } 
    }

    const handleCallEnd = useCallback( async()=>{
        peerConnection.current.close();
        setRemoteStream(null);
        if (localStream) {
            console.log("stop me")
            localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
          }
        // setLocalStream(null);
        let response = await  callEndApiCall();
        if(response){
            connectPeerConnect();
        }
    }, [peerConnection])

    const handleLocalCallEnd = useCallback( async()=>{
        peerConnection.current.close();
        setRemoteStream(null);
        if (localStream) {
            console.log("stop me")

            localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
          }
        // setLocalStream(null);
        socket.emit("callEnd", {msg: "call end"});
        let response = await  callEndApiCall();
        if(response){
            connectPeerConnect();
        }
    
    },[peerConnection, socket]);



    useEffect(()=>{
        socket.on("offer:receive", handleOffer);
        socket.on("answer:received", handleAnswer);
        socket.on("call", handleIncommingCall);
        socket.on("icecandidate:receive", handleIncomingIceCandidate);
        socket.on("callEnd:receive", handleCallEnd);

        peerConnection.current.addEventListener('icecandidate', handleIceCandidate);
        peerConnection.current.addEventListener('connectionstatechange',handleIsConnected);
        peerConnection.current.addEventListener('track', handleIncomingTracks);
        peerConnection.current.addEventListener("icecandidateerror", (event) => {
            console.log(event.errorText);
        });

        return ()=>{
            socket.off("offer:receive", handleOffer);
            socket.off("answer:received", handleAnswer);
            socket.off("icecandidate:receive", handleIncomingIceCandidate);
            socket.off("call", handleIncommingCall);

            if (peerConnection.current) {
                peerConnection.current.removeEventListener('icecandidate', handleIceCandidate);
                peerConnection.current.removeEventListener('connectionstatechange',handleIsConnected);
                peerConnection.current.removeEventListener('track', handleIncomingTracks);
            } 
        }

    },[socket, handleOffer, handleAnswer, handleIceCandidate, handleIncomingIceCandidate, handleIsConnected, handleIncomingTracks, peerConnection])



    let audioString = audio?"enabled":"disabled"
    return <>
        <div>
        <div className="grid grid-cols-6 h-screen">
            <div className=" grid col-start-1 col-end-3 overflow-auto">
                <div className="flex flex-col m-2">
                    <div className=" flex border border-solid">
                        <input  name="emailId"
                            className="input"
                            type="email"
                            placeholder="example@example.com" 
                            value={emailId}
                            onChange={(e)=>setEmailId(e.target.value)}
                            /> 
                        <button className="btn" onClick={handleCall} >Call!</button>
                    </div>
                    <div className="">
                    {history.map((his=>{
                        let accepted = his.Accpeted?"Received":"Misscalled";
                        return <div className="flex flex-col border border-solid my-2">
                            <span className="flex flex-row justify-between">
                                <p>{his.calleeEmailId}</p>
                                <p>{accepted}</p>
                            </span>
                             <p className="">{his.Timestamp}</p>
                        </div>
                    }))}
                    </div>
                </div>
            </div>
            <div className="col-start-3 col-end-7">
                {localStream &&
                <div><h1>YOUR STREAM</h1>
                    <ReactPlayer playing muted
                    width="40%"
                    height="40%"
                    // className="object-cover"
                    url={localStream}></ReactPlayer>
                    </div>
                }

                {remoteStream && 
                    <ReactPlayer playing muted 
                    width="40%"
                    height="40%"
                    url={remoteStream}></ReactPlayer>
                } 
            </div>
        </div>
            {gotCall &&
                <dialog open id={"Call"} className="modal">
                <div className="modal-box">
                <p className="text-xl">{inCommingEmailId} is calling...</p>
                <form method="dialog">
                    <div className="flex justify-evenly my-4">
                        <button className="btn" onClick={()=>handleAcceptCall(inCommingEmailId)}> Accept</button>
                        <button className="btn" onClick={()=>{
                            setGotCall(false); 
                            setInComingEmailId("");}}>Reject</button>
                    </div>

                  </form>
                </div>
            </dialog>
            } 
        {remoteStream &&  <div>
                <button className="btn" onClick={()=>handleLocalCallEnd()} sx={{margin:"1.2rem"}}>end</button>
        </div>}
       <div>
       </div>
    </div> 
    </>
}

export default Call;