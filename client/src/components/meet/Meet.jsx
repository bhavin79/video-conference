import { Button, Grid, GridItem } from "@chakra-ui/react";
import { useRef } from "react";
import { useCallback } from "react";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import ReactPlayer from "react-player";
import { ping } from "../../service/apiCalls";

const Meet = ()=>{
    const [participantPresent, setPartcipantPresent] = useState(null);
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    
    const socket = new io("localhost:8000", {
            autoConnect: false,
            withCredentials:true,
        });

    // let peerConnection = undefined;
    const peerConnection = useRef(null);
    
    useEffect(()=>{
        const configuration = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]}
        peerConnection.current = new RTCPeerConnection(configuration);
        startVideoAudio();
        return ()=>{
            if(peerConnection.current){
                peerConnection.current.close();
            }
        }
        
    },[]);

    const startVideoAudio =  async()=>{
        const stream = await navigator.mediaDevices.getUserMedia({video:true});
        setLocalStream(stream); 
        stream.getTracks().forEach(track => {
            console.log(track);
            peerConnection.current.addTrack(track, stream);
        });
    };

    const handleSendOffer = useCallback(async()=>{
        try {
            console.log("peer connection in send offer",peerConnection);
            const offer = await peerConnection.current.createOffer();
            await peerConnection.current.setLocalDescription(offer);
            console.log("sent offer", offer);
            const data = {offer: offer}
            socket.emit("offer", {data});
        } catch (error) {
            console.log(error);
        }
    }, [socket, peerConnection]);

    const handleUser2Joined = useCallback(async({emailId})=>{
        if(!participantPresent){
            // socket.emit("user:Present", {msg:"I am here"});
            await ping();
        }
        setPartcipantPresent(emailId);
        await handleSendOffer();
        // if(localStream){
        //     localStream.getTracks().forEach(track => {
        //         peerConnection.current.addTrack(track, localStream);
        // });
        // }
    }, [socket, participantPresent]); 

   
    
    const handleOffer = useCallback(async(data)=>{
        const {msg:offer} = data;
        console.log("handle offer",offer);
        peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);
        socket.emit("answer", {answer});
    },[socket, peerConnection]);


    const handleAnswer = useCallback(async({answer})=>{
        console.log("Got answer");
        const remoteDesc = new RTCSessionDescription(answer);
        await peerConnection.current.setRemoteDescription(remoteDesc);
    },[peerConnection])

    const handleIceCandidate = useCallback((event)=>{
        if (event.candidate) {
            // console.log(event.candidate);
            const candiates = event.candidate
            socket.emit("icecandiate", {candiates});
            // socket.on({'new-ice-candidate': event.candidate});
        }
    },[socket])

    const handleIncomingIceCandidate = useCallback( async(data)=>{
        try {
            await peerConnection.current.addIceCandidate(data.msg.candiates);
        } catch (e) {
            console.error('Error adding received ice candidate', e);
        }
    }, [peerConnection]);


    const handleIsConnected = useCallback((event)=>{
        if(peerConnection.current.connectionState === 'connected'){
            console.log("connection stable");
        }
    },[peerConnection])

    const handleIncomingTracks = useCallback(async (event)=>{
            console.log("incoming stream", event.streams);
            if(event.streams){
                setRemoteStream(event.streams[0]);
            }
        },[]);
    useEffect(()=>{
        socket.connect();
        socket.on("Connect", ()=>{});
    }, [socket]);

    // useEffect(()=>{
    //     socket.on("test", ()=>{
    //         console.log("testing remote socket");
    //     })
    // },[socket])
    
    useEffect(()=>{  
        if(!participantPresent){
            console.log(participantPresent);
            socket.on("user:Present", handleUser2Joined)
            // socket.emit("user:Present",{msg:"I am here"});
            ping();
        }
        return ()=>{
            socket.off("user:Present", handleUser2Joined);  
        }
    },[socket, handleUser2Joined, participantPresent]);

    useEffect(()=>{
        socket.on("offer:receive", handleOffer);
        socket.on("answer:received", handleAnswer);

        peerConnection.current.addEventListener('icecandidate', handleIceCandidate);

        peerConnection.current.addEventListener('connectionstatechange',handleIsConnected);
        
        // peerConnection.current.addEventListener('track', handleIncomingTracks);
        // peerConnection.current.addEventListener("icecandidateerror", (event) => {
        //     console.log(event.errorText);
        // });
        socket.on("icecandiate:receive", handleIncomingIceCandidate);
        return ()=>{
            socket.off("offer:receive", handleOffer);
            socket.off("answer:received", handleAnswer);
            socket.off("icecandiate:receive", handleIncomingIceCandidate);
            if (peerConnection.current) {
                peerConnection.current.removeEventListener('icecandidate', handleIceCandidate);
                peerConnection.current.removeEventListener('connectionstatechange',handleIsConnected);
                // peerConnection.current.removeEventListener('track', handleIncomingTracks);
            } 
        }

    },[socket, handleOffer, handleAnswer, handleIceCandidate, handleIncomingIceCandidate, handleIsConnected])


    useEffect(()=>{
        peerConnection.current.addEventListener('track', handleIncomingTracks);
        peerConnection.current.addEventListener("icecandidateerror", (event) => {
            console.log(event.errorText);
        });
        return ()=>{
            if (peerConnection.current) {
                peerConnection.current.removeEventListener('track', handleIncomingTracks);
            } 
        }
    },[peerConnection, handleIncomingTracks]);




    return <>
        Hey there;
        {participantPresent && <>
            <h1>{participantPresent} has joined</h1>
            <Button onClick={()=>{handleSendOffer()}} marginBottom={20}>Send offer</Button>
        </>}
        <Grid templateColumns='repeat(2, 1fr)' gap={6}>
            <GridItem>
                <h2>Your stream</h2>
                {localStream && <ReactPlayer playing muted height="400px" width="400px" url={localStream}></ReactPlayer>
                }</GridItem>
            <GridItem>
                <h2>Remote user</h2>
                {remoteStream && <ReactPlayer playing muted height="400px" width="400px" url={remoteStream}></ReactPlayer>} 
                </GridItem>
        </Grid>
       
    </>
}

export default Meet;