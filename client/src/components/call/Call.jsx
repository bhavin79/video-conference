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
  ping,
} from "../../service/apiCalls";
import { useAuth } from "../conextAPI/authContext";
import { useNavigate } from "react-router-dom";
import { IoIosSearch } from "react-icons/io";

const Call = () => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [emailId, setEmailId] = useState("");
  const navigate = useNavigate();
  const { loggedIn, logoutHandle } = useAuth();
  const socketRef = useRef(null);
  const [audio, setAudio] = useState(true);
  const [gotCall, setGotCall] = useState(false);
  const [inCommingEmailId, setInComingEmailId] = useState("");
  const [history, setHistory] = useState([]);
  const [makeCall, setMakeCall] = useState(false);
  const [reload, setReload] = useState();
  useEffect(() => {
    if (!loggedIn) {
      return navigate("/login");
    }
  }, [loggedIn]);

  const fectchHistory = async () => {
    let emailId = localStorage.getItem("username");
    try {
      let response = await historyApiCall({ emailId });
      setHistory(response.data);
    } catch (error) {
      logoutHandle();
      return navigate("/login");
    }
  };
  useEffect(() => {
    fectchHistory();
  }, [reload]);

  socketRef.current = new io("localhost:8000", {
    autoConnect: false,
    withCredentials: true,
  });

  const { current: socket } = socketRef;

  useEffect(() => {
    const dummyOnConnect = () => {};
    socket.connect();
    socket.on("connect", dummyOnConnect);
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
          const response = await callApiCall({ emailId: emailId });
          if (response) {
            socket.emit("call-initiated-join-room", {
              meetId: response.data.meetId,
              tag: "caller",
            });
          }
        } catch (error) {
          console.log(error);
        }
      }
    },
    [socket, makeCall]
  );

  const handleSendOffer = useCallback(async () => {
    try {
      setInComingEmailId("");
      console.log("peer connection in send offer", peerConnection);
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

  let audioString = audio ? "enabled" : "disabled";
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
                    <div className="card flex-col bg-custom-blue shadow-xl">
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
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-full text-white"
                        onClick={() => handleLocalCallEnd()}
                      >
                        X
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex overflow-auto basis-1/3 bg-custom-white px-10 py-4">
            <div className="flex flex-col">
              <div className="flex flex-row">
                <label className="input input-bordered flex items-center gap-2 h-10 w-80">
                  {/* Search input */}
                  <IoIosSearch />
                  <input
                    name="emailId"
                    className="grow py-1"
                    type="email"
                    placeholder="email"
                    value={emailId}
                    onChange={(e) => setEmailId(e.target.value)}
                  />
                </label>

                {/* Call button */}
                <button
                  disabled={remoteStream}
                  className="ml-5 slef-end rounded-md px-3 py-2 bg-white border h-10"
                  onClick={async () => {
                    handleCall();
                  }}
                >
                  Call!
                </button>
              </div>
              <div className="pt-4 flex flex-col divide-y-[0.5px] divide-[#7597BF]">
                {/* Call history */}
                {history.length > 0 &&
                  history.map((his, index) => {
                    let accepted = his.Accpeted ? "Accepted" : "Rejected";
                    his.calleeEmailId =
                      his.calleeEmailId[0].toUpperCase() +
                      his.calleeEmailId.slice(1);
                    let timeDate = new Date(his.Timestamp);
                    const yesterdayDate = new Date();

                    if (
                      yesterdayDate.toISOString().split("T")[0] ==
                      timeDate.toISOString().split("T")[0]
                    ) {
                      let ampm = timeDate.getHours() >= 12 ? "PM" : "AM";
                      let hours = timeDate.getHours() % 12;
                      hours = hours ? hours : 12;
                      let minutes =
                        timeDate.getMinutes() < 10
                          ? "0" + timeDate.getMinutes()
                          : timeDate.getMinutes();
                      timeDate = `${hours}: ${minutes} ${ampm}`;
                    } else {
                      timeDate = `${
                        timeDate.getMonth() + 1
                      }/${timeDate.getDate()}`;
                    }
                    return (
                      <div className="flex flex-col my-2 p-4" key={index}>
                        <span className="flex flex-row justify-between">
                          <p>{his.calleeEmailId}</p>
                          <p className="">{accepted}</p>
                        </span>
                        <p className="self-start">{timeDate}</p>
                      </div>
                    );
                  })}
              </div>
            </div>
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
        {/* Make Call Pop UP */}
        {makeCall && (
          <dialog open id={"MakeCallAgain"} className="modal">
            <div className="modal-box">
              <p className="text-xl">You are calling {emailId}</p>
              <form method="dialog">
                <div className="flex justify-evenly my-4">
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
