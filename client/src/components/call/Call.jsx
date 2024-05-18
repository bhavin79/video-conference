import { useRef } from "react";
import { useCallback } from "react";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import ReactPlayer from "react-player";
import {
  callAcceptApiCall,
  callApiCall,
  callEndApiCall,
  historyApiCall,
} from "../../service/apiCalls";
import { useAuth } from "../conextAPI/authContext";
import { useNavigate } from "react-router-dom";
import { IoIosSearch } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import { Sidebar } from "./SideBar";

const Call = () => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [emailId, setEmailId] = useState("");
  const navigate = useNavigate();
  const { loggedIn, logoutHandle } = useAuth();
  const socketRef = useRef(null);
  const [gotCall, setGotCall] = useState(false);
  const [inCommingEmailId, setInComingEmailId] = useState("");
  const [history, setHistory] = useState([]);
  const [reload, setReload] = useState();

  useEffect(() => {
    if (!loggedIn) {
      return navigate("/login");
    }
  }, [loggedIn]);

  socketRef.current = new io("localhost:8000", {
    autoConnect: false,
    withCredentials: true,
  });
  const { current: socket } = socketRef;

  useEffect(() => {
    socket.connect();
    console.log(socket);
  }, [socket]);

  const peerConnection = useRef(null);

  const connectPeerConnect = useCallback(async () => {
    const configuration = {
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    };
    peerConnection.current = new RTCPeerConnection(configuration);
  }, [peerConnection]);

  useEffect(() => {
    connectPeerConnect();
    // startVideoAudio();
  }, []);

  const startVideoAudio = async () => {
    let stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });
    // setLocalStream(stream);
    stream.getTracks().forEach((track) => {
      peerConnection.current.addTrack(track, stream);
    });
    return true;
  };

  const showMyStream = async () => {
    let stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });
    setLocalStream(stream);
  };

  const handleCall = useCallback(
    async (calleeEmailId) => {
      let media = await startVideoAudio();
      if (media) {
        try {
          const response = await callApiCall({ emailId: calleeEmailId }); //initiate the call;
          if (response) {
            socket.emit("call-initiated-join-room", {
              meetId: response.data.meetId,
            });
          }
        } catch (error) {
          console.log(error);
        }
      }
    },
    [socket]
  );

  const handleSendOffer = useCallback(async () => {
    try {
      setInComingEmailId("");
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
      console.log("sent offer", { offer });
      const data = { offer: offer };
      socket.emit("offer", { data });
    } catch (error) {
      console.log(error);
    }
  }, [socket, peerConnection]);

  const handleOffer = useCallback(
    async (data) => {
      const { msg: offer } = data;
      console.log("handle offer", offer);
      peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(offer)
      );
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);
      console.log(answer, "loacal answer");
      socket.emit("answer", { answer: answer });
    },
    [socket, peerConnection]
  );

  const handleAnswer = useCallback(
    async (data) => {
      console.log("Got answer");
      console.log(data);
      const remoteDesc = new RTCSessionDescription(data.msg);
      console.log(data.msg, "ANswer");
      await peerConnection.current.setRemoteDescription(remoteDesc);
    },
    [peerConnection]
  );

  const handleIceCandidate = useCallback(
    (event) => {
      if (event.candidate) {
        console.log("Ice generated");
        if (event.candidate) {
          const candiates = event.candidate;
          socket.emit("icecandidate", { candiates, emailId });
        }
      }
    },
    [socket, peerConnection]
  );

  const handleIncomingIceCandidate = useCallback(
    async (data) => {
      console.log("Incomming ICe");
      console.log(
        peerConnection.current.remoteDescription,
        "REMOTE DESCRIPTION"
      );
      if (peerConnection.current.remoteDescription) {
        try {
          await peerConnection.current.addIceCandidate(data.msg);
        } catch (e) {
          console.error("Error adding received ice candidate", e);
        }
      }
    },
    [peerConnection]
  );

  const handleIsConnected = useCallback(
    async (event) => {
      if (peerConnection.current.connectionState === "connected") {
        console.log("connection stable");
        setGotCall(false);
        // setMakeCall(false);
        await showMyStream();
      }
    },
    [peerConnection]
  );

  const handleIncomingTracks = useCallback(async (event) => {
    setRemoteStream(event.streams[0]);
  }, []);

  const handleAcceptCall = useCallback(
    async (remoteEmailId) => {
      if (!remoteEmailId) {
        console.log("Remote EmailID missing");
        return;
      }
      let media = await startVideoAudio();
      if (media) {
        try {
          let response = await callAcceptApiCall({ emailId: remoteEmailId });
          if (response) {
            socket.emit("call-initiated-join-room", {
              meetId: response.data.meetId,
              tag: "callee",
            });
            await handleSendOffer();
          }
        } catch (error) {}
      }
    },
    [socket]
  );

  const handleIncommingCall = async (data) => {
    console.log(data.emailId, "is calling");
    setGotCall(true);
    setInComingEmailId(data.emailId);
  };

  const senderList = async () => {
    if (peerConnection.current) {
      const senders = peerConnection.current.getSenders();
      console.log(senders);
    }
  };

  const handleCallEnd = useCallback(async () => {
    peerConnection.current.close();
    setRemoteStream(null);
    setLocalStream(null);
    setReload(reload + 1);
    setGotCall(false);

    let response = await callEndApiCall();
    if (response) {
      connectPeerConnect();
    }
  }, [peerConnection]);

  const handleLocalCallEnd = useCallback(async () => {
    peerConnection.current.close();
    setRemoteStream(null);
    setLocalStream(null);
    setReload(reload + 1);
    setGotCall(false);

    socket.emit("callEnd", { msg: "call end" });
    let response = await callEndApiCall();
    if (response) {
      connectPeerConnect();
    }
  }, [peerConnection, socket]);

  useEffect(() => {
    socket.on("offer:receive", handleOffer);
    socket.on("answer:received", handleAnswer);
    socket.on("call", handleIncommingCall);
    socket.on("icecandidate:receive", handleIncomingIceCandidate);
    socket.on("callEnd:receive", handleCallEnd);

    peerConnection.current.addEventListener("icecandidate", handleIceCandidate);
    peerConnection.current.addEventListener(
      "connectionstatechange",
      handleIsConnected
    );
    peerConnection.current.addEventListener("track", handleIncomingTracks);
    peerConnection.current.addEventListener("icecandidateerror", (event) => {
      console.log(event.errorText);
    });

    return () => {
      socket.off("offer:receive", handleOffer);
      socket.off("answer:received", handleAnswer);
      socket.off("icecandidate:receive", handleIncomingIceCandidate);
      socket.off("call", handleIncommingCall);

      if (peerConnection.current) {
        peerConnection.current.removeEventListener(
          "icecandidate",
          handleIceCandidate
        );
        peerConnection.current.removeEventListener(
          "connectionstatechange",
          handleIsConnected
        );
        peerConnection.current.removeEventListener(
          "track",
          handleIncomingTracks
        );
      }
    };
  }, [
    socket,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    handleIncomingIceCandidate,
    handleIsConnected,
    handleIncomingTracks,
    peerConnection,
  ]);

  return (
    <>
      <div>
        <div className="flex h-screen">
          <div className="w-2/3">
            <div className="flex h-full justify-center items-center w-full">
              {!remoteStream && (
                <div className="flex w-full justify-center items-center">
                  <p className="text-3xl"> Welcome</p>
                </div>
              )}
              <div
                className={`relative ${localStream ? "w-full" : "w-0"} h-full`}
              >
                {/* Local Stream - small video, positioned in the top left corner */}
                {localStream && (
                  <div
                    className="absolute top-[7%] left-0 m-4 z-20"
                    style={{ width: "20%", height: "20%" }}
                  >
                    <div className="card rounded-sm flex-col bg-custom-blue shadow-xl">
                      <ReactPlayer
                        playing
                        muted
                        width="100%"
                        height="100%"
                        url={localStream}
                      />
                      <p className="self-center text-white">You</p>
                    </div>
                  </div>
                )}

                {/* Remote Stream - big video */}
                {remoteStream && (
                  <div className="relative w-full h-full">
                    <ReactPlayer
                      className="absolute top-0 left-0 w-full h-full"
                      playing
                      muted
                      width="100%"
                      height="100%"
                      style={{ objectFit: "fill" }}
                      url={remoteStream}
                    />

                    {/* Call End Button - positioned in the bottom center */}
                    <div className="absolute bottom-[7%] left-1/2 transform -translate-x-1/2">
                      <button
                        className="px-4 py-4 bg-red-600 hover:bg-red-700 rounded-full text-white"
                        onClick={() => handleLocalCallEnd()}
                      >
                        <RxCross2 />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex overflow-auto basis-1/3 bg-custom-white px-10 py-4">
            <Sidebar
              handleCall={handleCall}
              remoteStream={remoteStream}
              handleLocalCallEnd={handleLocalCallEnd}
              reload={reload}
            />
          </div>
        </div>

        {/* Call Recived Pop Up */}
        {gotCall && (
          <dialog open id={"Call"} className="modal">
            <div className="modal-box">
              <p className="text-xl">{inCommingEmailId} is calling...</p>
              <form method="dialog">
                <div className="flex justify-evenly my-4">
                  <button
                    className="btn"
                    onClick={() => {
                      handleAcceptCall(inCommingEmailId);
                    }}
                  >
                    {" "}
                    Accept
                  </button>
                  <button
                    className="btn"
                    onClick={() => {
                      setGotCall(false);
                      setInComingEmailId("");
                    }}
                  >
                    Reject
                  </button>
                </div>
              </form>
            </div>
          </dialog>
        )}
      </div>
    </>
  );
};

export default Call;
