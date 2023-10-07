import { useCallback, useEffect, useState } from "react";
import { io } from "socket.io-client";
import peer from "../service/peer"
import ReactPlayer from "react-player";


const Meet=()=>{    
    const socket = new io("localhost:8000", {
        autoConnect: false,
        withCredentials:true,
    });
    const [message , setMessage] = useState();
    const [participantJoined, setParticipantJoined] = useState(null);
    const [owerNameEmit, setOwerNameEmit] = useState(null);
    const [myStream, setMyStream] = useState(null);
    const [offerSent, setOfferSent] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const handleParticipantJoin = useCallback( async(data)=>{
        setParticipantJoined(data.emailId);
        await startVideo();
    },[]);

    const startVideo =  useCallback( async ()=>{
            const stream = await navigator.mediaDevices.getUserMedia({audio:true, video:true});
            setMyStream(stream);
            const offer = await peer.getOffer();
            console.log("offer-callStart", offer);
            socket.emit("call", {offer});
            setOfferSent(true);
        },[participantJoined, socket]);

    const handleInComingCall = useCallback( async ({ emailId, offer})=>{
        //start live stream
        if(!offerSent){
            await startVideo();
            setParticipantJoined(emailId);
        }

        const ans = await peer.getAnswer(offer);
        const stream = await navigator.mediaDevices.getUserMedia({audio:true});
        setMyStream(stream);
        // console.log("answer-incoming",ans);
        socket.emit('callAccepted', {ans});
    },[socket]);
   
    const sendStreams = useCallback(()=>{
        for(const track of myStream.getTracks()){
            peer.peer.addTrack(track, myStream);
        }
    }, [myStream]);

    const handleCallAccepted = useCallback( async({ans}) =>{
        console.log("Answer from the call accepted");
        console.log( "Call accepted",ans);
        sendStreams();
    }, [sendStreams]);
   
    const handleNegotiationNeeded= useCallback(async()=>{
        const offer = await peer.getOffer();
        socket.emit('peer:nego:needed', {offer});
    }, []);

    const handleNegotiationIncoming = useCallback(async({offer})=>{
        const ans = await peer.getAnswer(offer);
        socket.emit('peer:nego:done', {ans});
    },[socket]);

    const handleNegotiationFinal = useCallback(async({ans})=>{
        // await peer.setLocalDescription(ans);
        socket.emit('peer:nego:done', {ans});
    },[]);

    useEffect(()=>{
        peer.peer.addEventListener('negotiationneeded', handleNegotiationNeeded)
        return ()=>{
            peer.peer.removeEventListener('negotiationneeded', handleNegotiationNeeded)
        }
    },[handleNegotiationNeeded]);

    useEffect(()=>{
        peer.peer.addEventListener('track', async ev=>{
            console.log("GOT TRACKS!!");
            setRemoteStream(ev.streams[0])
        })
    },[])

    useEffect(()=>{
        socket.connect();
        socket.on("Connect", ()=>{});
    }, [socket]);


    useEffect(()=>{  
        if(participantJoined == null){
            socket.on("participant:joined",handleParticipantJoin);
            socket.emit("waiting:joined", {msg: "I am here"});
        }
        socket.on("receive", handleInComingCall);
        
        socket.on("callAccepted", handleCallAccepted);
        
        socket.on('peer:nego:needed', handleNegotiationIncoming);

        socket.on("peer:nego:final", handleNegotiationFinal);
        return ()=>{
            socket.off("participant:joined",handleParticipantJoin);
            socket.off("participant:joined", handleParticipantJoin);
            socket.off("receive", handleInComingCall);
            socket.off("callAccepted", handleCallAccepted);
            socket.off('peer:nego:needed', handleNegotiationIncoming);
            socket.off("peer:nego:final", handleNegotiationFinal);
        }
    },[socket, handleInComingCall, handleNegotiationIncoming, handleNegotiationFinal])
    return (<>
        This is the main room. Here we will have IO socket connetion.
        {participantJoined && <>
            <br></br>
            {participantJoined} has joined;
            <button onClick={sendStreams}>Send Stream</button>
        </> }
            {message};
        {myStream && (
        <>
          <h1>My Stream</h1>
          <ReactPlayer
            playing
            muted
            height="100px"
            width="200px"
            url={myStream}
          />
        </>
      )}
      {remoteStream && (
        <>
          <h1>Remote Stream</h1>
          <ReactPlayer
            playing
            muted
            height="100px"
            width="200px"
            url={remoteStream}
          />
        </>
      )}
        {}
    </>)
}
export default Meet;